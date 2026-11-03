import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { type EmbedConfig, embed, loadVectors } from "./embed";
import { STORE_DIR, STORE_FILE, companyName, normalizeText, normalizeUrl } from "./store";

/**
 * Queries over knowledge/.cache/knowledge.db. The CLI, the explorer and the
 * tests all go through these functions, so people and skills see the same
 * results.
 *
 * search   ranked passages, grouped per node (full text, plus vectors if cached)
 * getNode  one node with its edges, facts, URLs, events and claims
 * resolve  a name or URL to existing nodes, so ingest doesn't create duplicates
 * related  the neighbourhood of a node, up to N hops, both directions
 * context  a compact, cited markdown brief for writing, sized to a token budget
 */

export interface NodeRow {
  id: string;
  type: string;
  kind: string | null;
  title: string;
  path: string | null;
  summary: string | null;
  updated: string | null;
  heat: number | null;
  draft: number;
  virtual: number;
}

export interface Hit extends NodeRow {
  score: number;
  heading: string;
  snippet: string;
  lang: string;
}

export interface EdgeView {
  rel: string;
  id: string;
  type: string;
  title: string;
}

export interface NodeView {
  node: NodeRow;
  out: EdgeView[];
  in: EdgeView[];
  facts: { field: string; value: string; date: string | null; cite: string | null }[];
  urls: { href: string; role: string; label: string | null; checked_at: string | null }[];
  events: { kind: string; date: string | null; title: string | null; source: string | null; url: string | null; summary: string | null }[];
  claims: { claim_id: string; text: string }[];
  aliases: string[];
}

export interface SearchOptions {
  limit?: number;
  types?: string[];
  lang?: string;
  /** Pass to add vector search. Needs vectors from `pnpm knowledge:index`. */
  vectors?: { cfg: EmbedConfig; root: string };
}

const NODE_COLS = "n.id, n.type, n.kind, n.title, n.path, n.summary, n.updated, n.heat, n.draft, n.virtual";
const RRF_K = 60;

export function openStore(root: string): DatabaseSync {
  const file = path.join(root, STORE_DIR, STORE_FILE);
  if (!fs.existsSync(file)) throw new Error(`No knowledge store at ${file}. Run \`pnpm knowledge:index\` first.`);
  return new DatabaseSync(file, { readOnly: true });
}

function getRow(db: DatabaseSync, id: string): NodeRow | undefined {
  return db.prepare(`SELECT ${NODE_COLS} FROM nodes n WHERE n.id = ?`).get(id) as NodeRow | undefined;
}

// ---------------------------------------------------------------------------
// search
// ---------------------------------------------------------------------------

interface ChunkHit {
  cid: number;
  node_id: string;
  lang: string;
  heading: string;
  hash: string;
  snip: string;
}

function ftsChunks(db: DatabaseSync, query: string, limit = 300): ChunkHit[] {
  const tokens = normalizeText(query).split(" ").filter((t) => t.length > 1);
  if (!tokens.length) return [];
  const sql = `SELECT m.id AS cid, m.node_id, m.lang, m.heading, m.hash,
      snippet(chunks, 2, '«', '»', '…', 16) AS snip
    FROM chunks JOIN chunk_meta m ON m.id = chunks.rowid
    WHERE chunks MATCH ? ORDER BY bm25(chunks, 6.0, 2.0, 1.0) LIMIT ?`;
  const terms = tokens.map((t) => `"${t}"*`);
  // All words first. If that finds little, any word, ranked after.
  const all = db.prepare(sql).all(terms.join(" "), limit) as unknown as ChunkHit[];
  if (all.length >= 10 || tokens.length === 1) return all;
  const seen = new Set(all.map((h) => h.cid));
  const any = (db.prepare(sql).all(terms.join(" OR "), limit) as unknown as ChunkHit[]).filter((h) => !seen.has(h.cid));
  return [...all, ...any];
}

