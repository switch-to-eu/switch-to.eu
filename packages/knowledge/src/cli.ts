import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildGraph, renderIndex } from "./graph";

/**
 * pnpm knowledge:index [--check]
 *
 * Rebuilds knowledge/index.md and knowledge/graph.json and prints the health
 * report. With --check, exits 1 when there are errors (broken links, invalid
 * frontmatter), without writing files.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const check = process.argv.includes("--check");
const graph = buildGraph(root, process.env.KNOWLEDGE_TODAY);

const errors = graph.issues.filter((i) => i.level === "error");
const warnings = graph.issues.filter((i) => i.level === "warning");
const count = (type: string) => Object.values(graph.nodes).filter((n) => n.type === type).length;

if (!check) {
  const { issues: _issues, ...json } = graph;
  fs.writeFileSync(path.join(root, "knowledge/graph.json"), JSON.stringify(json, null, 1) + "\n");
  fs.writeFileSync(path.join(root, "knowledge/index.md"), renderIndex(graph));
}

console.log(
  `knowledge: ${count("source")} sources, ${count("entity")} entities, ${count("story")} stories, ${count("article")} articles, ${graph.edges.length} edges`
);
for (const issue of [...errors, ...warnings]) {
  console.log(`  ${issue.level === "error" ? "✖" : "⚠"} ${issue.code}${issue.node ? ` ${issue.node}` : ""}: ${issue.message}`);
}
console.log(`${errors.length} errors, ${warnings.length} warnings${check ? "" : " · wrote knowledge/index.md, knowledge/graph.json"}`);

if (check && errors.length) process.exit(1);
