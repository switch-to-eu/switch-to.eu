import { z } from "zod";
import type { PayloadRequest, CollectionSlug } from "payload";

/**
 * Custom MCP tool: replace_link_in_doc
 *
 * Surgically swaps a link URL inside a Payload doc's Lexical rich-text
 * fields. Walks every link / autolink node, replaces `fields.url` exact
 * matches, and (by default) rewrites the link's visible text node when
 * its text equals the old URL. Saves once per locale.
 *
 * Why an MCP tool: external SEO crawls regularly produce lists of broken
 * outbound URLs. Each fix is a one-line change inside a 30–40 KB Lexical
 * tree. Doing this through CRUD update tools forces the LLM to re-emit
 * the entire tree as a tool-call argument, which is unreliable.
 *
 * Scope: knows the rich-text-shaped fields per collection. For guides
 * that includes the per-step `content` field inside the `steps` array.
 * Add new collections by extending RICHTEXT_FIELDS below.
 */

const RICHTEXT_FIELDS: Record<string, string[]> = {
  pages: ["content"],
  guides: ["intro", "beforeYouStart", "troubleshooting", "outro"],
  services: ["content"],
  categories: ["content"],
  "landing-pages": ["content"],
};

const STEPS_COLLECTIONS = new Set(["guides"]);

const LOCALES = ["en", "nl"] as const;
type Locale = (typeof LOCALES)[number];

type LexicalNode = {
  type?: string;
  children?: LexicalNode[];
  fields?: { url?: string; [k: string]: unknown };
  text?: string;
  [k: string]: unknown;
};

type Hit = {
  locale: Locale;
  field: string;
  path: string; // e.g. "intro" or "steps[2].content"
  count: number;
};

function walkAndReplace(
  tree: unknown,
  oldUrl: string,
  newUrl: string,
  alsoText: boolean
): number {
  let count = 0;
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const v of node) visit(v);
      return;
    }
    if (!node || typeof node !== "object") return;
    const n = node as LexicalNode;
    if ((n.type === "link" || n.type === "autolink") && n.fields?.url === oldUrl) {
      n.fields.url = newUrl;
      count++;
      if (alsoText && n.children) {
        for (const c of n.children) {
          if (c?.type === "text" && c.text === oldUrl) c.text = newUrl;
        }
      }
    }
    for (const v of Object.values(n)) visit(v);
  };
  visit(tree);
  return count;
}

function looksLikeLexicalRoot(v: unknown): boolean {
  return (
    !!v &&
    typeof v === "object" &&
    "root" in v &&
    typeof (v as { root: unknown }).root === "object"
  );
}

