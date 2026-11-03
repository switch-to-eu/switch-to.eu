import fs from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "../src/explore/server";
import { buildGraph } from "../src/graph";
import type { Hit, NodeView, RelatedNode } from "../src/query";
import { buildStore } from "../src/store";

interface Stats {
  generated: string;
  types: { type: string; count: number }[];
  edges: number;
  embeddings: { on: boolean };
}
interface Drawn {
  nodes: { id: string; distance?: number }[];
  edges: { src: string; dst: string; rel: string }[];
}

let root: string;
let server: Server;
let base: string;

function write(rel: string, content: string) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

const build = () => buildStore(root, buildGraph(root, "2026-11-03"));

async function get<T = unknown>(urlPath: string): Promise<{ status: number; type: string; body: T }> {
  const res = await fetch(base + urlPath);
  const type = res.headers.get("content-type") ?? "";
  const body = (type.startsWith("application/json") ? await res.json() : await res.text()) as T;
  return { status: res.status, type, body };
}

beforeEach(async () => {
  vi.stubEnv("KNOWLEDGE_EMBED", "off");
  root = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-explore-"));
  write("content/categories/email/en.md", "---\ntitle: Email\ndescription: Email providers.\n---\n");
  write(
    "content/services/gmail/en.md",
    [
      "---",
      "name: Gmail",
      "region: non-eu",
      "category: email",
      "description: Google's email service.",
      "recommendedAlternative: proton-mail",
      "parentCompany: Google LLC",
      "url: https://mail.google.com",
      "lastResearchedAt: '2025-01-01'",
      "pricingDetails: 'Free with 15 GB.'",
      "---",
      "Gmail scans email for ads.",
      "",
    ].join("\n")
  );
  write(
    "content/services/proton-mail/en.md",
    "---\nname: Proton Mail\nregion: eu-friendly\ncategory: email\ndescription: Encrypted email from Geneva.\nparentCompany: Proton AG\n---\nEncrypted email, based in Geneva.\n"
  );
  build();
  // Port 0: the OS picks a free port, so tests never clash with a running explorer.
  server = createServer(root);
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  await new Promise((done) => server.close(done));
  vi.unstubAllEnvs();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("explorer API", () => {
  it("reports stats and searches with marked snippets", async () => {
    const stats = await get<Stats>("/api/stats");
    expect(stats.status).toBe(200);
    expect(stats.body.generated).toBe("2026-11-03");
    expect(stats.body.types).toEqual(expect.arrayContaining([expect.objectContaining({ type: "service", count: 2 })]));
    expect(stats.body.edges).toBeGreaterThan(0);
    expect(stats.body.embeddings.on).toBe(false);

    const search = await get<{ hits: Hit[] }>("/api/search?q=encrypted%20email&type=service");
    expect(search.status).toBe(200);
    expect(search.body.hits[0]!.id).toBe("services/proton-mail");
    expect(search.body.hits[0]!.snippet).toContain("«");

    expect((await get("/api/search?q=")).status).toBe(400);
    expect((await get("/api/search?q=x&lang=english")).status).toBe(400);
    expect((await get("/api/nope")).status).toBe(404);
  });

  it("returns nodes, graphs and context, and 404s unknown ids with suggestions", async () => {
    const node = await get<NodeView>("/api/node?id=services/gmail");
    expect(node.status).toBe(200);
    expect(node.body.out).toEqual(expect.arrayContaining([expect.objectContaining({ rel: "alternative", id: "services/proton-mail" })]));
    expect(node.body.in).toEqual(expect.arrayContaining([expect.objectContaining({ rel: "provides", id: "google" })]));
    expect(node.body.facts.find((f) => f.field === "pricingDetails")).toMatchObject({ date: "2025-01-01" });

    const missing = await get<{ error: string }>("/api/node?id=services/gmial");
    expect(missing.status).toBe(404);
    expect(missing.body.error).toContain("services/gmial");
    expect((await get("/api/node")).status).toBe(400);

    const near = await get<Drawn>("/api/graph?center=services/gmail&hops=1");
    expect(near.body.nodes[0]).toMatchObject({ id: "services/gmail", distance: 0 });
    expect(near.body.edges).toEqual(expect.arrayContaining([{ src: "services/gmail", dst: "services/proton-mail", rel: "alternative" }]));
    const all = await get<Drawn>("/api/graph");
    expect(all.body.nodes.map((n) => n.id)).toEqual(expect.arrayContaining(["services/gmail", "google", "categories/email"]));
    expect((await get("/api/graph?center=nope")).status).toBe(404);

    const related = await get<{ nodes: RelatedNode[] }>("/api/related?id=google&hops=2");
    expect(related.body.nodes.map((n) => n.id)).toContain("services/proton-mail");

    const ctx = await get<{ markdown: string }>("/api/context?target=services/gmail&budget=2000");
    expect(ctx.status).toBe(200);
    expect(ctx.body.markdown).toContain("# Context: Gmail");
    expect((await get("/api/context?target=")).status).toBe(400);
  });

  it("serves the UI, refuses other paths, and picks up a rebuilt store", async () => {
    const page = await get<string>("/");
    expect(page.status).toBe(200);
    expect(page.type).toContain("text/html");
    expect(page.body).toContain("/app.js");
    for (const asset of ["/app.js", "/style.css", "/vendor/cytoscape.min.js"]) expect((await get(asset)).status).toBe(200);
    expect((await get("/server.ts")).status).toBe(404);

    expect((await get("/api/node?id=services/tuta")).status).toBe(404);
    write("content/services/tuta/en.md", "---\nname: Tuta\ncategory: email\ndescription: Encrypted mail from Hanover.\n---\nTuta.\n");
    build();
    const fresh = await get<NodeView>("/api/node?id=services/tuta");
    expect(fresh.status).toBe(200);
    expect(fresh.body.node.title).toBe("Tuta");
  });
});
