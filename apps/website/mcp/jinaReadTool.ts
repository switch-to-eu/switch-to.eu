import { z } from "zod";

/**
 * Custom MCP tool: jina_read
 *
 * Wraps Jina Reader (https://r.jina.ai/) — fetches one URL and returns clean
 * Markdown of the main content (strips navigation, ads, boilerplate).
 *
 * Auth: reads JINA_READER_API_KEY from process.env. Must be present in
 * apps/website/.env.
 */

export const jinaReadTool = {
  name: "jina_read",
  description:
    "Fetch a single URL as clean Markdown via Jina Reader (r.jina.ai). Strips navigation, ads, and boilerplate. Use for vendor pages, news articles, privacy policies — anywhere you need the readable body of one specific URL.",
  parameters: {
    url: z.string().describe("Full URL of the page to read"),
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

    const target = `https://r.jina.ai/${args.url as string}`;

    try {
      const res = await fetch(target, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "text/plain",
        },
      });
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
            text: `Jina read failed: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
    }
  },
};
