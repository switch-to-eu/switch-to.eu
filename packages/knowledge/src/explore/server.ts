import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import type { AddressInfo } from "node:net";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { type EmbedConfig, embedConfig } from "../embed";
import { context, getNode, openStore, related, resolve, search } from "../query";
import { STORE_DIR, STORE_FILE } from "../store";

/**
 * Local web explorer for knowledge/.cache/knowledge.db (`pnpm knowledge:explore`).
 *
 * A read-only JSON API over the query functions in ../query, plus the static
 * UI in ./public. It binds to 127.0.0.1 only. The store is opened read-only
 * and opened again when `pnpm knowledge:index` replaces the file, so the
 * explorer never needs a restart.
 *
 *   GET /api/stats                                  counts per node type, edges, generated date
 *   GET /api/search?q=&type=&lang=&limit=           ranked nodes with «marked» snippets
 *   GET /api/node?id=                               one node: facts, links, URLs, events, claims
 *   GET /api/resolve?q=                             existing nodes for a name or URL
 *   GET /api/related?id=&hops=                      neighbourhood, both directions
 *   GET /api/context?target=&budget=&query=&lang=   the markdown brief writing agents get
 *   GET /api/graph?center=&hops=                    nodes and edges to draw
 */

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const localRequire = createRequire(import.meta.url);
const MAX_PARAM = 500;
const GRAPH_LIMIT = 250;
const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly extra: Record<string, unknown> = {}
  ) {
    super(message);
  }
}

/** The store, read-only. Opened again when `pnpm knowledge:index` swaps the file. */
class Store {
  private db: DatabaseSync | null = null;
  private key = "";
  builtAt: string | null = null;
  readonly file: string;

  constructor(readonly root: string) {
    this.file = path.join(root, STORE_DIR, STORE_FILE);
  }

  get(): DatabaseSync {
    const stat = fs.statSync(this.file, { throwIfNoEntry: false });
    if (!stat) {
      this.close();
      throw new HttpError(503, "No knowledge store yet. Run `pnpm knowledge:index` first.");
    }
    // The index writes a temp file and renames it over the old one: a new inode and mtime.
    const key = `${stat.ino}:${stat.mtimeMs}:${stat.size}`;
    if (!this.db || key !== this.key) {
      this.close();
      this.db = openStore(this.root);
      this.key = key;
      this.builtAt = stat.mtime.toISOString();
    }
    return this.db;
  }

  close() {
    this.db?.close();
    this.db = null;
    this.key = "";
  }
}

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

function text(q: URLSearchParams, name: string, required: true): string;
function text(q: URLSearchParams, name: string, required?: false): string | undefined;
function text(q: URLSearchParams, name: string, required = false): string | undefined {
  const value = q.get(name)?.trim();
  if (!value) {
    if (required) throw new HttpError(400, `Missing ?${name}=`);
    return undefined;
  }
  if (value.length > MAX_PARAM) throw new HttpError(400, `?${name}= is too long (max ${MAX_PARAM} characters)`);
  return value;
}

function int(q: URLSearchParams, name: string, fallback: number, min: number, max: number): number {
  const raw = q.get(name)?.trim();
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new HttpError(400, `?${name}= must be a whole number`);
  return Math.min(max, Math.max(min, n));
}

function lang(q: URLSearchParams): string | undefined {
  const value = text(q, "lang");
  if (value && !/^[a-z]{2}$/.test(value)) throw new HttpError(400, "?lang= must be a two-letter code, like en or nl");
  return value;
}

function types(q: URLSearchParams): string[] | undefined {
  const value = text(q, "type");
  if (!value) return undefined;
  const list = value.split(",").map((t) => t.trim()).filter(Boolean);
  if (list.some((t) => !/^[a-z][a-z-]*$/.test(t))) throw new HttpError(400, "?type= takes node types, like service or service,entity");
  return list.length ? list : undefined;
}

// ---------------------------------------------------------------------------
// Vectors: only when a provider is configured, and never fatal
// ---------------------------------------------------------------------------

type Vectors = { cfg: EmbedConfig; root: string };

function vectorConfig(root: string): { vectors?: Vectors; warning?: string } {
  try {
    const cfg = embedConfig();
    return cfg ? { vectors: { cfg, root } } : {};
  } catch (err) {
    return { warning: `Vector search off: ${(err as Error).message}` };
  }
}