export const replaceLinkInDocTool = {
  name: "replace_link_in_doc",
  description:
    "Replace a link URL across all rich-text fields of a single Payload doc, in both locales. Walks every Lexical link/autolink node; updates `fields.url` on exact matches and (by default) rewrites the visible text when it equals the old URL. Use for fixing broken outbound URLs reported by SEO crawlers, or retargeting external links to a new canonical URL. Returns per-locale, per-field hit counts.",
  parameters: {
    collection: z
      .enum(["pages", "guides", "services", "categories", "landing-pages"])
      .describe("Payload collection slug"),
    slug: z
      .string()
      .optional()
      .describe("Document slug (e.g. 'terms', 'gmail-to-protonmail'). One of slug or id is required."),
    id: z
      .union([z.number(), z.string()])
      .optional()
      .describe("Document id. One of slug or id is required."),
    oldUrl: z.string().describe("Exact URL to find on link/autolink nodes"),
    newUrl: z.string().describe("Replacement URL"),
    newUrlByLocale: z
      .record(z.string())
      .optional()
      .describe(
        "Per-locale replacement override, e.g. { en: 'https://x/index_en', nl: 'https://x/index_nl' }. When set, takes precedence over newUrl for matching locales."
      ),
    alsoText: z
      .boolean()
      .optional()
      .describe("Rewrite the link's visible text when it equals the old URL. Default true."),
    dryRun: z
      .boolean()
      .optional()
      .describe("Report hits without saving. Default false."),
  },
  handler: async (args: Record<string, unknown>, req: PayloadRequest) => {
    const collection = args.collection as CollectionSlug;
    const slug = args.slug as string | undefined;
    const idArg = args.id as number | string | undefined;
    const oldUrl = args.oldUrl as string;
    const baseNew = args.newUrl as string;
    const perLocale = (args.newUrlByLocale as Record<string, string> | undefined) ?? {};
    const alsoText = (args.alsoText as boolean | undefined) ?? true;
    const dryRun = (args.dryRun as boolean | undefined) ?? false;

    if (!slug && idArg === undefined) {
      return {
        isError: true,
        content: [{ type: "text" as const, text: "supply one of: slug, id" }],
      };
    }

    const fieldsToCheck = RICHTEXT_FIELDS[collection];
    if (!fieldsToCheck) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `replace_link_in_doc has no rich-text field map for collection ${collection}. Extend RICHTEXT_FIELDS in apps/website/mcp/replaceLinkInDocTool.ts.`,
          },
        ],
      };
    }
    const includeSteps = STEPS_COLLECTIONS.has(collection);

    // Resolve the doc id from slug if needed
    let docId: number | string;
    if (idArg !== undefined) {
      docId = typeof idArg === "string" && /^\d+$/.test(idArg) ? Number(idArg) : idArg;
    } else {
      const lookup = await req.payload.find({
        collection,
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      const found = lookup.docs[0] as { id?: number | string } | undefined;
      if (!found) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `no ${collection} with slug=${slug}` }],
        };
      }
      docId = found.id!;
    }

    const allHits: Hit[] = [];

    for (const locale of LOCALES) {
      const targetUrl = perLocale[locale] ?? baseNew;

      // Read this locale's view of the doc.
      const doc = (await req.payload.findByID({
        collection,
        id: docId,
        locale,
        depth: 0,
        overrideAccess: true,
        draft: false,
      })) as unknown as Record<string, unknown>;

      const updatePatch: Record<string, unknown> = {};

      for (const fname of fieldsToCheck) {
        const value = doc[fname];
        if (!value) continue;
        // Localized fetch returns flat trees; defensive against `{ root }` shapes only.
        if (!looksLikeLexicalRoot(value)) continue;
        const before = JSON.stringify(value);
        const tree = JSON.parse(before) as unknown;
        const count = walkAndReplace(tree, oldUrl, targetUrl, alsoText);
        if (count > 0) {
          allHits.push({ locale, field: fname, path: fname, count });
          updatePatch[fname] = tree;
        }
      }

      // Per-step content for guides (or any collection in STEPS_COLLECTIONS).
      if (includeSteps && Array.isArray(doc.steps)) {
        const steps = JSON.parse(JSON.stringify(doc.steps)) as Array<Record<string, unknown>>;
        let stepsChanged = false;
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i]!;
          const stepContent = step.content;
          if (!looksLikeLexicalRoot(stepContent)) continue;
          const count = walkAndReplace(stepContent, oldUrl, targetUrl, alsoText);
          if (count > 0) {
            allHits.push({
              locale,
              field: "steps[].content",
              path: `steps[${i}].content`,
              count,
            });
            stepsChanged = true;
          }
        }
        if (stepsChanged) updatePatch.steps = steps;
      }

      if (!dryRun && Object.keys(updatePatch).length > 0) {
        await req.payload.update({
          collection,
          id: docId,
          locale,
          data: updatePatch as never,
          overrideAccess: true,
          draft: false,
          depth: 0,
        });
      }
    }

    const summary = {
      ok: true,
      collection,
      docId,
      slug: slug ?? null,
      oldUrl,
      newUrl: baseNew,
      newUrlByLocale: perLocale,
      alsoText,
      dryRun,
      totalReplaced: allHits.reduce((s, h) => s + h.count, 0),
      hits: allHits,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(summary) }],
    };
  },
};
