import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { STORE_DIR, STORE_FILE } from "./store";

/**
 * Optional embeddings for the knowledge store, so search also finds passages
 * that mean the same thing in other words (or in the other language).
 *
 * One client for every provider that speaks the OpenAI embeddings API:
 * Mistral (EU, the default), OpenAI, and a local LM Studio server.
 *
 * KNOWLEDGE_EMBED picks the provider: `auto` (default), `mistral`, `openai`,
 * `lmstudio` or `off`. `auto` uses Mistral when MISTRAL_API_KEY is set, then
 * OpenAI when OPENAI_API_KEY is set, and is off otherwise. KNOWLEDGE_EMBED_MODEL
 * and KNOWLEDGE_EMBED_URL override the defaults. Vectors are cached in
 * knowledge/.cache/embeddings.db by text hash and model, so a rebuild only
 * embeds passages that changed. Without embeddings, search is full-text only.
 */

export interface EmbedConfig {
  provider: string;
  model: string;
  url: string;
  key?: string;
}

const PROVIDERS: Record<string, { url: string; model: string; keyEnv?: string }> = {
  mistral: { url: "https://api.mistral.ai/v1/embeddings", model: "mistral-embed", keyEnv: "MISTRAL_API_KEY" },
  openai: { url: "https://api.openai.com/v1/embeddings", model: "text-embedding-3-small", keyEnv: "OPENAI_API_KEY" },
  lmstudio: { url: "http://localhost:1234/v1/embeddings", model: "text-embedding-nomic-embed-text-v1.5" },
};

const CACHE_FILE = "embeddings.db";
const BATCH = 32;

/** Reads KEY=value lines from the repo's .env. Never overrides the environment. */
export function loadDotEnv(root: string): void {
  const file = path.join(root, ".env");
  if (!fs.existsSync(file)) return;
  for (const m of fs.readFileSync(file, "utf8").matchAll(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/gm)) {
    const value = m[2]!.replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[m[1]!] === undefined) process.env[m[1]!] = value;
  }
}

export function embedConfig(env: NodeJS.ProcessEnv = process.env): EmbedConfig | null {
  const choice = (env.KNOWLEDGE_EMBED ?? "auto").toLowerCase();
  if (choice === "off") return null;
  const provider =
    choice === "auto" ? (env.MISTRAL_API_KEY ? "mistral" : env.OPENAI_API_KEY ? "openai" : null) : choice;
  if (!provider) return null;
  const p = PROVIDERS[provider];
  if (!p) throw new Error(`KNOWLEDGE_EMBED=${choice}: use auto, mistral, openai, lmstudio or off`);
  const key = p.keyEnv ? env[p.keyEnv] : undefined;
  if (p.keyEnv && !key) throw new Error(`KNOWLEDGE_EMBED=${provider} needs ${p.keyEnv}`);
  return { provider, model: env.KNOWLEDGE_EMBED_MODEL ?? p.model, url: env.KNOWLEDGE_EMBED_URL ?? p.url, key };
}

function unit(v: Float32Array): Float32Array {
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum) || 1;
  return v.map((x) => x / norm);
}

/** Unit-length vectors, so a dot product is the cosine similarity. */
export async function embed(cfg: EmbedConfig, texts: string[], kind: "document" | "query"): Promise<Float32Array[]> {
  // Nomic models expect a task prefix. The others ignore it, so only add it there.
  const prefix = /nomic/i.test(cfg.model) ? (kind === "query" ? "search_query: " : "search_document: ") : "";
  const out: Float32Array[] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: { "content-type": "application/json", ...(cfg.key ? { authorization: `Bearer ${cfg.key}` } : {}) },
      body: JSON.stringify({ model: cfg.model, input: texts.slice(i, i + BATCH).map((t) => prefix + t) }),
    });
    if (!res.ok) throw new Error(`${cfg.provider} embeddings: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
    for (const d of json.data.sort((a, b) => a.index - b.index)) out.push(unit(Float32Array.from(d.embedding)));
  }
  return out;
}

function openCache(root: string): DatabaseSync {
  const db = new DatabaseSync(path.join(root, STORE_DIR, CACHE_FILE));
  db.exec("CREATE TABLE IF NOT EXISTS vectors (hash TEXT NOT NULL, model TEXT NOT NULL, vec BLOB NOT NULL, PRIMARY KEY (hash, model))");
  return db;
}

/** Embeds every passage in the store that has no cached vector for this model. */
export async function embedStore(root: string, cfg: EmbedConfig): Promise<{ embedded: number; cached: number }> {
  const store = new DatabaseSync(path.join(root, STORE_DIR, STORE_FILE), { readOnly: true });
  const rows = store
    .prepare("SELECT m.hash, c.title, c.heading, c.text FROM chunk_meta m JOIN chunks c ON c.rowid = m.id")
    .all() as { hash: string; title: string; heading: string; text: string }[];
  store.close();
  const cache = openCache(root);
  const have = new Set(
    (cache.prepare("SELECT hash FROM vectors WHERE model = ?").all(cfg.model) as { hash: string }[]).map((r) => r.hash)
  );
  const missing = [...new Map(rows.filter((r) => !have.has(r.hash)).map((r) => [r.hash, r])).values()];
  if (missing.length) {
    const vectors = await embed(cfg, missing.map((r) => `${r.title}: ${r.heading}\n${r.text}`), "document");
    const ins = cache.prepare("INSERT OR REPLACE INTO vectors (hash, model, vec) VALUES (?, ?, ?)");
    cache.exec("BEGIN");
    missing.forEach((r, i) => ins.run(r.hash, cfg.model, Buffer.from(vectors[i]!.buffer)));
    cache.exec("COMMIT");
  }
  cache.close();
  return { embedded: missing.length, cached: rows.length - missing.length };
}

/** Cached vectors for one model, by passage hash. Empty when nothing was embedded. */
export function loadVectors(root: string, model: string): Map<string, Float32Array> {
  const file = path.join(root, STORE_DIR, CACHE_FILE);
  if (!fs.existsSync(file)) return new Map();
  const db = new DatabaseSync(file, { readOnly: true });
  const rows = db.prepare("SELECT hash, vec FROM vectors WHERE model = ?").all(model) as { hash: string; vec: Uint8Array }[];
  db.close();
  // Copy the bytes: a blob can start at an offset that Float32Array can't use.
  return new Map(rows.map((r) => [r.hash, new Float32Array(Uint8Array.from(r.vec).buffer)]));
}