async function withVectors<T>(root: string, run: (vectors?: Vectors) => Promise<T>) {
  const { vectors, warning } = vectorConfig(root);
  if (vectors) {
    try {
      return { result: await run(vectors), vectors: true, warning };
    } catch (err) {
      return {
        result: await run(undefined),
        vectors: false,
        warning: `Vector search failed, showing full-text results only: ${(err as Error).message}`,
      };
    }
  }
  return { result: await run(undefined), vectors: false, warning };
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/** 404 with a few likely nodes, so a typo'd id still leads somewhere. */
function notFound(db: DatabaseSync, id: string): HttpError {
  const seen = new Set<string>();
  const suggestions = [id, id.split("/").pop() ?? id]
    .flatMap((q) => resolve(db, q).matches)
    .filter((m) => !seen.has(m.id) && (seen.add(m.id), true))
    .slice(0, 5)
    .map((m) => ({ id: m.id, type: m.type, title: m.title }));
  return new HttpError(404, `No node "${id}"`, { suggestions });
}

const NODE_ROW_KEYS = new Set(["type", "kind", "title", "path", "summary", "updated", "heat", "draft"]);

/**
 * Frontmatter that getNode doesn't return (a source's reliability and
 * published date, a story's status and last event). Read from nodes.data.
 */
function extraFields(db: DatabaseSync, id: string): Record<string, unknown> {
  const row = db.prepare("SELECT data FROM nodes WHERE id = ?").get(id) as { data: string | null } | undefined;
  if (!row?.data) return {};
  try {
    const data = JSON.parse(row.data) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(data).filter(([k, v]) => !NODE_ROW_KEYS.has(k) && v !== null && v !== undefined && v !== ""));
  } catch {
    return {};
  }
}

function stats(store: Store, db: DatabaseSync) {
  const byType = db
    .prepare("SELECT type, count(*) AS count, sum(virtual) AS derived FROM nodes GROUP BY type ORDER BY count DESC, type")
    .all() as { type: string; count: number; derived: number }[];
  const edges = (db.prepare("SELECT count(*) AS n FROM edges").get() as { n: number }).n;
  const meta = Object.fromEntries((db.prepare("SELECT key, value FROM meta").all() as { key: string; value: string }[]).map((r) => [r.key, r.value]));
  const langs = db.prepare("SELECT lang, count(*) AS passages FROM chunk_meta GROUP BY lang ORDER BY passages DESC").all() as {
    lang: string;
    passages: number;
  }[];
  let totals: unknown = null;
  try {
    totals = meta.stats ? JSON.parse(meta.stats) : null;
  } catch {
    totals = null;
  }
  let embeddings: { on: boolean; provider?: string; model?: string; reason?: string };
  try {
    const cfg = embedConfig();
    embeddings = cfg ? { on: true, provider: cfg.provider, model: cfg.model } : { on: false };
  } catch (err) {
    embeddings = { on: false, reason: (err as Error).message };
  }
  return {
    generated: meta.generated ?? null,
    builtAt: store.builtAt,
    nodes: byType.reduce((sum, t) => sum + t.count, 0),
    edges,
    types: byType,
    langs,
    totals,
    embeddings,
  };
}

interface DrawNode {
  id: string;
  type: string;
  kind: string | null;
  title: string;
  virtual: number;
  draft: number;
  distance?: number;
}

/**
 * Nodes and edges to draw. With a center: that node, its neighbours up to
 * `hops` away, and every edge between them. Without: all nodes and edges
 * (nodes only, passages are not part of the graph).
 */
function graph(db: DatabaseSync, center: string | undefined, hops: number) {
  const pick = (n: DrawNode): DrawNode => ({ id: n.id, type: n.type, kind: n.kind, title: n.title, virtual: n.virtual, draft: n.draft });
  if (!center) {
    const nodes = db.prepare("SELECT id, type, kind, title, virtual, draft FROM nodes ORDER BY type, title").all() as unknown as DrawNode[];
    const edges = db.prepare("SELECT src, dst, rel FROM edges").all() as { src: string; dst: string; rel: string }[];
    return { center: null, hops: 0, truncated: false, nodes, edges };
  }
  const view = getNode(db, center);
  if (!view) throw notFound(db, center);
  const near = related(db, center, hops, GRAPH_LIMIT);
  const nodes = [{ ...pick(view.node), distance: 0 }, ...near.map((n) => ({ ...pick(n), distance: n.distance }))];
  const ids = JSON.stringify(nodes.map((n) => n.id));
  // related() returns the walk's tree; draw every edge among the nodes it found.
  const edges = db
    .prepare("SELECT src, dst, rel FROM edges WHERE src IN (SELECT value FROM json_each(?)) AND dst IN (SELECT value FROM json_each(?))")
    .all(ids, ids) as { src: string; dst: string; rel: string }[];
  return { center, hops, truncated: near.length >= GRAPH_LIMIT, nodes, edges };
}

type Api = (db: DatabaseSync, q: URLSearchParams, store: Store) => unknown;