async function vectorChunks(db: DatabaseSync, query: string, opts: NonNullable<SearchOptions["vectors"]>, limit = 300): Promise<ChunkHit[]> {
  const vectors = loadVectors(opts.root, opts.cfg.model);
  if (!vectors.size) return [];
  const [q] = await embed(opts.cfg, [query], "query");
  const rows = db.prepare("SELECT id AS cid, node_id, lang, heading, hash FROM chunk_meta").all() as unknown as ChunkHit[];
  const scored: [ChunkHit, number][] = [];
  for (const r of rows) {
    const v = vectors.get(r.hash);
    if (!v || v.length !== q!.length) continue;
    let dot = 0;
    for (let i = 0; i < v.length; i++) dot += v[i]! * q![i]!;
    scored.push([r, dot]);
  }
  scored.sort((a, b) => b[1] - a[1]);
  const top = scored.slice(0, limit).map(([r]) => r);
  const text = db.prepare("SELECT substr(text, 1, 220) AS t FROM chunks WHERE rowid = ?");
  for (const r of top.slice(0, 50)) r.snip = `${(text.get(r.cid) as { t: string }).t}…`;
  return top;
}

/**
 * Ranked nodes for a query. Each list (full text, vectors) ranks passages;
 * reciprocal rank fusion merges them; a node scores by its best three passages,
 * with small boosts for title matches and recent news (heat).
 */
