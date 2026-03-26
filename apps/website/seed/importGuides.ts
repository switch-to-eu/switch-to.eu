/**
 * Seed script — import guides from the file-based content system into Payload CMS.
 *
 * Reads all guides via @switch-to-eu/content, converts markdown sections to
 * Lexical editor JSON, resolves service/category relationships, and creates
 * Payload documents in both English and Dutch locales.
 */

import type { Payload } from "payload";
import {
  getAllGuides,
  getGuide,
  extractStepsWithMeta,
} from "@switch-to-eu/content";
import type { Locale } from "@switch-to-eu/content";
import { markdownToLexical } from "./markdownToLexical";

export async function importGuides(
  payload: Payload,
  categoryMap: Map<string, number>,
  serviceMap: Map<string, number>,
): Promise<void> {
  const guides = getAllGuides({ lang: "en" as Locale });

  for (const guide of guides) {
    console.log(`Importing guide: ${guide.slug}`);

    // Get full guide data for each locale (getGuide is synchronous)
    const enGuide = getGuide(guide.category, guide.slug, "en" as Locale);
    let nlGuide = null;
    try {
      nlGuide = getGuide(guide.category, guide.slug, "nl" as Locale);
    } catch {
      // Dutch version may not exist
    }

    if (!enGuide) continue;

    const enFm = enGuide.frontmatter;
    // getGuide already extracts segments — use them directly
    const enSegments = enGuide.segments;
    const enSteps = enSegments.steps
      ? extractStepsWithMeta(enSegments.steps)
      : [];

    // Convert sections to Lexical
    const enIntro = enSegments.intro
      ? await markdownToLexical(enSegments.intro)
      : undefined;
    const enBefore = enSegments.before
      ? await markdownToLexical(enSegments.before)
      : undefined;
    const enTroubleshooting = enSegments.troubleshooting
      ? await markdownToLexical(enSegments.troubleshooting)
      : undefined;
    const enOutro = enSegments.outro
      ? await markdownToLexical(enSegments.outro)
      : undefined;

    // Convert steps
    const enStepData = await Promise.all(
      enSteps.map(async (step) => ({
        title: step.title ?? "",
        content: step.content
          ? await markdownToLexical(step.content)
          : undefined,
        video: step.video ?? "",
        videoOrientation: step.videooriantation ?? "landscape",
        complete: step.complete ?? false,
      })),
    );

    // Find category ID
    const categoryId = categoryMap.get(guide.category);

    // Source/target service lookup — match by name in the service map.
    // The frontmatter has service names (e.g. "Google Maps"), we need to find
    // matching slugs (e.g. "google-maps") in the service map.
    let sourceServiceId: number | undefined;
    let targetServiceId: number | undefined;
    const sourceSlug = enFm.sourceService
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[()]/g, "");
    const targetSlug = enFm.targetService
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[()]/g, "");

    for (const [slug, id] of serviceMap) {
      if (sourceSlug && slug.includes(sourceSlug)) {
        sourceServiceId = id;
      }
      if (targetSlug && slug.includes(targetSlug)) {
        targetServiceId = id;
      }
    }

    const created = await payload.create({
      collection: "guides",
      locale: "en",
      data: {
        title: enFm.title,
        slug: guide.slug,
        category: categoryId,
        description: enFm.description,
        difficulty: enFm.difficulty ?? "beginner",
        timeRequired: enFm.timeRequired ?? "",
        sourceService: sourceServiceId,
        targetService: targetServiceId,
        date: enFm.date ?? null,
        author: enFm.author ?? "",
        missingFeatures:
          enFm.missingFeatures?.map((f: string) => ({ feature: f })) ?? [],
        intro: enIntro,
        beforeYouStart: enBefore,
        steps: enStepData,
        troubleshooting: enTroubleshooting,
        outro: enOutro,
      },
    });

    // Dutch locale
    if (nlGuide) {
      const nlFm = nlGuide.frontmatter;
      const nlSegments = nlGuide.segments;
      const nlSteps = nlSegments.steps
        ? extractStepsWithMeta(nlSegments.steps)
        : [];

      const nlStepData = await Promise.all(
        nlSteps.map(async (step) => ({
          title: step.title ?? "",
          content: step.content
            ? await markdownToLexical(step.content)
            : undefined,
          video: step.video ?? "",
          videoOrientation: step.videooriantation ?? "landscape",
          complete: step.complete ?? false,
        })),
      );

      await payload.update({
        collection: "guides",
        id: created.id,
        locale: "nl",
        data: {
          title: nlFm.title,
          description: nlFm.description,
          missingFeatures:
            nlFm.missingFeatures?.map((f: string) => ({ feature: f })) ?? [],
          intro: nlSegments.intro
            ? await markdownToLexical(nlSegments.intro)
            : undefined,
          beforeYouStart: nlSegments.before
            ? await markdownToLexical(nlSegments.before)
            : undefined,
          steps: nlStepData,
          troubleshooting: nlSegments.troubleshooting
            ? await markdownToLexical(nlSegments.troubleshooting)
            : undefined,
          outro: nlSegments.outro
            ? await markdownToLexical(nlSegments.outro)
            : undefined,
        },
      });
    }
  }

  console.log(`Imported ${guides.length} guides`);
}