const API: Record<string, Api> = {
  "/api/stats": (db, _q, store) => stats(store, db),

  "/api/search": async (db, q, store) => {
    const query = text(q, "q", true);
    const opts = { limit: int(q, "limit", 20, 1, 100), types: types(q), lang: lang(q) };
    const { result, vectors, warning } = await withVectors(store.root, (v) => search(db, query, { ...opts, vectors: v }));
    return { query, vectors, warning, hits: result };
  },

  "/api/node": (db, q) => {
    const id = text(q, "id", true);
    const view = getNode(db, id);
    if (!view) throw notFound(db, id);
    return { ...view, extra: extraFields(db, id) };
  },

  "/api/resolve": (db, q) => resolve(db, text(q, "q", true)),

  "/api/related": (db, q) => {
    const id = text(q, "id", true);
    if (!getNode(db, id)) throw notFound(db, id);
    const hops = int(q, "hops", 2, 1, 3);
    return { id, hops, nodes: related(db, id, hops) };
  },

  "/api/context": async (db, q, store) => {
    const target = text(q, "target", true);
    const opts = { budget: int(q, "budget", 6000, 200, 50000), query: text(q, "query"), lang: lang(q) };
    const { result, vectors, warning } = await withVectors(store.root, (v) => context(db, target, { ...opts, vectors: v }));
    return { target, budget: opts.budget, vectors, warning, markdown: result };
  },

  "/api/graph": (db, q) => graph(db, text(q, "center"), int(q, "hops", 1, 1, 2)),
};

// ---------------------------------------------------------------------------
// Static files
// ---------------------------------------------------------------------------

const JS = "text/javascript; charset=utf-8";
const STATIC: Record<string, { file: () => string; type: string }> = {
  "/": { file: () => path.join(PUBLIC_DIR, "index.html"), type: "text/html; charset=utf-8" },
  "/index.html": { file: () => path.join(PUBLIC_DIR, "index.html"), type: "text/html; charset=utf-8" },
  "/app.js": { file: () => path.join(PUBLIC_DIR, "app.js"), type: JS },
  "/style.css": { file: () => path.join(PUBLIC_DIR, "style.css"), type: "text/css; charset=utf-8" },
  // cytoscape's "require" entry is dist/cytoscape.cjs.js; the browser build sits next to it.
  "/vendor/cytoscape.min.js": { file: () => path.join(path.dirname(localRequire.resolve("cytoscape")), "cytoscape.min.js"), type: JS },
};

const BASE_HEADERS = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
};

const HTML_HEADERS = {
  "content-security-policy":
    "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "x-frame-options": "DENY",
};

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

/** The request handler, without a socket. Tests call this through createServer on port 0. */
export function createHandler(root: string): http.RequestListener {
  const store = new Store(root);
  return (req, res) => {
    handle(store, req, res).catch((err: Error) => {
      if (!res.headersSent) res.writeHead(500, { ...BASE_HEADERS, "content-type": "text/plain; charset=utf-8" });
      res.end(err.message);
    });
  };
}

async function handle(store: Store, req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const head = req.method === "HEAD";
  const send = (status: number, type: string, body: string | Buffer, extra: Record<string, string> = {}) => {
    res.writeHead(status, { ...BASE_HEADERS, "content-type": type, ...extra });
    res.end(head ? undefined : body);
  };
  const json = (status: number, body: unknown) => send(status, "application/json; charset=utf-8", JSON.stringify(body));

  // Only answer requests addressed to this machine (blocks DNS rebinding).
  const host = (req.headers.host ?? "").replace(/:\d+$/, "").toLowerCase();
  if (!LOCAL_HOSTS.has(host)) return json(403, { error: "The explorer only answers on 127.0.0.1." });
  if (req.method !== "GET" && !head) return send(405, "text/plain; charset=utf-8", "Method not allowed", { allow: "GET, HEAD" });

  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname.startsWith("/api/")) {
    const endpoint = API[url.pathname];
    if (!endpoint) return json(404, { error: `Unknown endpoint ${url.pathname}` });
    try {
      return json(200, await endpoint(store.get(), url.searchParams, store));
    } catch (err) {
      if (err instanceof HttpError) return json(err.status, { error: err.message, ...err.extra });
      return json(500, { error: (err as Error).message || "Internal error" });
    }
  }

  const asset = STATIC[url.pathname];
  if (!asset) return send(404, "text/plain; charset=utf-8", "Not found");
  try {
    const body = fs.readFileSync(asset.file());
    return send(200, asset.type, body, asset.type.startsWith("text/html") ? HTML_HEADERS : {});
  } catch (err) {
    return send(500, "text/plain; charset=utf-8", `Could not read ${url.pathname}: ${(err as Error).message}`);
  }
}

export function createServer(root: string): http.Server {
  return http.createServer(createHandler(root));
}

/** Starts the explorer on 127.0.0.1 and resolves once it listens. */
export function serve(root: string, port: number): Promise<void> {
  const server = createServer(root);
  return new Promise((done, fail) => {
    server.once("error", (err: NodeJS.ErrnoException) => {
      fail(err.code === "EADDRINUSE" ? new Error(`Port ${port} is in use. Try: pnpm knowledge:explore --port ${port + 1}`) : err);
    });
    server.listen(port, "127.0.0.1", () => {
      const { port: actual } = server.address() as AddressInfo;
      const file = path.join(root, STORE_DIR, STORE_FILE);
      console.log(`Knowledge explorer: http://127.0.0.1:${actual}/`);
      if (!fs.existsSync(file)) console.log("No store yet. Run `pnpm knowledge:index` and reload the page.");
      console.log("Press Ctrl+C to stop.");
      done();
    });
  });
}
