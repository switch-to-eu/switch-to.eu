import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { embedConfig, embedStore, loadDotEnv } from "./embed";
import { buildGraph, renderIndex } from "./graph";
import { context, getNode, openStore, related, renderNode, resolve, search } from "./query";
import { buildStore } from "./store";

/**
 * pnpm knowledge:index [--check] [--no-embed]
 *   Rebuilds knowledge/index.md, knowledge/graph.json and the search store
 *   (knowledge/.cache/knowledge.db), embeds changed passages when an embedding
 *   provider is configured, and prints the health report. With --check, exits 1
 *   when there are errors (broken links, invalid frontmatter), without writing.
 *
 * pnpm knowledge <command> [args] [--json]
 *   search <query>     [--type service,entity] [--lang en|nl] [--limit 10]
 *   node <id>          one node: facts, links, events, sources, claims
 *   resolve <name|url> existing nodes for a name or URL (empty = new)
 *   related <id>       [--hops 2]
 *   context <id|topic> [--budget 6000] [--query "..."] [--lang en|nl]
 *   explore            [--port 4400] local web explorer
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
loadDotEnv(root);

const argv = process.argv.slice(2);
const flags = new Map<string, string | true>();
const positional: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]!;
  if (!a.startsWith("--")) positional.push(a);
  else if (argv[i + 1] !== undefined && !argv[i + 1]!.startsWith("--") && !["--check", "--json", "--no-embed"].includes(a)) flags.set(a.slice(2), argv[++i]!);
  else flags.set(a.slice(2), true);
}
const flag = (name: string) => (typeof flags.get(name) === "string" ? (flags.get(name) as string) : undefined);
const num = (name: string, fallback: number) => Number(flag(name) ?? fallback);
const json = flags.has("json");
const [command = "index", ...rest] = positional;
const arg = rest.join(" ");

function print(value: unknown, text: () => string) {
  console.log(json ? JSON.stringify(value, null, 1) : text());
}

/** Vector search when a provider is configured and passages were embedded. */
function vectors() {
  try {
    const cfg = embedConfig();
    return cfg ? { cfg, root } : undefined;
  } catch {
    return undefined;
  }
}

async function index() {
  const check = flags.has("check");
  const graph = buildGraph(root, process.env.KNOWLEDGE_TODAY);
  const errors = graph.issues.filter((i) => i.level === "error");
  const warnings = graph.issues.filter((i) => i.level === "warning");
  const count = (type: string) => Object.values(graph.nodes).filter((n) => n.type === type).length;

  if (!check) {
    const { issues: _issues, ...data } = graph;
    fs.writeFileSync(path.join(root, "knowledge/graph.json"), JSON.stringify(data, null, 1) + "\n");
    fs.writeFileSync(path.join(root, "knowledge/index.md"), renderIndex(graph));
  }

  console.log(
    `knowledge: ${count("source")} sources, ${count("entity")} entities, ${count("story")} stories, ${count("article")} articles, ${graph.edges.length} edges`
  );
  for (const issue of [...errors, ...warnings]) {
    console.log(`  ${issue.level === "error" ? "✖" : "⚠"} ${issue.code}${issue.node ? ` ${issue.node}` : ""}: ${issue.message}`);
  }
  console.log(`${errors.length} errors, ${warnings.length} warnings${check ? "" : " · wrote knowledge/index.md, knowledge/graph.json"}`);

  if (check) {
    if (errors.length) process.exit(1);
    return;
  }
  const s = buildStore(root, graph);
  console.log(
    `store: ${s.nodes} nodes (${s.companies} derived companies), ${s.edges} edges, ${s.chunks} passages, ${s.facts} facts, ${s.events} events, ${s.urls} urls, ${s.claims} claims`
  );
  if (flags.has("no-embed")) return;
  try {
    const cfg = embedConfig();
    if (!cfg) {
      console.log("embeddings: off (set MISTRAL_API_KEY or OPENAI_API_KEY, or KNOWLEDGE_EMBED=lmstudio)");
      return;
    }
    const r = await embedStore(root, cfg);
    console.log(`embeddings: ${cfg.provider} ${cfg.model}, ${r.embedded} new, ${r.cached} cached`);
  } catch (err) {
    // The store works without vectors, so a provider problem is a warning, not a failure.
    console.log(`  ⚠ embeddings skipped: ${(err as Error).message}`);
  }
}

async function main() {
  if (command === "index") return index();
  if (command === "explore") {
    const { serve } = await import("./explore/server");
    return serve(root, num("port", 4400));
  }

  const db = openStore(root);
  if (!arg) throw new Error(`Usage: pnpm knowledge ${command} <${command === "search" || command === "context" ? "text" : "id"}>`);

  if (command === "search") {
    const types = flag("type")?.split(",");
    const hits = await search(db, arg, { limit: num("limit", 10), types, lang: flag("lang"), vectors: vectors() });
    print(hits, () =>
      hits.length
        ? hits.map((h, i) => `${i + 1}. ${h.title} (${h.type}) ${h.id}\n   ${h.heading || "Intro"} [${h.lang}]: ${h.snippet}`).join("\n")
        : "No matches."
    );
  } else if (command === "node") {
    const view = getNode(db, arg);
    if (!view) throw new Error(`No node "${arg}". Try: pnpm knowledge resolve "${arg}"`);
    print(view, () => `${renderNode(db, arg, { passages: 0 })}\n\nAliases: ${view.aliases.join(", ")}`);
  } else if (command === "resolve") {
    const r = resolve(db, arg);
    print(r, () =>
      r.matches.length
        ? r.matches.map((m) => `${m.confidence.toFixed(1)} ${m.match.padEnd(6)} ${m.id} (${m.type}) ${m.title}${m.via ? `, via ${m.via}` : ""}`).join("\n")
        : `No match for "${arg}": treat it as new.`
    );
  } else if (command === "related") {
    const nodes = related(db, arg, num("hops", 2));
    print(nodes, () => nodes.map((n) => `${n.distance} ${n.via.from} -${n.via.rel}-> ${n.via.to}   ${n.title} (${n.type})`).join("\n") || "No links.");
  } else if (command === "context") {
    const brief = await context(db, arg, { budget: num("budget", 6000), query: flag("query"), lang: flag("lang"), vectors: vectors() });
    print({ target: arg, markdown: brief }, () => brief);
  } else {
    throw new Error(`Unknown command "${command}". Use index, search, node, resolve, related, context or explore.`);
  }
}

main().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
