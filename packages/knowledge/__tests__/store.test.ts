import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { embedConfig, embedStore, loadVectors } from "../src/embed";
import { buildGraph } from "../src/graph";
import { context, getNode, openStore, related, resolve, search } from "../src/query";
import { buildStore, chunkMarkdown, companyName, normalizeUrl } from "../src/store";

let root: string;
let db: DatabaseSync | undefined;

function write(rel: string, content: string) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function build() {
  const stats = buildStore(root, buildGraph(root, "2026-11-03"));
  db = openStore(root);
  return stats;
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-store-"));
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
      "parentCompany: Google LLC (Alphabet Inc.)",
      "url: https://mail.google.com",
      "lastResearchedAt: '2026-03-01'",
      "pricingUrl: https://workspace.google.com/pricing",
      "pricingDetails: 'Free with 15 GB.'",
      "sourceUrls:",
      "- url: https://workspace.google.com/pricing/",
      "  label: Pricing",
      "  checkedAt: '2026-10-01'",
      "recentNews:",
      "- source: NOS",
      "  url: https://nos.nl/gmail",
      "  title: Gmail scans mail",
      "  date: '2026-09-30'",
      "  summary: A short summary.",
      "researchNotes: |-",
      "  ## Privacy",
      "",
      "  Gmail scans email content for ad targeting.",
      "updatedAt: '2026-10-02'",
      "---",
      "Gmail is the most used email service.",
      "",
      "## Worth knowing",
      "",
      "Your inbox feeds the advertising profile.",
      "",
    ].join("\n")
  );
  write("content/services/gmail/nl.md", "---\ndescription: De e-maildienst van Google.\n---\nGmail is de meest gebruikte e-maildienst.\n");
  write(
    "content/services/proton-mail/en.md",
    "---\nname: Proton Mail\nregion: eu-friendly\ncategory: email\ndescription: Encrypted email from Geneva.\nparentCompany: Proton AG\nurl: https://proton.me/mail\n---\nEncrypted mail, based in Genève.\n"
  );
  write(
    "content/services/google-drive/en.md",
    "---\nname: Google Drive\nregion: non-eu\ncategory: email\ndescription: Cloud storage.\nparentCompany: Alphabet Inc.\n---\nStorage.\n"
  );
  write(
    "content/services/google-maps/en.md",
    "---\nname: Google Maps\nregion: non-eu\ncategory: email\ndescription: Maps.\nparentCompany: Google LLC\n---\nMaps.\n"
  );
  write(
    "content/guides/gmail-to-proton-mail/en.md",
    "---\ntitle: Gmail to Proton Mail\ndescription: Move your mail.\ncategory: email\nsourceService: gmail\ntargetService: proton-mail\nmissingFeatures:\n- Smart compose\n---\nExport your mail first.\n"
  );
  write(
    "knowledge/entities/company/microsoft.md",
    "---\ntype: entity\nkind: company\nname: Microsoft\naliases: [MSFT]\nsummary: US vendor.\nupdated: '2026-11-01'\n---\n## Facts\n- 2026-10-30 · Won a tender. [[2026-11-01-tender#c1]]\n- ~~2025-01-01 · Old claim.~~ superseded 2026-10-30 [[2026-11-01-tender#c2]]\n"
  );
  write(
    "knowledge/stories/cloud-exit.md",
    "---\ntype: story\ntitle: Cloud exit\nstatus: active\nentities: [microsoft]\nservices: [gmail]\nlast_event: '2026-10-30'\nupdated: '2026-11-01'\n---\n## Timeline\n- 2026-10-30 · Tender published. [[2026-11-01-tender#c2]]\n"
  );
  write(
    "knowledge/sources/2026/11/2026-11-01-tender.md",
    "---\ntype: source\ntitle: Tender\nurl: https://www.example.org/a/?utm=1\npublisher: NOS\npublished: '2026-10-30'\nfetched: '2026-11-01'\nreliability: high\nentities: [microsoft]\nstories: [cloud-exit]\n---\n**Claims**\n- `c1` The ministry picked Microsoft.\n- `c2` The tender closes in December.\n"
  );
  write("knowledge/flags.md", "# Flags\n\n- 2026-11-02 · services/gmail · price change · [[2026-11-01-tender#c1]]\n");
});

