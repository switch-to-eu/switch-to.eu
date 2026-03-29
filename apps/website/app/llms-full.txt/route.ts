import { unstable_cache } from "next/cache";
import { getPayload } from "@/lib/payload";
import { serviceToMarkdown, guideToMarkdown } from "@/lib/llm-content";
import type { Service } from "@/payload-types";

const getCachedFullContent = unstable_cache(
  async () => {
    const payload = await getPayload();
    const [services, guides] = await Promise.all([
      payload.find({
        collection: "services",
        where: { _status: { equals: "published" } },
        locale: "en",
        limit: 0,
        pagination: false,
        depth: 1,
      }),
      payload.find({
        collection: "guides",
        where: { _status: { equals: "published" } },
        locale: "en",
        limit: 0,
        pagination: false,
        depth: 2,
      }),
    ]);

    const sections: string[] = [];

    sections.push("# switch-to.eu — Full Content\n");
    sections.push(
      "> European alternatives to Big Tech services. Honest reviews, privacy research, GDPR compliance checks, and step-by-step migration guides.\n"
    );

    const eu = services.docs.filter(
      (s: Service) => s.region === "eu" || s.region === "eu-friendly"
    );
    const nonEu = services.docs.filter(
      (s: Service) => s.region === "non-eu"
    );

    if (eu.length > 0) {
      sections.push("---\n\n# EU Services\n");
      for (const s of eu) {
        sections.push(serviceToMarkdown(s));
        sections.push("\n\n---\n");
      }
    }

    if (nonEu.length > 0) {
      sections.push("\n# Non-EU Services\n");
      for (const s of nonEu) {
        sections.push(serviceToMarkdown(s));
        sections.push("\n\n---\n");
      }
    }

    if (guides.docs.length > 0) {
      sections.push("\n# Migration Guides\n");
      for (const g of guides.docs) {
        sections.push(guideToMarkdown(g));
        sections.push("\n\n---\n");
      }
    }

    return sections.join("\n").trim();
  },
  ["llm-full"],
  { tags: ["services", "guides"] }
);

export async function GET() {
  const markdown = await getCachedFullContent();

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
