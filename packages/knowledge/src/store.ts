import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { CONTENT_COLLECTIONS, type Fm, type Graph, list, parse, str, walk } from "./graph";

/**
 * Builds knowledge/.cache/knowledge.db, a local SQLite store over knowledge/
 * and content/ for the `pnpm knowledge` CLI and the explorer.
 *
 * It holds what graph.json leaves out: full text in both locales (FTS5),
 * aliases, URLs, source claims, dated facts and events, and the edges that site
 * content implies (guide to services, non-EU service to its alternative, owner
 * company to services). The file is a cache: `pnpm knowledge:index` rebuilds it
 * from the markdown in about a second, so it is safe to delete.
 */

export const STORE_DIR = "knowledge/.cache";
export const STORE_FILE = "knowledge.db";

const SCHEMA = `
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE nodes (
  id TEXT PRIMARY KEY, type TEXT NOT NULL, kind TEXT, title TEXT NOT NULL, path TEXT,
  summary TEXT, updated TEXT, heat REAL, draft INTEGER, virtual INTEGER NOT NULL DEFAULT 0, data TEXT
);
CREATE TABLE edges (src TEXT NOT NULL, dst TEXT NOT NULL, rel TEXT NOT NULL, PRIMARY KEY (src, dst, rel));
CREATE INDEX edges_dst ON edges (dst);
CREATE TABLE aliases (alias TEXT NOT NULL, node_id TEXT NOT NULL, PRIMARY KEY (alias, node_id));
CREATE TABLE urls (url TEXT NOT NULL, href TEXT NOT NULL, node_id TEXT NOT NULL, role TEXT NOT NULL, label TEXT, checked_at TEXT, PRIMARY KEY (url, node_id, role));
CREATE INDEX urls_node ON urls (node_id);
CREATE TABLE facts (node_id TEXT NOT NULL, field TEXT NOT NULL, value TEXT NOT NULL, date TEXT, cite TEXT);
CREATE INDEX facts_node ON facts (node_id);
CREATE TABLE events (node_id TEXT NOT NULL, kind TEXT NOT NULL, date TEXT, title TEXT, source TEXT, url TEXT, summary TEXT);
CREATE INDEX events_node ON events (node_id);
CREATE TABLE claims (source_id TEXT NOT NULL, claim_id TEXT NOT NULL, text TEXT NOT NULL, PRIMARY KEY (source_id, claim_id));
CREATE TABLE chunk_meta (id INTEGER PRIMARY KEY, node_id TEXT NOT NULL, lang TEXT NOT NULL, heading TEXT, hash TEXT NOT NULL);
CREATE INDEX chunk_meta_node ON chunk_meta (node_id);
CREATE VIRTUAL TABLE chunks USING fts5(title, heading, text, tokenize = 'unicode61 remove_diacritics 2');
`;

