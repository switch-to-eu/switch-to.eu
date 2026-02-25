import fs from "fs";
import path from "path";

import {
  GuideFrontmatterSchema,
  ServiceFrontmatterSchema,
  AlternativesFrontmatterSchema,
  CategoryMetadataSchema,
  ContentSegments,
  GuideFrontmatter,
  ServiceFrontmatter,
  AlternativesFrontmatter,
  CategoryMetadata,
} from "../schemas";
import { Locale } from "../types";
import { getContentRoot } from "../config";

/**
 * Function to get content path for a specific language
 */
export function getLanguageContentPath(locale: Locale = "en"): string {
  const localePath = path.join(getContentRoot(), locale);

  // Check if localeuage-specific directory exists
  if (fs.existsSync(localePath)) {
    return localePath;
  }

  // Fallback to base content directory
  return getContentRoot();
}

/**
 * Type guard for GuideFrontmatter
 */
export function isGuideFrontmatter(data: unknown): data is GuideFrontmatter {
  return GuideFrontmatterSchema.safeParse(data).success;
}

/**
 * Type guard for AlternativesFrontmatter
 */
export function isAlternativesFrontmatter(
  data: unknown,
): data is AlternativesFrontmatter {
  return AlternativesFrontmatterSchema.safeParse(data).success;
}

/**
 * Type guard for ServiceFrontmatter
 */
export function isServiceFrontmatter(
  data: unknown,
): data is ServiceFrontmatter {
  return ServiceFrontmatterSchema.safeParse(data).success;
}

/**
 * Type guard for CategoryMetadata
 */
export function isCategoryMetadata(data: unknown): data is CategoryMetadata {
  return CategoryMetadataSchema.safeParse(data).success;
}

/**
 * Extracts content segments from markdown content
 * Uses HTML comment format: <!-- section:name --> ... <!-- end-section -->
 * Falls back to legacy format: ---section:name ... ---
 * Also falls back to treating the entire content as a single unsegmented block if no sections found
 */
export function extractContentSegments(content: string): ContentSegments {
  if (!content) return { unsegmented: "" };

  // Define regex to match the new HTML comment-based sections
  // <!-- section:name --> ... <!-- end-section -->
  const newSectionRegex =
    /<!-- section:(\w+) -->\s+((?:(?!<!-- end-section -->)[\s\S])*?)<!-- end-section -->/g;

  // Define regex for the legacy section format
  // ---section:name ... ---
  const legacySectionRegex =
    /---section:(\w+)\s+((?:(?!---)[\s\S])*?)---(?=\s*(?:---section:|\s*$))/g;

  const segments: ContentSegments = {};
  let hasSegments = false;

  // First try to find sections using the new format
  let match;
  while ((match = newSectionRegex.exec(content)) !== null) {
    const [, sectionName, sectionContent] = match;
    if (sectionName && sectionContent) {
      segments[sectionName] = sectionContent.trim();
      hasSegments = true;
    }
  }

  // If no segments were found with the new format, try the legacy format
  if (!hasSegments) {
    while ((match = legacySectionRegex.exec(content)) !== null) {
      const [, sectionName, sectionContent] = match;
      if (sectionName && sectionContent) {
        segments[sectionName] = sectionContent.trim();
        hasSegments = true;
      }
    }
  }

  // If no segments were found with either format, store entire content as unsegmented
  if (!hasSegments) {
    segments.unsegmented = content.trim();
  } else {
    // Check for content outside of section markers and store it as unsegmented
    // First remove new format sections
    let strippedContent = content.replace(newSectionRegex, "");
    // Then remove legacy format sections
    strippedContent = strippedContent.replace(legacySectionRegex, "").trim();

    if (strippedContent) {
      segments.unsegmented = strippedContent;
    }
  }

  return segments;
}

/**
 * Extracts service issues from the markdown content
 * Looks for a section titled "## Service Issues" and parses the list items
 * Works with segmented content by examining relevant segments
 */