export async function search(db: DatabaseSync, query: string, opts: SearchOptions = {}): Promise<Hit[]> {
  const limit = opts.limit ?? 10;
  const lists = [ftsChunks(db, query)];
  if (opts.vectors) lists.push(await vectorChunks(db, query, opts.vectors));

  const chunkScore = new Map<number, { hit: ChunkHit; score: number }>();
  for (const list of lists) {
    list.forEach((hit, rank) => {
      const entry = chunkScore.get(hit.cid) ?? { hit, score: 0 };
      entry.score += 1 / (RRF_K + rank + 1);
      if (!entry.hit.snip && hit.snip) entry.hit = hit;
      chunkScore.set(hit.cid, entry);
    });
  }

  const perNode = new Map<string, { hits: { hit: ChunkHit; score: number }[] }>();
  for (const entry of chunkScore.values()) {
    if (opts.lang && entry.hit.lang !== opts.lang) continue;
    const n = perNode.get(entry.hit.node_id) ?? { hits: [] };
    n.hits.push(entry);
    perNode.set(entry.hit.node_id, n);
  }

  const q = normalizeText(query);
  const results: Hit[] = [];
  for (const [id, { hits }] of perNode) {
    const node = getRow(db, id);
    if (!node || (opts.types && !opts.types.includes(node.type))) continue;
    hits.sort((a, b) => b.score - a.score);
    let score = hits.slice(0, 3).reduce((sum, h, i) => sum + h.score / 2 ** i, 0);
    if (q && normalizeText(node.title).includes(q)) score *= 1.5;
    if (node.heat) score *= 1 + Math.min(node.heat, 10) / 20;
    if (node.draft) score *= 0.7;
    const best = hits[0]!.hit;
    results.push({ ...node, score, heading: best.heading, snippet: (best.snip ?? "").replace(/\s+/g, " "), lang: best.lang });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ---------------------------------------------------------------------------
// getNode, resolve, related
// ---------------------------------------------------------------------------

export function getNode(db: DatabaseSync, id: string): NodeView | null {
  const node = getRow(db, id);
  if (!node) return null;
  const edges = (sql: string) => db.prepare(sql).all(id) as unknown as EdgeView[];
  return {
    node,
    out: edges("SELECT e.rel, n.id, n.type, n.title FROM edges e JOIN nodes n ON n.id = e.dst WHERE e.src = ? ORDER BY e.rel, n.title"),
    in: edges("SELECT e.rel, n.id, n.type, n.title FROM edges e JOIN nodes n ON n.id = e.src WHERE e.dst = ? ORDER BY e.rel, n.title"),
    facts: db.prepare("SELECT field, value, date, cite FROM facts WHERE node_id = ? ORDER BY rowid").all(id) as unknown as NodeView["facts"],
    urls: db.prepare("SELECT href, role, label, checked_at FROM urls WHERE node_id = ? ORDER BY role, checked_at DESC").all(id) as unknown as NodeView["urls"],
    events: db.prepare("SELECT kind, date, title, source, url, summary FROM events WHERE node_id = ? ORDER BY date DESC").all(id) as unknown as NodeView["events"],
    claims: db.prepare("SELECT claim_id, text FROM claims WHERE source_id = ? ORDER BY CAST(substr(claim_id, 2) AS INTEGER)").all(id) as unknown as NodeView["claims"],
    aliases: (db.prepare("SELECT alias FROM aliases WHERE node_id = ? ORDER BY alias").all(id) as { alias: string }[]).map((a) => a.alias),
  };
}

export interface Resolution {
  query: string;
  matches: (NodeRow & { match: "url" | "alias" | "prefix" | "title"; confidence: number; via?: string })[];
}

/** Finds existing nodes for a name or URL. An empty list means "new". */
export function resolve(db: DatabaseSync, query: string): Resolution {
  const matches: Resolution["matches"] = [];
  const add = (id: string, match: Resolution["matches"][number]["match"], confidence: number, via?: string) => {
    if (matches.some((m) => m.id === id)) return;
    const row = getRow(db, id);
    if (row) matches.push({ ...row, match, confidence, via });
  };

  if (/^https?:\/\/|^[\w-]+(\.[\w-]+)+(\/|$)/.test(query.trim())) {
    const key = normalizeUrl(/^https?:/.test(query) ? query : `https://${query}`);
    for (const r of db.prepare("SELECT node_id, role FROM urls WHERE url = ?").all(key) as { node_id: string; role: string }[]) add(r.node_id, "url", 1, r.role);
    const host = key.split("/")[0]!;
    for (const r of db.prepare("SELECT DISTINCT node_id, role FROM urls WHERE role = 'home' AND url LIKE ?").all(`${host}%`) as { node_id: string; role: string }[]) add(r.node_id, "url", 0.8, `same site (${host})`);
  }

  const name = normalizeText(query);
  if (name) {
    // "Proton AG" and "Proton" are the same company: try the name without legal suffixes too.
    for (const n of new Set([name, normalizeText(companyName(query))])) {
      for (const r of db.prepare("SELECT node_id FROM aliases WHERE alias = ?").all(n) as { node_id: string }[]) add(r.node_id, "alias", n === name ? 1 : 0.9);
    }
    for (const r of db.prepare("SELECT node_id, alias FROM aliases WHERE alias LIKE ? LIMIT 10").all(`${name}%`) as { node_id: string; alias: string }[]) add(r.node_id, "prefix", 0.7, r.alias);
    const terms = name.split(" ").filter((t) => t.length > 1).map((t) => `"${t}"*`).join(" ");
    if (terms) {
      const sql = "SELECT DISTINCT m.node_id FROM chunks JOIN chunk_meta m ON m.id = chunks.rowid WHERE chunks MATCH ? LIMIT 10";
      for (const r of db.prepare(sql).all(`title : (${terms})`) as { node_id: string }[]) add(r.node_id, "title", 0.5);
    }
  }
  return { query, matches: matches.sort((a, b) => b.confidence - a.confidence) };
}

export interface RelatedNode extends NodeRow {
  distance: number;
  via: { from: string; rel: string; to: string };
}

/** Breadth-first walk over edges in both directions. */
export function related(db: DatabaseSync, id: string, hops = 2, limit = 60): RelatedNode[] {
  const out = db.prepare("SELECT dst AS next, rel FROM edges WHERE src = ?");
  const inc = db.prepare("SELECT src AS next, rel FROM edges WHERE dst = ?");
  const seen = new Set([id]);
  const result: RelatedNode[] = [];
  let frontier = [id];
  for (let d = 1; d <= hops && result.length < limit; d++) {
    const next: string[] = [];
    for (const cur of frontier) {
      const steps = [
        ...(out.all(cur) as { next: string; rel: string }[]).map((e) => ({ ...e, via: { from: cur, rel: e.rel, to: e.next } })),
        ...(inc.all(cur) as { next: string; rel: string }[]).map((e) => ({ ...e, via: { from: e.next, rel: e.rel, to: cur } })),
      ];
      for (const s of steps) {
        if (seen.has(s.next)) continue;
        seen.add(s.next);
        const row = getRow(db, s.next);
        if (!row) continue;
        result.push({ ...row, distance: d, via: s.via });
        next.push(s.next);
      }
    }
    frontier = next;
  }
  return result.slice(0, limit);
}

// ---------------------------------------------------------------------------
// context
// ---------------------------------------------------------------------------

export interface ContextOptions {
  /** Rough size limit in tokens (1 token ~ 4 characters). Default 6000. */
  budget?: number;
  /** Focus passages on this question. Defaults to the target itself. */
  query?: string;
  lang?: string;
  vectors?: SearchOptions["vectors"];
  /** Today's date for evidence age. Default: now. */
  today?: string;
}

const FACT_LABELS: Record<string, string> = {
  fact: "Fact",
  pricingTiers: "Pricing tiers",
  pricingDetails: "Pricing details",
  gdprNotes: "Privacy notes",
  gdprCompliance: "GDPR",
  dataStorageLocations: "Data stored in",
  parentCompany: "Owner",
  recommendedAlternative: "Recommended alternative",
  userSentiment: "User sentiment",
  lastResearchedAt: "Last researched",
};

function ageDays(from: string | null, today: string): number | null {
  return from ? Math.round((Date.parse(today) - Date.parse(from)) / 86_400_000) : null;
}

export function renderNode(db: DatabaseSync, id: string, opts: ContextOptions & { passages: number }): string {
  const view = getNode(db, id);
  if (!view) return "";
  const { node } = view;
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push(`## ${node.title} (${node.kind ? `${node.type}, ${node.kind}` : node.type}) \`${node.id}\``);
  if (node.summary) lines.push(node.summary);
  const meta = [node.path && `file: ${node.path}`, node.updated && `updated ${node.updated}`, node.virtual ? "derived from parentCompany, no knowledge note yet" : null].filter(Boolean);
  if (meta.length) lines.push(`_${meta.join(" · ")}_`);

  const sources = view.urls.filter((u) => u.role === "source");
  const newest = sources.map((u) => u.checked_at).filter(Boolean).sort().pop() ?? null;
  const researched = view.facts.find((f) => f.field === "lastResearchedAt")?.value ?? null;
  const evidenceDate = newest ?? researched;
  if (evidenceDate) {
    const age = ageDays(evidenceDate, today);
    lines.push(`Evidence: newest check ${evidenceDate} (${age} days ago)${age !== null && age > 180 ? ". Older than 6 months: re-check prices and facts before you rely on them (/claims-audit)." : "."}`);
  }

  const facts = view.facts.filter((f) => f.field !== "lastResearchedAt");
  if (facts.length) {
    lines.push("", "### Facts");
    for (const f of facts) {
      lines.push(`- ${FACT_LABELS[f.field] ?? f.field}: ${f.value}${f.date ? ` (as of ${f.date})` : ""}${f.cite ? ` ${f.cite}` : ""}`);
    }
  }
  if (view.claims.length) {
    lines.push("", "### Claims");
    for (const c of view.claims) lines.push(`- \`${c.claim_id}\` ${c.text} [[${node.id}#${c.claim_id}]]`);
  }

  const rels = [...view.out.map((e) => `${e.rel} → ${e.title} \`${e.id}\``), ...view.in.map((e) => `${e.title} \`${e.id}\` ${e.rel} → this`)];
  if (rels.length) {
    lines.push("", "### Links");
    for (const r of rels.slice(0, 25)) lines.push(`- ${r}`);
  }
  // An owner's other services are often the story ("Meta also owns ...").
  for (const owner of view.in.filter((e) => e.rel === "provides")) {
    const siblings = (getNode(db, owner.id)?.out ?? []).filter((e) => e.rel === "provides" && e.id !== id);
    if (siblings.length) lines.push(`- ${owner.title} also provides: ${siblings.map((s) => s.title).join(", ")}`);
  }

  const events = view.events.slice(0, 10);
  if (events.length) {
    lines.push("", "### Events");
    for (const e of events) lines.push(`- ${e.date ?? "undated"} · ${e.kind}: ${e.title ?? ""}${e.source ? ` (${e.source})` : ""}${e.url ? ` ${e.url}` : ""}${e.summary ? `. ${e.summary}` : ""}`);
  }
  if (sources.length) {
    lines.push("", "### Sources");
    for (const u of sources.slice(0, 15)) lines.push(`- ${u.label ?? u.href} ${u.href}${u.checked_at ? ` (checked ${u.checked_at})` : " (no check date)"}`);
  }

  if (opts.passages > 0) {
    const q = opts.query ?? node.title;
    const terms = normalizeText(q).split(" ").filter((t) => t.length > 1).map((t) => `"${t}"*`).join(" OR ");
    // Passages in one language: a brief for an English page shouldn't quote the Dutch one.
    const sql = `SELECT m.heading, m.lang, chunks.text FROM chunks JOIN chunk_meta m ON m.id = chunks.rowid
      WHERE m.node_id = ? AND m.heading NOT IN ('Profile', 'Profiel') AND m.lang = ?
      ${terms ? "AND chunks MATCH ? ORDER BY bm25(chunks, 6.0, 2.0, 1.0)" : "ORDER BY m.id"} LIMIT ?`;
    const params: (string | number)[] = [id, opts.lang ?? "en"];
    if (terms) params.push(terms);
    params.push(opts.passages);
    let rows = db.prepare(sql).all(...params) as { heading: string; lang: string; text: string }[];
    if (!rows.length && terms) rows = db.prepare(sql.replace(/AND chunks MATCH \? ORDER BY bm25\(chunks, 6.0, 2.0, 1.0\)/, "ORDER BY m.id")).all(...params.filter((p) => p !== terms)) as typeof rows;
    if (rows.length) {
      lines.push("", "### Passages");
      for (const r of rows) lines.push(`> **${r.heading || "Intro"}** (${r.lang})`, ...r.text.split("\n").map((l) => `> ${l}`), "");
    }
  }
  return lines.join("\n");
}

/**
 * A markdown brief for writing about a node or a topic. A node id gives that
 * node in full plus its neighbours in short; free text finds the best matching
 * nodes first. Sections are added in order of importance until the budget is
 * used, and every fact keeps its date and source.
 */
export async function context(db: DatabaseSync, target: string, opts: ContextOptions = {}): Promise<string> {
  const budget = (opts.budget ?? 6000) * 4;
  const direct = getRow(db, target);
  const focus = direct
    ? [direct.id]
    : (await search(db, target, { limit: 3, lang: opts.lang, vectors: opts.vectors })).map((h) => h.id);
  if (!focus.length) return `# Context: ${target}\n\nNothing in the knowledge base or the site content matches this.\n`;

  const parts: string[] = [`# Context: ${direct ? direct.title : target}`, ""];
  let used = parts.join("\n").length;
  const push = (text: string) => {
    if (!text || used + text.length > budget) return false;
    parts.push(text, "");
    used += text.length + 1;
    return true;
  };

  for (const id of focus) {
    const full = renderNode(db, id, { ...opts, query: opts.query ?? (direct ? undefined : target), passages: direct ? 4 : 2 });
    if (push(full)) continue;
    const short = renderNode(db, id, { ...opts, passages: 0 });
    if (push(short)) continue;
    // Still too big: keep the top (title, summary, evidence, first facts), cut at a line end.
    const room = budget - used - 40;
    if (room > 200) push(`${short.slice(0, short.lastIndexOf("\n", room))}\n…`);
  }

  const seen = new Set(focus);
  const neighbours = focus.flatMap((id) => related(db, id, 1, 30)).filter((n) => !seen.has(n.id) && (seen.add(n.id), true));
  if (neighbours.length) {
    const lines = ["## Related", ...neighbours.map((n) => `- ${n.title} \`${n.id}\` (${n.type}, ${n.via.rel})${n.summary ? `: ${n.summary}` : ""}`)];
    // Trim the list rather than drop it: the links are cheap and useful.
    while (lines.length > 1 && !push(lines.join("\n"))) lines.pop();
  }
  if (used >= budget * 0.95) parts.push("_Trimmed to the token budget. Raise --budget for more._");
  return parts.join("\n").trimEnd() + "\n";
}