export interface StoreStats {
  nodes: number;
  edges: number;
  chunks: number;
  facts: number;
  events: number;
  urls: number;
  claims: number;
  companies: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Lowercase, no accents, words separated by single spaces. Used for aliases. */
export function normalizeText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** host/path without scheme, `www.`, query, fragment or trailing slash. */
export function normalizeUrl(href: string): string {
  try {
    const u = new URL(href.trim());
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    return (host + u.pathname.replace(/\/+$/, "")).toLowerCase();
  } catch {
    return href.trim().toLowerCase();
  }
}

export function slugify(text: string): string {
  return normalizeText(text).replace(/ /g, "-");
}

const LEGAL_SUFFIX = /\s*,?\s+(ag|llc|inc\.?|corporation|corp\.?|gmbh|ggmbh|b\.?v\.?|s\.?a\.?s?\.?|ltd\.?|limited|pbc|plc|group|holdings?|ab|aps|oy|se|s\.r\.l\.|e\.v\.|n\.v\.)$/i;

/** "Google LLC (Alphabet Inc.)" -> "Google". */
export function companyName(parentCompany: string): string {
  let name = parentCompany.split("(")[0]!.trim();
  while (LEGAL_SUFFIX.test(name)) name = name.replace(LEGAL_SUFFIX, "").trim();
  return name;
}

function date(value: unknown): string | null {
  const s = str(value);
  return s ? s.slice(0, 10) : null;
}

function hash(text: string): string {
  return crypto.createHash("sha1").update(text).digest("hex");
}

/**
 * Splits markdown at headings. Long sections are split again at paragraphs, so
 * a search hit points at a passage, not a whole page.
 */
export function chunkMarkdown(markdown: string, maxChars = 1400): { heading: string; text: string }[] {
  const clean = markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/\r/g, "");
  const sections: { heading: string; lines: string[] }[] = [{ heading: "", lines: [] }];
  for (const line of clean.split("\n")) {
    const h = /^#{1,4}\s+(.+)$/.exec(line);
    if (h) sections.push({ heading: h[1]!.trim(), lines: [] });
    else sections[sections.length - 1]!.lines.push(line);
  }
  const out: { heading: string; text: string }[] = [];
  for (const { heading, lines } of sections) {
    let buf = "";
    for (const para of lines.join("\n").split(/\n\s*\n/)) {
      const p = para.trim();
      if (!p) continue;
      if (buf && buf.length + p.length > maxChars) {
        out.push({ heading, text: buf });
        buf = "";
      }
      buf = buf ? `${buf}\n\n${p}` : p;
    }
    if (buf) out.push({ heading, text: buf });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

/** Research fields copied into `facts`, dated with lastResearchedAt. */
const RESEARCH_FACTS = [
  "headquarters",
  "parentCompany",
  "foundedYear",
  "employeeCount",
  "gdprCompliance",
  "gdprNotes",
  "dataStorageLocations",
  "certifications",
  "openSource",
  "pricingDetails",
];
/** Listing fields copied into `facts`, dated with updatedAt. */
const LISTING_FACTS = ["region", "category", "location", "freeOption", "startingPrice", "recommendedAlternative"];

export function buildStore(root: string, graph: Graph): StoreStats {
  const dir = path.join(root, STORE_DIR);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `${STORE_FILE}.tmp-${process.pid}`);
  fs.rmSync(tmp, { force: true });
  const db = new DatabaseSync(tmp);
  db.exec(SCHEMA);
  db.exec("BEGIN");

  const insNode = db.prepare(
    "INSERT OR IGNORE INTO nodes (id, type, kind, title, path, summary, updated, heat, draft, virtual, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const setSummary = db.prepare("UPDATE nodes SET summary = ? WHERE id = ? AND (summary IS NULL OR summary = '')");
  const insEdge = db.prepare("INSERT OR IGNORE INTO edges (src, dst, rel) VALUES (?, ?, ?)");
  const insAlias = db.prepare("INSERT OR IGNORE INTO aliases (alias, node_id) VALUES (?, ?)");
  const insUrl = db.prepare(
    "INSERT OR REPLACE INTO urls (url, href, node_id, role, label, checked_at) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insFact = db.prepare("INSERT INTO facts (node_id, field, value, date, cite) VALUES (?, ?, ?, ?, ?)");
  const insEvent = db.prepare(
    "INSERT INTO events (node_id, kind, date, title, source, url, summary) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const insClaim = db.prepare("INSERT OR IGNORE INTO claims (source_id, claim_id, text) VALUES (?, ?, ?)");
  const insChunkMeta = db.prepare("INSERT INTO chunk_meta (node_id, lang, heading, hash) VALUES (?, ?, ?, ?)");
  const insChunk = db.prepare("INSERT INTO chunks (rowid, title, heading, text) VALUES (?, ?, ?, ?)");
  const findAlias = db.prepare(
    "SELECT n.id FROM aliases a JOIN nodes n ON n.id = a.node_id WHERE a.alias = ? AND n.type = 'entity' LIMIT 1"
  );

  const alias = (text: string | undefined, id: string) => {
    const a = text ? normalizeText(text) : "";
    if (a) insAlias.run(a, id);
  };
  const url = (href: unknown, id: string, role: string, label?: unknown, checkedAt?: unknown) => {
    const h = str(href);
    if (h && /^https?:\/\//.test(h)) insUrl.run(normalizeUrl(h), h, id, role, str(label) ?? null, date(checkedAt));
  };
  const chunk = (id: string, lang: string, title: string, heading: string, text: string) => {
    const meta = insChunkMeta.run(id, lang, heading, hash(`${lang}\n${heading}\n${text}`));
    insChunk.run(meta.lastInsertRowid, title, heading, text);
  };
  const fact = (id: string, field: string, value: unknown, when: string | null, cite?: string | null) => {
    const v = Array.isArray(value) ? list(value).join(", ") : str(value) ?? (typeof value === "boolean" ? String(value) : undefined);
    if (v) insFact.run(id, field, v, when, cite ?? null);
  };

  // Graph nodes and edges come from buildGraph, so validation stays in one place.
  for (const [id, n] of Object.entries(graph.nodes)) {
    insNode.run(
      id,
      n.type,
      n.kind ?? null,
      n.title,
      n.path,
      n.summary ?? null,
      n.updated ?? n.published ?? n.last_event ?? null,
      n.heat ?? null,
      n.draft ? 1 : 0,
      0,
      JSON.stringify(n)
    );
  }
  for (const e of graph.edges) insEdge.run(e.from, e.to, e.rel);

  // Knowledge notes: aliases, claims, dated facts, timelines, full text.
  for (const file of ["sources", "entities", "stories"].flatMap((d) => walk(path.join(root, "knowledge", d)))) {
    const id = path.basename(file, ".md");
    const node = graph.nodes[id];
    if (!node) continue;
    const f = parse(file, root, id);
    alias(str(f.data.name), id);
    alias(str(f.data.title), id);
    alias(id.replace(/-/g, " "), id);
    for (const a of list(f.data.aliases)) alias(a, id);
    if (node.type === "source") {
      url(f.data.url, id, "source", f.data.publisher, f.data.fetched);
      for (const m of f.body.matchAll(/^\s*-\s*`(c\d+)`\s*(.+)$/gm)) insClaim.run(id, m[1]!, m[2]!.trim());
    }
    for (const m of f.body.matchAll(/^- (~~)?(\d{4}-\d{2}-\d{2}) · (.+?)(?:~~)?(?: superseded \d{4}-\d{2}-\d{2})?\s*((?:\[\[[^\]]+\]\]\s*)*)$/gm)) {
      const [, struck, when, text, cites] = m;
      if (node.type === "story") insEvent.run(id, "timeline", when!, text!.trim(), null, null, cites?.trim() || null);
      else fact(id, struck ? "superseded" : "fact", text!.trim(), when!, cites?.trim() || null);
    }
    for (const c of chunkMarkdown(f.body)) chunk(id, "en", node.title, c.heading, c.text);
  }

  // Open flags from news, attached to the service they flag.
  const flags = path.join(root, "knowledge/flags.md");
  if (fs.existsSync(flags)) {
    for (const m of fs.readFileSync(flags, "utf8").matchAll(/^- (\d{4}-\d{2}-\d{2}) · (services\/[a-z0-9-]+) · (.+?) · (\[\[.+\]\])\s*$/gm)) {
      insEvent.run(m[2]!, "flag", m[1]!, m[3]!.trim(), null, null, m[4]!);
    }
  }

  // Site content: full text in both locales, research facts, URLs, events,
  // and the edges that frontmatter relations imply.
  const companies = new Map<string, { services: string[]; parents: Set<string> }>();
  for (const [collection, type] of Object.entries(CONTENT_COLLECTIONS)) {
    for (const enFile of walk(path.join(root, "content", collection)).filter((f) => f.endsWith("/en.md"))) {
      const slug = path.basename(path.dirname(enFile));
      const id = `${collection}/${slug}`;
      if (!graph.nodes[id]) continue;
      const en = parse(enFile, root, id);
      const nlFile = path.join(path.dirname(enFile), "nl.md");
      const nl = fs.existsSync(nlFile) ? parse(nlFile, root, id) : null;
      const d = en.data;
      const title = str(d.name) ?? str(d.title) ?? slug;
      const updated = date(d.updatedAt);
      const researched = date(d.lastResearchedAt);

      setSummary.run(str(d.description) ?? null, id);
      alias(title, id);
      alias(slug.replace(/-/g, " "), id);
      if (nl) alias(str(nl.data.name) ?? str(nl.data.title), id);

      chunk(id, "en", title, "Profile", profile(d));
      if (nl) chunk(id, "nl", title, "Profiel", profile({ ...d, ...nl.data }));
      for (const c of chunkMarkdown(en.body)) chunk(id, "en", title, c.heading, c.text);
      if (nl) for (const c of chunkMarkdown(nl.body)) chunk(id, "nl", title, c.heading, c.text);
      const notes = str(d.researchNotes);
      if (notes) for (const c of chunkMarkdown(notes)) chunk(id, "en", title, `Research: ${c.heading}`, c.text);

      if (type === "service") {
        // A fact is as fresh as the newer of the research run and the check of
        // the page it cites (sourceUrls[].checkedAt).
        const checked = new Map<string, string>();
        for (const s of (Array.isArray(d.sourceUrls) ? d.sourceUrls : []) as Fm[]) {
          const href = str(s.url);
          const when = date(s.checkedAt);
          if (href && when) checked.set(normalizeUrl(href), when);
        }
        const citeOf: Record<string, unknown> = { pricingDetails: d.pricingUrl, gdprNotes: d.privacyPolicyUrl, gdprCompliance: d.privacyPolicyUrl };
        for (const field of RESEARCH_FACTS) {
          const cite = str(citeOf[field]);
          const seen = cite ? checked.get(normalizeUrl(cite)) : undefined;
          fact(id, field, d[field], [researched, seen].filter((x): x is string => !!x).sort().pop() ?? null, cite ?? null);
        }
        for (const field of LISTING_FACTS) fact(id, field, d[field], updated);
        const tiers = Array.isArray(d.pricingTiers) ? (d.pricingTiers as Fm[]) : [];
        if (tiers.length) {
          fact(id, "pricingTiers", tiers.map((t) => `${str(t.name)}: ${str(t.price)}${t.billingNote ? ` (${str(t.billingNote)})` : ""}`).join("; "), updated, str(d.pricingUrl));
        }
        const sentiment = d.userSentiment as Fm | undefined;
        if (sentiment?.summary) fact(id, "userSentiment", sentiment.summary, date(sentiment.lastUpdated));
        fact(id, "lastResearchedAt", researched, researched);

        url(d.url, id, "home");
        url(d.pricingUrl, id, "pricing");
        url(d.privacyPolicyUrl, id, "privacy");
        url(d.sourceCodeUrl, id, "code");
        for (const s of (Array.isArray(d.sourceUrls) ? d.sourceUrls : []) as Fm[]) url(s.url, id, "source", s.label, s.checkedAt);
        for (const n of (Array.isArray(d.recentNews) ? d.recentNews : []) as Fm[]) {
          insEvent.run(id, "news", date(n.date), str(n.title) ?? null, str(n.source) ?? null, str(n.url) ?? null, str(n.summary) ?? null);
        }
        for (const r of (Array.isArray(d.redditMentions) ? d.redditMentions : []) as Fm[]) {
          insEvent.run(id, "reddit", date(r.date), str(r.postTitle) ?? null, str(r.subreddit) ?? null, str(r.postUrl) ?? null, `${str(r.snippet) ?? ""} (${str(r.sentiment) ?? "neutral"})`);
        }

        const alt = str(d.recommendedAlternative);
        if (alt) insEdge.run(id, `services/${alt}`, "alternative");
        const parent = str(d.parentCompany);
        if (parent && companyName(parent)) {
          const name = companyName(parent);
          const entry = companies.get(name) ?? { services: [], parents: new Set<string>() };
          entry.services.push(id);
          // "Google (Alphabet Inc.)": the bracket may name the owner's own parent.
          const inner = /\(([^)]+)\)/.exec(parent)?.[1];
          if (inner) entry.parents.add(companyName(inner));
          companies.set(name, entry);
        }
      }
      if (type === "guide") {
        const from = str(d.sourceService);
        const to = str(d.targetService);
        if (from) insEdge.run(id, `services/${from}`, "migrates-from");
        if (to) insEdge.run(id, `services/${to}`, "migrates-to");
        fact(id, "missingFeatures", d.missingFeatures, updated);
      }
      if (type === "landing-page") {
        for (const s of list(d.recommendedServices)) insEdge.run(id, `services/${s}`, "recommends");
        const related = str(d.relatedService);
        if (related) insEdge.run(id, `services/${related}`, "about");
      }
    }
  }

  // Owner companies from parentCompany. A knowledge entity with the same name
  // or alias wins. Otherwise the company becomes a virtual entity node, so the
  // explorer can show "Google: Gmail, Drive, Maps, ..." before anyone writes a
  // knowledge note for it.
  let virtual = 0;
  const companyIds = new Map<string, string>();
  for (const [name, { services }] of companies) {
    const existing = findAlias.get(normalizeText(name)) as { id: string } | undefined;
    let id = existing?.id;
    if (!id) {
      id = slugify(name);
      const created = insNode.run(id, "entity", "company", name, null, `Owner of ${services.length} listed service${services.length === 1 ? "" : "s"}.`, null, null, 0, 1, null);
      if (created.changes) virtual++;
      alias(name, id);
    }
    companyIds.set(name, id);
    for (const s of services) insEdge.run(id, s, "provides");
  }
  for (const [name, { parents }] of companies) {
    for (const p of parents) {
      const parentId = companyIds.get(p) ?? (findAlias.get(normalizeText(p)) as { id: string } | undefined)?.id;
      if (parentId && parentId !== companyIds.get(name)) insEdge.run(companyIds.get(name)!, parentId, "part-of");
    }
  }

  // Edges to nodes that don't exist (a typo'd slug, a draft that is gone) would
  // only confuse the explorer. graph.ts reports them, so drop them here.
  db.exec("DELETE FROM edges WHERE src NOT IN (SELECT id FROM nodes) OR dst NOT IN (SELECT id FROM nodes)");

  const count = (table: string) => (db.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number }).n;
  const stats: StoreStats = {
    nodes: count("nodes"),
    edges: count("edges"),
    chunks: count("chunk_meta"),
    facts: count("facts"),
    events: count("events"),
    urls: count("urls"),
    claims: count("claims"),
    companies: virtual,
  };
  db.prepare("INSERT INTO meta (key, value) VALUES ('generated', ?), ('stats', ?)").run(graph.generated, JSON.stringify(stats));
  db.exec("COMMIT");
  db.close();
  fs.renameSync(tmp, path.join(dir, STORE_FILE));
  return stats;
}

/** One searchable paragraph with the frontmatter a writer looks for first. */
function profile(d: Fm): string {
  const line = (label: string, value: unknown) => {
    const v = Array.isArray(value) ? list(value).join(", ") : str(value);
    return v ? `${label}: ${v}` : "";
  };
  const tiers = (Array.isArray(d.pricingTiers) ? (d.pricingTiers as Fm[]) : []).map((t) => `${str(t.name)} ${str(t.price)}`).join(", ");
  const faqs = (Array.isArray(d.faqs) ? (d.faqs as Fm[]) : []).map((q) => `${str(q.question)} ${str(q.answer)}`).join(" ");
  return [
    str(d.description),
    line("Region", d.region),
    line("Category", d.category),
    line("Location", d.location),
    line("Owner", d.parentCompany),
    line("Features", d.features),
    line("Problem", d.oneLineProblem),
    line("Issues", d.issues),
    line("What you gain", d.whatYoudGain),
    line("What you lose", d.whatYoudLose),
    line("Missing features", d.missingFeatures),
    line("Pricing", tiers || d.startingPrice),
    line("Privacy", d.gdprNotes),
    line("Tags", d.tags),
    faqs ? `FAQ: ${faqs}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