afterEach(() => {
  db?.close();
  db = undefined;
  vi.unstubAllGlobals();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("helpers", () => {
  it("normalizes company names and URLs", () => {
    expect(companyName("Google LLC (Alphabet Inc.)")).toBe("Google");
    expect(companyName("Heinlein Group (Heinlein Hosting GmbH)")).toBe("Heinlein");
    expect(companyName("Surfboard Holding BV")).toBe("Surfboard");
    expect(companyName("Vivaldi Technologies AS")).toBe("Vivaldi Technologies");
    expect(companyName("Organic Maps OÜ")).toBe("Organic Maps");
    expect(normalizeUrl("https://www.Example.org/a/?utm=1#x")).toBe("example.org/a");
  });

  it("splits markdown at headings and drops HTML comments", () => {
    const chunks = chunkMarkdown("Intro text.\n\n## One\n<!-- step-start -->\nFirst.\n\n### Two\nSecond.");
    expect(chunks).toEqual([
      { heading: "", text: "Intro text." },
      { heading: "One", text: "First." },
      { heading: "Two", text: "Second." },
    ]);
  });
});

describe("buildStore", () => {
  it("derives owner companies and the edges content implies", () => {
    const stats = build();
    expect(stats.companies).toBe(3); // google, alphabet, proton
    const google = getNode(db!, "google")!;
    expect(google.node.virtual).toBe(1);
    expect(google.out.map((e) => `${e.rel} ${e.id}`)).toEqual(["part-of alphabet", "provides services/gmail", "provides services/google-maps"]);
    const gmail = getNode(db!, "services/gmail")!;
    expect(gmail.out.map((e) => `${e.rel} ${e.id}`)).toContain("alternative services/proton-mail");
    expect(gmail.in.map((e) => `${e.rel} ${e.id}`)).toContain("migrates-from guides/gmail-to-proton-mail");
  });

  it("keeps research facts with the freshest evidence date", () => {
    build();
    const facts = getNode(db!, "services/gmail")!.facts;
    // pricingDetails cites pricingUrl, which sourceUrls checked later than the research run.
    expect(facts.find((f) => f.field === "pricingDetails")).toMatchObject({ value: "Free with 15 GB.", date: "2026-10-01" });
    expect(facts.find((f) => f.field === "parentCompany")?.date).toBe("2026-03-01");
  });

  it("stores events, flags, claims and dated entity facts", () => {
    build();
    const gmail = getNode(db!, "services/gmail")!;
    expect(gmail.events.map((e) => `${e.kind} ${e.date}`)).toEqual(["flag 2026-11-02", "news 2026-09-30"]);
    expect(getNode(db!, "2026-11-01-tender")!.claims.map((c) => c.claim_id)).toEqual(["c1", "c2"]);
    const ms = getNode(db!, "microsoft")!.facts;
    expect(ms.map((f) => `${f.field} ${f.date}`)).toEqual(["fact 2026-10-30", "superseded 2025-01-01"]);
    expect(getNode(db!, "cloud-exit")!.events[0]).toMatchObject({ kind: "timeline", title: "Tender published." });
  });
});

describe("queries", () => {
  it("searches both locales, without caring about accents", async () => {
    build();
    expect((await search(db!, "geneve"))[0]?.id).toBe("services/proton-mail");
    const nl = await search(db!, "e-maildienst", { lang: "nl" });
    expect(nl.map((h) => h.id)).toEqual(["services/gmail"]);
    expect(nl[0]?.lang).toBe("nl");
    const research = await search(db!, "ad targeting");
    expect(research[0]).toMatchObject({ id: "services/gmail", heading: "Research: Privacy" });
    expect(await search(db!, "storage", { types: ["guide"] })).toEqual([]);
  });

  it("resolves names, legal names and URLs to existing nodes", () => {
    build();
    expect(resolve(db!, "Proton AG").matches[0]).toMatchObject({ id: "proton", match: "alias" });
    expect(resolve(db!, "msft").matches[0]?.id).toBe("microsoft");
    expect(resolve(db!, "http://example.org/a").matches[0]).toMatchObject({ id: "2026-11-01-tender", match: "url" });
    expect(resolve(db!, "Kagi").matches).toEqual([]);
  });

  it("walks the graph in both directions", () => {
    build();
    const near = related(db!, "google", 2);
    expect(near.find((n) => n.id === "alphabet")?.distance).toBe(1);
    expect(near.find((n) => n.id === "services/google-drive")).toMatchObject({ distance: 2, via: { from: "alphabet", rel: "provides" } });
  });

  it("builds a cited context brief within the budget", async () => {
    build();
    const brief = await context(db!, "services/gmail", { today: "2026-11-03" });
    expect(brief).toContain("# Context: Gmail");
    expect(brief).toContain("Pricing details: Free with 15 GB. (as of 2026-10-01) https://workspace.google.com/pricing");
    expect(brief).toContain("Evidence: newest check 2026-10-01 (33 days ago).");
    expect(brief).toContain("Google also provides: Google Maps");
    expect(brief.split("## Related")[1]).toContain("- Proton Mail `services/proton-mail` (service, alternative)");
    const small = await context(db!, "services/gmail", { budget: 120, today: "2026-11-03" });
    expect(small.length).toBeLessThan(brief.length);
    expect(await context(db!, "zzz nothing")).toContain("Nothing in the knowledge base");
  });
});

describe("embeddings", () => {
  it("picks a provider from the environment", () => {
    expect(embedConfig({})).toBeNull();
    expect(embedConfig({ MISTRAL_API_KEY: "k", OPENAI_API_KEY: "o" })?.provider).toBe("mistral");
    expect(embedConfig({ OPENAI_API_KEY: "o" })?.model).toBe("text-embedding-3-small");
    expect(embedConfig({ KNOWLEDGE_EMBED: "off", MISTRAL_API_KEY: "k" })).toBeNull();
    expect(embedConfig({ KNOWLEDGE_EMBED: "lmstudio" })?.url).toBe("http://localhost:1234/v1/embeddings");
    expect(() => embedConfig({ KNOWLEDGE_EMBED: "openai" })).toThrow(/OPENAI_API_KEY/);
  });

  it("embeds only new passages and adds vector hits to search", async () => {
    build();
    // A fake provider: one dimension per keyword. "correo" maps to the Gmail dimension.
    const vec = (t: string) => ["gmail", "proton", "storage", "tender"].map((k) => (t.toLowerCase().includes(k) ? 1 : 0.01));
    const fetchMock = vi.fn((_url: string, init: { body: string }) => {
      const { input } = JSON.parse(init.body) as { input: string[] };
      return Promise.resolve(new Response(JSON.stringify({ data: input.map((t, index) => ({ index, embedding: vec(t.includes("correo") ? "gmail" : t) })) })));
    });
    vi.stubGlobal("fetch", fetchMock);
    const cfg = { provider: "test", model: "fake-1", url: "http://test/v1/embeddings" };

    const first = await embedStore(root, cfg);
    expect(first.embedded).toBeGreaterThan(0);
    expect((await embedStore(root, cfg)).embedded).toBe(0);
    expect(loadVectors(root, "fake-1").size).toBe(first.embedded);

    // No word overlap with any passage, so only the vectors can find it.
    const hits = await search(db!, "correo electronico", { vectors: { cfg, root } });
    expect(hits[0]?.id).toBe("services/gmail");
  });
});