export function extractServiceIssues(
  content: string,
  segments?: ContentSegments,
): string[] {
  if (!content) return [];

  // Function to extract issues from content
  const extractIssuesFromContent = (text: string): string[] => {
    // Find the Service Issues section
    const issuesSectionMatch = text.match(
      /## Service Issues\s+((?:(?!##)[\s\S])*)/,
    );
    if (!issuesSectionMatch || !issuesSectionMatch[1]) return [];

    // Extract list items (lines starting with "- " or "* ")
    const issuesSection = issuesSectionMatch[1].trim();
    const issues = issuesSection
      .split("\n")
      .filter(
        (line) => line.trim().startsWith("- ") || line.trim().startsWith("* "),
      )
      .map((line) => line.replace(/^[*-]\s+/, "").trim())
      .filter((issue) => issue.length > 0);

    return issues;
  };

  // If segments are available, check in order of likelihood to contain service issues
  if (segments) {
    // Check intro segment first (most likely to contain service issues)
    if (segments.intro) {
      const issuesFromIntro = extractIssuesFromContent(segments.intro);
      if (issuesFromIntro.length > 0) {
        return issuesFromIntro;
      }
    }

    // Then check each segment in order of likelihood
    const segmentOrder = [
      "troubleshooting",
      "before",
      "outro",
      "steps",
      "unsegmented",
    ];
    for (const segmentName of segmentOrder) {
      const segment = segments[segmentName];
      if (segment) {
        const issuesFromSegment = extractIssuesFromContent(segment);
        if (issuesFromSegment.length > 0) {
          return issuesFromSegment;
        }
      }
    }
  }

  // Fall back to searching the entire content for backward compatibility
  return extractIssuesFromContent(content);
}

/**
 * Extracts steps with metadata from the content using the new HTML comment-based format
 * Processes <!-- step-start --> ... <!-- step-end --> markers and extracts step-meta information
 */
export function extractStepsWithMeta(content: string): Array<{
  title: string;
  id: string;
  complete?: boolean;
  video?: string;
  videooriantation?: string;
  content: string;
}> {
  if (!content) return [];

  // Define regex to match step markers and content
  const stepRegex =
    /<!-- step-start -->\s+<!-- step-meta\s+((?:(?!-->)[\s\S])*?)-->\s+((?:(?!<!-- step-end -->)[\s\S])*?)<!-- step-end -->/g;
  const steps = [];
  let match;

  while ((match = stepRegex.exec(content)) !== null) {
    const [, metaContent, stepContent] = match;
    if (metaContent && stepContent) {
      // Parse metadata
      const titleMatch = metaContent.match(/title:\s*"([^"]+)"/);
      const completeMatch = metaContent.match(/complete:\s*(true|false)/);
      const videoMatch = metaContent.match(/video:\s*"([^"]+)"/);
      const videoOriantationMatch = metaContent.match(
        /videooriantation:\s*"([^"]+)"/,
      );

      const title: string = titleMatch?.[1] ?? "Untitled Step";
      // Create an ID from the title
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      steps.push({
        title,
        id,
        complete: completeMatch ? completeMatch[1] === "true" : undefined,
        video: videoMatch ? videoMatch[1] : undefined,
        videooriantation: videoOriantationMatch
          ? videoOriantationMatch[1]
          : undefined,
        content: stepContent.trim(),
      });
    }
  }

  return steps;
}

/**
 * Extracts heading sections from the markdown content
 * Captures only h2 headings (##) and returns them with their IDs for anchor links
 * Works with segmented content by prioritizing the 'steps' segment when available
 * Now supports HTML comment-based steps format with meta information
 */
