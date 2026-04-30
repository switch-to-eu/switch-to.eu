import { z } from "zod";

/**
 * Custom MCP tool: jina_search
 *
 * Wraps Jina Search (https://s.jina.ai/) so skills can do organic web search +
 * optional page scraping in a single call. Used by the `research`, `seo-audit`,
 * and `opportunity-finder` skills.
 *
 * Auth: reads JINA_READER_API_KEY from process.env. Must be present in
 * apps/website/.env (same key works for Reader + Search — historical naming).
 *
 * Why an MCP tool instead of WebFetch: WebFetch can't pass the
 * `Authorization: Bearer` header Jina requires.
 */

export const jinaSearchTool = {
  name: "jina_search",
  description:
    "Web search via Jina Search (s.jina.ai). Returns JSON with data[] entries (url, title, description). Pass withContent=true to also include scraped Markdown body of each result. Default country/language is nl/en — override per call when needed.",
  parameters: {
    q: z.string().describe("Search query"),
    num: z
      .number()
      .int()
      .min(1)
      .max(20)
      .optional()
      .describe("Number of results (1–20, default 10)"),
    gl: z
      .string()
      .optional()
      .describe("Country code (default 'nl')"),
    hl: z
      .string()
      .optional()
      .describe("Language code (default 'en')"),
    withContent: z
      .boolean()
      .optional()
      .describe(
        "Include scraped Markdown content of each result (X-Respond-With: markdown). Costs more tokens — default false."
      ),
  },
  handler: async (args: Record<string, unknown>) => {
    const apiKey = process.env.JINA_READER_API_KEY;
    if (!apiKey) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: "JINA_READER_API_KEY is not set in the website server's environment. Add it to apps/website/.env.",
          },
        ],
      };
    }

    const q = args.q as string;
    const num = (args.num as number | undefined) ?? 10;
    const gl = (args.gl as string | undefined) ?? "nl";
    const hl = (args.hl as string | undefined) ?? "en";
    const withContent = (args.withContent as boolean | undefined) ?? false;

    const url = new URL("https://s.jina.ai/");
    url.searchParams.set("q", q);
    url.searchParams.set("num", String(num));
    url.searchParams.set("gl", gl);
    url.searchParams.set("hl", hl);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    };
    if (withContent) headers["X-Respond-With"] = "markdown";

    try {
      const res = await fetch(url, { headers });
      const text = await res.text();
      return {
        isError: !res.ok,
        content: [{ type: "text" as const, text }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Jina search failed: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
    }
  },
};
