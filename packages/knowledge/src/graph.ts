import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Builds the knowledge graph from `knowledge/` and `content/`.
 *
 * Node ids: knowledge slugs are bare (`microsoft`, `2026-11-02-x`), site
 * content is prefixed with its collection (`services/proton-mail`).
 * See knowledge/README.md for the schema this validates.
 */

export type NodeType =
  | "source"
  | "entity"
  | "story"
  | "service"
  | "category"
  | "guide"
  | "article"
  | "landing-page"
  | "page";

export interface GraphNode {
  type: NodeType;
  kind?: string;
  title: string;
  path: string;
  summary?: string;
  status?: string;
  reliability?: string;
  published?: string;
  updated?: string;
  last_event?: string;
  last_covered?: string;
  heat?: number;
  draft?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  rel: string;
}

export interface Issue {
  level: "error" | "warning";
  code: string;
  node?: string;
  message: string;
}

export interface Graph {
  generated: string;
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
  backlinks: Record<string, string[]>;
  issues: Issue[];
}

export type Fm = Record<string, unknown>;

export interface ParsedFile {
  id: string;
  path: string;
  data: Fm;
  body: string;
}

export const CONTENT_COLLECTIONS: Record<string, NodeType> = {
  services: "service",
  categories: "category",
  guides: "guide",
  articles: "article",
  "landing-pages": "landing-page",
  pages: "page",
};

const ENTITY_KINDS = ["company", "regulation", "institution", "person", "place"];
const STORY_STATUSES = ["active", "dormant", "closed"];
const RELIABILITY = ["high", "medium", "low"];
const RELIABILITY_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1 };
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SOURCE_SLUG_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const WIKILINK_RE = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|[^\]]*)?\]\]/g;

export const HEAT_WINDOW_DAYS = 30;
export const DORMANT_AFTER_DAYS = 90;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