export function extractMigrationSteps(
  content: string,
  segments?: ContentSegments,
): Array<{
  title: string;
  id: string;
  completionMarkers?: string[];
  video?: string;
  videooriantation?: string;
}> {
  // No content to process
  if (!content) return [];

  // Function to extract steps from a string using the old h2 heading format
  const extractLegacyStepsFromContent = (
    text: string,
  ): Array<{
    title: string;
    id: string;
    completionMarkers?: string[];
    video?: string;
    videooriantation?: string;
  }> => {
    // Find only h2 headings (exactly two # characters),
    // using word boundary \b to ensure we don't match ### or more
    const headingRegex = /^##\s+(.+?)(?=\n|$)/gm;
    const matches = [...text.matchAll(headingRegex)];

    return matches.map((match) => {
      const title = match?.[1]?.trim() ?? "";
      // Create a valid HTML ID by converting to lowercase, replacing spaces with hyphens
      // and removing any characters that aren't alphanumeric, hyphens, or underscores
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      // Find the content for this heading until the next heading or end of text
      const headingStart = match.index + match[0].length;
      const nextHeadingMatch = text.slice(headingStart).match(/^##\s+/m);
      const headingEnd = nextHeadingMatch
        ? headingStart + nextHeadingMatch.index!
        : text.length;
      const headingContent = text.slice(headingStart, headingEnd);

      // Look for video tags in the heading content
      const videoRegex = /!video\[([^\]]+)\]/i;
      const videoMatch = headingContent.match(videoRegex);
      const video = videoMatch ? videoMatch[1] : undefined;

      return {
        title,
        id,
        video,
      };
    });
  };

  // If segments are available and there's a steps segment, try new format first
  if (segments && segments.steps) {
    // First try to extract steps using the new HTML comment-based format
    const stepsWithMeta = extractStepsWithMeta(segments.steps);

    if (stepsWithMeta.length > 0) {
      // Convert to the expected return format
      return stepsWithMeta.map((step) => ({
        title: step.title,
        id: step.id,
        completionMarkers: step.complete ? ["[complete]"] : undefined,
        video: step.video,
        videooriantation: step.videooriantation,
      }));
    }

    // If no steps found with new format, fall back to legacy format
    const legacySteps = extractLegacyStepsFromContent(segments.steps);
    if (legacySteps.length > 0) {
      return legacySteps;
    }
  }

  // Otherwise fall back to searching the entire content (backward compatibility)
  return extractLegacyStepsFromContent(content);
}

/**
 * Extracts missing features from the frontmatter metadata
 * Falls back to content parsing if no metadata is available
 * Works with segmented content by examining the 'intro' segment first
 */
