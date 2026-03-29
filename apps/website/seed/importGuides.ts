/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
/**
 * Seed importer for guides.
 */

import type { Payload } from "payload";
import {
  getAllGuides,
  getGuide,
  extractStepsWithMeta,
} from "./content.js";
import { markdownToLexical } from "./markdownToLexical.js";

export async function importGuides(
  payload: Payload | null,
  categoryMap: Map<string, number>,
  serviceMap: Map<string, number>,
  dryRun = false,
): Promise<void> {
  const guides = getAllGuides({ lang: "en" });

  for (const guide of guides) {
    const enGuide = getGuide(guide.category, guide.slug, "en");
    let nlGuide = null;
    try {
      nlGuide = getGuide(guide.category, guide.slug, "nl");
    } catch {
      // Dutch version may not exist
    }

    if (!enGuide) continue;

    const enFm = enGuide.frontmatter;
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

    const categoryId = categoryMap.get(guide.category);

    // Match service names to slugs — normalize both sides for comparison
    function normalizeForMatch(name: string): string {
      return name.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
    }

    const sourceNorm = enFm.sourceService ? normalizeForMatch(enFm.sourceService) : "";
    const targetNorm = enFm.targetService ? normalizeForMatch(enFm.targetService) : "";

    // Also compare without hyphens (protonmail vs proton-mail)
    function stripped(s: string): string {
      return s.replace(/-/g, "");
    }

    let sourceServiceId: number | undefined;
    let targetServiceId: number | undefined;
    for (const [slug, id] of serviceMap) {
      const slugNorm = normalizeForMatch(slug);
      const slugStripped = stripped(slugNorm);
      if (sourceNorm && !sourceServiceId) {
        const srcStripped = stripped(sourceNorm);
        if (slugNorm === sourceNorm || slugStripped === srcStripped || slugStripped.includes(srcStripped) || srcStripped.includes(slugStripped)) {
          sourceServiceId = id;
        }
      }
      if (targetNorm && !targetServiceId) {
        const tgtStripped = stripped(targetNorm);
        if (slugNorm === targetNorm || slugStripped === tgtStripped || slugStripped.includes(tgtStripped) || tgtStripped.includes(slugStripped)) {
          targetServiceId = id;
        }
      }
    }

    if (dryRun) {
      console.log(`  [dry-run] Guide: ${guide.slug} — "${enFm.title}" (steps: ${enSteps.length}, source: ${sourceNorm}${sourceServiceId ? "" : " NOT FOUND"}, target: ${targetNorm}${targetServiceId ? "" : " NOT FOUND"}, nl: ${nlGuide ? "yes" : "no"})`);
      continue;
    }

    const created = await payload!.create({
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

      await payload!.update({
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

  console.log(`  Imported ${guides.length} guides`);
}