/** YAML dates come back as Date objects unless quoted. Normalize to YYYY-MM-DD. */
export function str(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

export function list(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(str).filter((v): v is string => !!v);
}

export function parse(file: string, root: string, id: string): ParsedFile {
  const parsed = matter(fs.readFileSync(file, "utf8"));
  return { id, path: path.relative(root, file), data: parsed.data as Fm, body: parsed.content };
}

function daysBetween(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / 86_400_000;
}

/** Claim ids (`c1`, `c2`, ...) declared in a source note body. */
function claimIds(body: string): Set<string> {
  return new Set([...body.matchAll(/^\s*-\s*`(c\d+)`/gm)].map((m) => m[1]!));
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

export function buildGraph(root: string, today = new Date().toISOString().slice(0, 10)): Graph {
  const nodes: Record<string, GraphNode> = {};
  const edges: GraphEdge[] = [];
  const issues: Issue[] = [];
  const knowledgeFiles: ParsedFile[] = [];
  const claims = new Map<string, Set<string>>();
  const sourceUrls = new Map<string, string>();

  const error = (code: string, node: string | undefined, message: string) =>
    issues.push({ level: "error", code, node, message });
  const warn = (code: string, node: string | undefined, message: string) =>
    issues.push({ level: "warning", code, node, message });

  const addNode = (id: string, node: GraphNode) => {
    if (nodes[id]) {
      error("duplicate-slug", id, `"${id}" is used by both ${nodes[id].path} and ${node.path}`);
      return;
    }
    nodes[id] = node;
  };

  // --- Site content (en.md is the canonical file) ---------------------------
  for (const [collection, type] of Object.entries(CONTENT_COLLECTIONS)) {
    const dir = path.join(root, "content", collection);
    if (!fs.existsSync(dir)) continue;
    for (const slug of fs.readdirSync(dir)) {
      const file = path.join(dir, slug, "en.md");
      if (!fs.existsSync(file)) continue;
      // Translations aren't graph nodes, but a broken one breaks the site.
      for (const other of fs.readdirSync(path.join(dir, slug))) {
        if (other === "en.md" || !other.endsWith(".md")) continue;
        try {
          matter(fs.readFileSync(path.join(dir, slug, other), "utf8"));
        } catch (e) {
          error("bad-yaml", `${collection}/${slug}`, `${other}: ${(e as Error).message.split("\n")[0]}`);
        }
      }
      let f: ParsedFile;
      try {
        f = parse(file, root, `${collection}/${slug}`);
      } catch (e) {
        error("bad-yaml", `${collection}/${slug}`, `en.md: ${(e as Error).message.split("\n")[0]}`);
        continue;
      }
      // Sample articles are layout placeholders, not part of the knowledge graph.
      if (type === "article" && f.data.sample === true) continue;
      addNode(f.id, {
        type,
        title: str(f.data.name) ?? str(f.data.title) ?? slug,
        path: f.path,
        updated: str(f.data.updatedAt),
        published: str(f.data.date),
        draft: f.data.draft === true || undefined,
      });
      if (type === "article") {
        knowledgeFiles.push(f);
        const story = str(f.data.story);
        if (story) edges.push({ from: f.id, to: story, rel: "covers" });
        else error("missing-field", f.id, "article has no `story`");
        for (const e of list(f.data.entities)) edges.push({ from: f.id, to: e, rel: "mentions" });
        for (const s of list(f.data.services)) edges.push({ from: f.id, to: `services/${s}`, rel: "mentions" });
        for (const c of list(f.data.categories)) edges.push({ from: f.id, to: `categories/${c}`, rel: "in-category" });
        for (const g of list(f.data.guides)) edges.push({ from: f.id, to: `guides/${g}`, rel: "links" });
        if (!str(f.data.title)) error("missing-field", f.id, "article has no `title`");
        if (!str(f.data.date)) error("missing-field", f.id, "article has no `date`");
      }
      if (type === "service") {
        const category = str(f.data.category);
        if (category) edges.push({ from: f.id, to: `categories/${category}`, rel: "in-category" });
      }
    }
  }

  // --- Knowledge -------------------------------------------------------------
  const kroot = path.join(root, "knowledge");

  for (const file of walk(path.join(kroot, "sources"))) {
    const slug = path.basename(file, ".md");
    const f = parse(file, root, slug);
    knowledgeFiles.push(f);
    const d = f.data;
    if (!SOURCE_SLUG_RE.test(slug)) error("bad-slug", slug, "source slugs must be YYYY-MM-DD-kebab-case");
    if (d.type !== "source") error("bad-type", slug, "expected `type: source`");
    for (const key of ["title", "url", "publisher", "fetched", "reliability"]) {
      if (!str(d[key])) error("missing-field", slug, `source has no \`${key}\``);
    }
    const reliability = str(d.reliability);
    if (reliability && !RELIABILITY.includes(reliability)) {
      error("bad-value", slug, `reliability must be one of ${RELIABILITY.join(", ")}`);
    }
    const url = str(d.url);
    if (url) {
      const prior = sourceUrls.get(url);
      if (prior) warn("duplicate-url", slug, `same url as ${prior}`);
      else sourceUrls.set(url, slug);
    }
    claims.set(slug, claimIds(f.body));
    addNode(slug, {
      type: "source",
      title: str(d.title) ?? slug,
      path: f.path,
      reliability,
      published: str(d.published) ?? str(d.fetched),
      updated: str(d.fetched),
    });
    for (const e of list(d.entities)) edges.push({ from: slug, to: e, rel: "mentions" });
    for (const s of list(d.stories)) edges.push({ from: slug, to: s, rel: "part-of" });
  }

  for (const file of walk(path.join(kroot, "entities"))) {
    const slug = path.basename(file, ".md");
    const kindDir = path.basename(path.dirname(file));
    const f = parse(file, root, slug);
    knowledgeFiles.push(f);
    const d = f.data;
    if (!SLUG_RE.test(slug)) error("bad-slug", slug, "entity slugs must be kebab-case");
    if (d.type !== "entity") error("bad-type", slug, "expected `type: entity`");
    const kind = str(d.kind);
    if (!kind || !ENTITY_KINDS.includes(kind)) {
      error("bad-value", slug, `kind must be one of ${ENTITY_KINDS.join(", ")}`);
    } else if (kind !== kindDir) {
      error("bad-value", slug, `kind "${kind}" doesn't match folder entities/${kindDir}/`);
    }
    if (!str(d.name)) error("missing-field", slug, "entity has no `name`");
    if (!str(d.summary)) warn("missing-field", slug, "entity has no `summary`");
    addNode(slug, {
      type: "entity",
      kind,
      title: str(d.name) ?? slug,
      path: f.path,
      summary: str(d.summary),
      updated: str(d.updated),
    });
    for (const s of list(d.services)) edges.push({ from: slug, to: `services/${s}`, rel: "provides" });
    if (Array.isArray(d.related)) {
      for (const r of d.related as Fm[]) {
        const to = str(r?.to);
        if (to) edges.push({ from: slug, to, rel: str(r.rel) ?? "related" });
        else error("bad-value", slug, "`related` entries need a `to`");
      }
    }
  }

  for (const file of walk(path.join(kroot, "stories"))) {
    const slug = path.basename(file, ".md");
    const f = parse(file, root, slug);
    knowledgeFiles.push(f);
    const d = f.data;
    if (!SLUG_RE.test(slug)) error("bad-slug", slug, "story slugs must be kebab-case");
    if (d.type !== "story") error("bad-type", slug, "expected `type: story`");
    if (!str(d.title)) error("missing-field", slug, "story has no `title`");
    const status = str(d.status);
    if (!status || !STORY_STATUSES.includes(status)) {
      error("bad-value", slug, `status must be one of ${STORY_STATUSES.join(", ")}`);
    }
    addNode(slug, {
      type: "story",
      title: str(d.title) ?? slug,
      path: f.path,
      status,
      updated: str(d.updated),
      last_event: str(d.last_event),
      last_covered: str(d.last_covered),
    });
    for (const e of list(d.entities)) edges.push({ from: slug, to: e, rel: "involves" });
    for (const s of list(d.services)) edges.push({ from: slug, to: `services/${s}`, rel: "involves" });
    for (const c of list(d.categories)) edges.push({ from: slug, to: `categories/${c}`, rel: "in-category" });
  }

  // --- Wikilinks in bodies -----------------------------------------------------
  for (const f of knowledgeFiles) {
    for (const match of f.body.matchAll(WIKILINK_RE)) {
      const target = match[1]!.trim();
      const anchor = match[2]?.trim();
      edges.push({ from: f.id, to: target, rel: "links" });
      if (anchor && nodes[target]?.type === "source" && !claims.get(target)?.has(anchor)) {
        error("broken-claim", f.id, `[[${target}#${anchor}]]: ${target} has no claim ${anchor}`);
      }
    }
  }

  // --- Validate edges, build backlinks ------------------------------------------
  const backlinks: Record<string, string[]> = {};
  const seen = new Set<string>();
  const uniqueEdges: GraphEdge[] = [];
  for (const edge of edges) {
    const key = `${edge.from}|${edge.to}|${edge.rel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!nodes[edge.to]) {
      // Site content links between services/categories are the site's concern.
      const fromType = nodes[edge.from]?.type;
      if (fromType && !["service", "category", "guide", "landing-page", "page"].includes(fromType)) {
        error("broken-link", edge.from, `links to unknown "${edge.to}"`);
      }
      continue;
    }
    uniqueEdges.push(edge);
    (backlinks[edge.to] ??= []).push(edge.from);
  }
  for (const list of Object.values(backlinks)) list.sort();

  // --- Story heat ------------------------------------------------------------
  for (const [id, node] of Object.entries(nodes)) {
    if (node.type !== "story") continue;
    let heat = 0;
    for (const from of backlinks[id] ?? []) {
      const src = nodes[from];
      if (src?.type !== "source" || !src.published) continue;
      const age = daysBetween(src.published, today);
      if (age < 0 || age > HEAT_WINDOW_DAYS) continue;
      heat += (RELIABILITY_WEIGHT[src.reliability ?? "low"] ?? 1) * (1 - age / HEAT_WINDOW_DAYS);
    }
    node.heat = Math.round(heat * 10) / 10;
  }

  // --- Health warnings --------------------------------------------------------
  const names = new Map<string, string>();
  for (const f of knowledgeFiles) {
    const node = nodes[f.id];
    if (!node) continue;
    const incoming = backlinks[f.id] ?? [];

    if (node.type === "entity") {
      if (incoming.length === 0) warn("orphan", f.id, "no source, story or article links to this entity");
      for (const alias of [str(f.data.name), ...list(f.data.aliases)]) {
        if (!alias) continue;
        const key = alias.toLowerCase();
        const other = names.get(key);
        if (other && other !== f.id) warn("duplicate-alias", f.id, `"${alias}" is also used by ${other}`);
        else names.set(key, f.id);
      }
    }
    if (node.type === "source") {
      const cited = incoming.some((id) => ["entity", "story", "article"].includes(nodes[id]?.type ?? ""));
      if (!cited) warn("uncited-source", f.id, "no entity, story or article cites this source");
    }
    if (node.type === "story") {
      if (node.updated && node.last_event && node.updated < node.last_event) {
        warn("stale-summary", f.id, `summary updated ${node.updated}, last event ${node.last_event}`);
      }
      if (node.status === "active" && node.last_event && daysBetween(node.last_event, today) > DORMANT_AFTER_DAYS) {
        warn("dormant-candidate", f.id, `active but no event since ${node.last_event}`);
      }
    }
  }

  return { generated: today, nodes, edges: uniqueEdges, backlinks, issues };
}

// ---------------------------------------------------------------------------
// index.md
// ---------------------------------------------------------------------------

const link = (node: GraphNode) => `[${node.title}](${node.path.replace(/^knowledge\//, "")})`;
const siteLink = (node: GraphNode) => `[${node.title}](../${node.path})`;

export function renderIndex(graph: Graph): string {
  const { nodes, backlinks } = graph;
  const all = Object.entries(nodes);
  const of = (type: NodeType) => all.filter(([, n]) => n.type === type);
  const lines: string[] = [
    "# Knowledge index",
    "",
    `> Generated by \`pnpm knowledge:index\` on ${graph.generated}. Don't edit by hand.`,
    "",
  ];

  const stories = of("story");
  const active = stories
    .filter(([, n]) => n.status === "active")
    .sort(([, a], [, b]) => (b.heat ?? 0) - (a.heat ?? 0) || (b.last_event ?? "").localeCompare(a.last_event ?? ""));
  lines.push(`## Active stories (${active.length})`, "");
  if (active.length) {
    lines.push("| Story | Slug | Heat | Last event | Last covered | Sources |", "|---|---|---|---|---|---|");
    for (const [id, n] of active) {
      const sources = (backlinks[id] ?? []).filter((b) => nodes[b]?.type === "source").length;
      lines.push(`| ${link(n)} | \`${id}\` | ${n.heat ?? 0} | ${n.last_event ?? "–"} | ${n.last_covered ?? "never"} | ${sources} |`);
    }
  } else {
    lines.push("_None yet._");
  }
  lines.push("");

  const quiet = stories.filter(([, n]) => n.status !== "active").sort(([a], [b]) => a.localeCompare(b));
  if (quiet.length) {
    lines.push(`## Dormant and closed stories (${quiet.length})`, "");
    for (const [id, n] of quiet) lines.push(`- ${link(n)} \`${id}\` · ${n.status} · last event ${n.last_event ?? "–"}`);
    lines.push("");
  }

  const entities = of("entity");
  lines.push(`## Entities (${entities.length})`, "");
  for (const kind of ENTITY_KINDS) {
    const group = entities.filter(([, n]) => n.kind === kind).sort(([, a], [, b]) => a.title.localeCompare(b.title));
    if (!group.length) continue;
    lines.push(`### ${kind}`, "");
    for (const [id, n] of group) {
      const refs = (backlinks[id] ?? []).length;
      lines.push(`- ${link(n)} \`${id}\` · ${refs} refs${n.summary ? ` · ${n.summary}` : ""}`);
    }
    lines.push("");
  }

  const articles = of("article").sort(([, a], [, b]) => (b.published ?? "").localeCompare(a.published ?? ""));
  lines.push(`## Articles (${articles.length})`, "");
  for (const [, n] of articles.slice(0, 30)) {
    lines.push(`- ${n.published ?? "–"} · ${siteLink(n)}${n.draft ? " · draft" : ""}`);
  }
  if (!articles.length) lines.push("_None yet._");
  lines.push("");

  const sources = of("source");
  const byMonth = new Map<string, number>();
  for (const [id] of sources) byMonth.set(id.slice(0, 7), (byMonth.get(id.slice(0, 7)) ?? 0) + 1);
  lines.push(`## Sources (${sources.length})`, "");
  for (const [month, count] of [...byMonth].sort().reverse()) lines.push(`- ${month}: ${count}`);
  if (!sources.length) lines.push("_None yet._");
  lines.push("");

  lines.push("## Health", "", renderReport(graph, "- "), "");
  return lines.join("\n");
}

export function renderReport(graph: Graph, prefix = ""): string {
  if (!graph.issues.length) return `${prefix}No issues.`;
  return graph.issues
    .slice()
    .sort((a, b) => a.level.localeCompare(b.level) || a.code.localeCompare(b.code))
    .map((i) => `${prefix}**${i.level}** \`${i.code}\`${i.node ? ` ${i.node}` : ""}: ${i.message}`)
    .join("\n");
}