export function extractMissingFeatures(
  content: string,
  frontmatter?: GuideFrontmatter,
  segments?: ContentSegments,
): string[] {
  // If frontmatter has missing features, return those
  if (frontmatter?.missingFeatures && frontmatter.missingFeatures.length > 0) {
    return frontmatter.missingFeatures;
  }

  // Legacy fallback: extract from content if no frontmatter data
  if (!content) return [];

  // Function to extract features from content using section regex
  const extractFeaturesFromContent = (text: string): string[] => {
    // Look for relevant sections with different potential titles
    const sectionRegexes = [
      /## What's Different\s+((?:(?!##)[\s\S])*)/,
      /## Limitations\s+((?:(?!##)[\s\S])*)/,
      /## Missing Features\s+((?:(?!##)[\s\S])*)/,
      /## Feature Comparison\s+((?:(?!##)[\s\S])*)/,
    ];

    let extractedFeatures: string[] = [];

    for (const regex of sectionRegexes) {
      const sectionMatch = text.match(regex);
      if (sectionMatch && sectionMatch[1]) {
        const sectionContent = sectionMatch[1].trim();

        // First try to find list items that mention missing features
        const listItems = sectionContent
          .split("\n")
          .filter((line) => {
            const trimmedLine = line.trim();
            return trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ");
          })
          .map((line) => line.replace(/^[*-]\s+/, "").trim())
          .filter((item) => item.length > 0);

        // If we found list items, add them
        if (listItems.length > 0) {
          extractedFeatures = [...extractedFeatures, ...listItems];
          continue;
        }

        // Otherwise, try to parse tables for missing features
        // This is a simplified approach - a more comprehensive table parser might be needed
        // for real-world varied markdown table formats
        const tableRows = sectionContent
          .split("\n")
          .filter((line) => line.includes("|"))
          .map((line) => {
            const cells = line.split("|").map((cell) => cell.trim());
            // Filter out empty cells (beginning and end of the line)
            return cells.filter((cell) => cell.length > 0);
          })
          .filter((cells) => cells.length >= 2); // Ensure it has at least 2 columns

        // Skip header and separator rows
        const dataRows = tableRows.filter(
          (row) =>
            !row.some((cell) => cell.includes("---")) &&
            !row.some((cell) => cell.toLowerCase() === "feature"),
        );

        // Extract feature comparison info
        for (const row of dataRows) {
          if (row.length >= 3) {
            const feature = row[0];
            const sourceInfo = row[1];
            const targetInfo = row[2];

            // If source has the feature but target doesn't
            if (
              (sourceInfo?.toLowerCase().includes("yes") ||
                sourceInfo?.toLowerCase().includes("✓")) &&
              (targetInfo?.toLowerCase().includes("no") ||
                targetInfo?.toLowerCase().includes("limited") ||
                targetInfo?.toLowerCase().includes("✗"))
            ) {
              extractedFeatures.push(`${feature} is missing or limited`);
            }
          }
        }
      }
    }

    return extractedFeatures;
  };

  // If segments are available, check the intro segment first (most likely to contain missing features)
  if (segments) {
    if (segments.intro) {
      const featuresFromIntro = extractFeaturesFromContent(segments.intro);
      if (featuresFromIntro.length > 0) {
        return featuresFromIntro;
      }
    }

    // Then check each segment in order of likelihood to contain missing features
    const segmentOrder = [
      "before",
      "troubleshooting",
      "outro",
      "steps",
      "unsegmented",
    ];
    for (const segmentName of segmentOrder) {
      const segment = segments[segmentName];
      if (segment) {
        const featuresFromSegment = extractFeaturesFromContent(segment);
        if (featuresFromSegment.length > 0) {
          return featuresFromSegment;
        }
      }
    }
  }

  // Fall back to searching the entire content for backward compatibility
  return extractFeaturesFromContent(content);
}

/**
 * Processes markdown content to find step metadata for step completion buttons
 * Returns content with markers mapped to specified HTML classes for later processing
 * Uses the step metadata with complete=true to insert markers
 */
export function processCompletionMarkers(
  content: string,
  guideId: string,
): string {
  if (!content || typeof content !== "string") return "";

  try {
    // Process content using only the new format (metadata-based)
    let processedContent = content;
    const segments = extractContentSegments(content);

    if (segments.steps) {
      // Extract steps with metadata
      const stepsWithMeta = extractStepsWithMeta(segments.steps);

      if (stepsWithMeta.length > 0) {
        // Process each step that has complete=true
        for (const step of stepsWithMeta) {
          if (step.complete) {
            // Create a marker pattern that would match within this step's content
            const stepStart = processedContent.indexOf(step.content);
            if (stepStart !== -1) {
              // Insert the completion marker at the beginning of the step content
              const headingTitle = step.title;
              const replacement = `<span class="step-completion-marker" data-guide-id="${guideId}" data-heading="${encodeURIComponent(
                headingTitle,
              )}"></span>`;

              // Insert the marker at the beginning of the step content
              const beforeStep = processedContent.substring(0, stepStart);
              const afterStep = processedContent.substring(stepStart);
              processedContent = beforeStep + replacement + afterStep;
            }
          }
        }
      }
    }

    return processedContent;
  } catch (error) {
    console.error("Error processing completion markers:", error);
    return content; // Return original content if there's an error
  }
}
