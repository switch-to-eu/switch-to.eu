import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildGraph, renderIndex } from "../src/graph";

let root: string;

function write(rel: string, content: string) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

const source = (slug: string, fm: string, body = "**Claims**\n- `c1` A claim.\n- `c2` Another.\n") =>
  write(`knowledge/sources/${slug.slice(0, 4)}/${slug.slice(5, 7)}/${slug}.md`, `---\n${fm}\n---\n${body}`);

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-"));
  write("content/services/nextcloud/en.md", "---\nname: Nextcloud\ncategory: storage\n---\n");
  write("content/categories/storage/en.md", "---\ntitle: Storage\n---\n");
  write(
    "knowledge/entities/company/microsoft/../microsoft.md",
    "---\ntype: entity\nkind: company\nname: Microsoft\naliases: [MSFT]\nsummary: US vendor.\nupdated: '2026-11-01'\n---\n## Facts\n- 2026-10-30 · Thing. [[2026-11-01-tender#c1]]\n"
  );
  write(
    "knowledge/stories/cloud-exit.md",
    "---\ntype: story\ntitle: Cloud exit\nstatus: active\nentities: [microsoft]\nservices: [nextcloud]\ncategories: [storage]\nlast_event: '2026-10-30'\nupdated: '2026-11-01'\n---\n## Timeline\n- 2026-10-30 · Tender. [[2026-11-01-tender#c2]]\n"
  );
  source(
    "2026-11-01-tender",
    "type: source\ntitle: Tender\nurl: https://example.org/a\npublisher: NOS\npublished: '2026-10-30'\nfetched: '2026-11-01'\nreliability: high\nentities: [microsoft]\nstories: [cloud-exit]"
  );
});

afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe("buildGraph", () => {
  it("builds nodes, edges and backlinks across knowledge and content", () => {
    const g = buildGraph(root, "2026-11-02");
    expect(g.nodes["microsoft"]?.type).toBe("entity");
    expect(g.nodes["cloud-exit"]?.type).toBe("story");
    expect(g.nodes["services/nextcloud"]?.type).toBe("service");
    expect(g.backlinks["microsoft"]).toEqual(["2026-11-01-tender", "cloud-exit"]);
    expect(g.backlinks["2026-11-01-tender"]).toEqual(["cloud-exit", "microsoft"]);
    expect(g.issues.filter((i) => i.level === "error")).toEqual([]);
  });

  it("computes heat from recent sources weighted by reliability", () => {
    expect(buildGraph(root, "2026-10-30").nodes["cloud-exit"]?.heat).toBe(3);
    expect(buildGraph(root, "2026-11-14").nodes["cloud-exit"]?.heat).toBe(1.5);
    expect(buildGraph(root, "2026-12-30").nodes["cloud-exit"]?.heat).toBe(0);
  });

  it("reports broken links and claim anchors", () => {
    write(
      "knowledge/stories/other.md",
      "---\ntype: story\ntitle: Other\nstatus: active\nentities: [nobody]\n---\nSee [[2026-11-01-tender#c9]].\n"
    );
    const codes = buildGraph(root, "2026-11-02").issues.map((i) => `${i.code}:${i.node}`);
    expect(codes).toContain("broken-link:other");
    expect(codes).toContain("broken-claim:other");
  });

  it("flags duplicate slugs, aliases, invalid values and dormant stories", () => {
    write("knowledge/stories/microsoft.md", "---\ntype: story\ntitle: Dup\nstatus: active\n---\n");
    write("knowledge/entities/company/msft-corp.md", "---\ntype: entity\nkind: company\nname: MSFT\n---\n");
    source(
      "2026-11-01-bad",
      "type: source\ntitle: Bad\nurl: https://example.org/a\npublisher: X\nfetched: '2026-11-01'\nreliability: shaky"
    );
    const g = buildGraph(root, "2027-03-01");
    const codes = g.issues.map((i) => `${i.code}:${i.node}`);
    expect(codes).toContain("duplicate-slug:microsoft");
    expect(codes).toContain("duplicate-alias:msft-corp");
    expect(codes).toContain("bad-value:2026-11-01-bad");
    expect(codes).toContain("duplicate-url:2026-11-01-tender");
    expect(codes).toContain("dormant-candidate:cloud-exit");
    expect(codes).toContain("orphan:msft-corp");
  });

  it("treats articles as graph nodes and requires a story", () => {
    write(
      "content/articles/tender-news/en.md",
      "---\ntitle: Tender news\ndate: '2026-11-02'\nstory: cloud-exit\nservices: [nextcloud]\ndraft: true\n---\nBody [[microsoft]].\n"
    );
    write("content/articles/no-story/en.md", "---\ntitle: X\ndate: '2026-11-02'\n---\n");
    const g = buildGraph(root, "2026-11-02");
    expect(g.backlinks["cloud-exit"]).toContain("articles/tender-news");
    expect(g.backlinks["microsoft"]).toContain("articles/tender-news");
    expect(g.issues.map((i) => `${i.code}:${i.node}`)).toContain("missing-field:articles/no-story");
    expect(renderIndex(g)).toContain("2026-11-02 · [Tender news](../content/articles/tender-news/en.md) · draft");
  });

  it("renders an index with active stories sorted by heat", () => {
    const index = renderIndex(buildGraph(root, "2026-11-02"));
    expect(index).toContain("## Active stories (1)");
    expect(index).toContain("| [Cloud exit](stories/cloud-exit.md) | `cloud-exit` |");
    expect(index).toContain("### company");
  });
});
