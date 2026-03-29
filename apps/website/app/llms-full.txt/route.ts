import { getPayload } from "@/lib/payload";
import { serviceToMarkdown, guideToMarkdown } from "@/lib/llm-content";
import type { Service } from "@/payload-types";

export const dynamic = "force-dynamic";

export async function GET() {
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

  // EU + EU-friendly services first, then non-EU
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

  const markdown = sections.join("\n").trim();

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
