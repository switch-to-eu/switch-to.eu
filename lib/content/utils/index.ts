import fs from 'fs';
import path from 'path';
import { Locale } from '@/lib/i18n/dictionaries';
import {
    GuideFrontmatterSchema,
    ServiceFrontmatterSchema,
    AlternativesFrontmatterSchema,
    CategoryMetadataSchema
} from '../schemas';
import { ContentSegments } from '../types';

// Base content directory
const contentRoot = path.join(process.cwd(), '/content');

/**
 * Function to get content path for a specific language
 */
export function getLanguageContentPath(lang: Locale = 'en'): string {
    const langPath = path.join(contentRoot, lang);

    // Check if language-specific directory exists
    if (fs.existsSync(langPath)) {
        return langPath;
    }

    // Fallback to base content directory
    return contentRoot;
}

/**
 * Type guard for GuideFrontmatter
 */
export function isGuideFrontmatter(data: unknown): data is import('../types').GuideFrontmatter {
    return GuideFrontmatterSchema.safeParse(data).success;
}

/**
 * Type guard for AlternativesFrontmatter
 */
export function isAlternativesFrontmatter(data: unknown): data is import('../types').AlternativesFrontmatter {
    return AlternativesFrontmatterSchema.safeParse(data).success;
}

/**
 * Type guard for ServiceFrontmatter
 */
export function isServiceFrontmatter(data: unknown): data is import('../types').ServiceFrontmatter {
    return ServiceFrontmatterSchema.safeParse(data).success;
}

/**
 * Type guard for CategoryMetadata
 */
export function isCategoryMetadata(data: unknown): data is import('../types').CategoryMetadata {
    return CategoryMetadataSchema.safeParse(data).success;
}

/**
 * Extracts content segments from markdown content
 * Uses a custom delimiter format: ---section:name ... ---
 * Falls back to treating the entire content as a single unsegmented block
 */
export function extractContentSegments(content: string): ContentSegments {
    if (!content) return { unsegmented: '' };

    // Define regex to match sections with the format ---section:name ... ---
    // This pattern is confirmed to work correctly for all sections including the outro
    const sectionRegex = /---section:(\w+)\s+([\s\S]*?)---(?=\s*(?:---section:|\s*$))/g;
    const segments: ContentSegments = {};
    let hasSegments = false;

    // Find all sections and store their content
    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
        const [, sectionName, sectionContent] = match;
        if (sectionName && sectionContent) {
            segments[sectionName] = sectionContent.trim();
            hasSegments = true;
        }
    }

    // If no segments were found, store entire content as unsegmented
    if (!hasSegments) {
        segments.unsegmented = content.trim();
    } else {
        // Check for content outside of section markers and store it as unsegmented
        // This captures content that may appear before, between, or after section markers
        const strippedContent = content.replace(sectionRegex, '').trim();
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
export function extractServiceIssues(content: string, segments?: ContentSegments): string[] {
    if (!content) return [];

    // Function to extract issues from content
    const extractIssuesFromContent = (text: string): string[] => {
        // Find the Service Issues section
        const issuesSectionMatch = text.match(/## Service Issues\s+([\s\S]*?)(?=##|$)/);
        if (!issuesSectionMatch || !issuesSectionMatch[1]) return [];

        // Extract list items (lines starting with "- " or "* ")
        const issuesSection = issuesSectionMatch[1].trim();
        const issues = issuesSection
            .split('\n')
            .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
            .map(line => line.replace(/^[*-]\s+/, '').trim())
            .filter(issue => issue.length > 0);

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
        const segmentOrder = ['troubleshooting', 'before', 'outro', 'steps', 'unsegmented'];
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
 * Extracts heading sections from the markdown content
 * Captures only h2 headings (##) and returns them with their IDs for anchor links
 * Works with segmented content by prioritizing the 'steps' segment when available
 * Identifies completion markers [complete] to enable progress tracking
 */
export function extractMigrationSteps(content: string, segments?: ContentSegments): Array<{ title: string; id: string; completionMarkers?: string[] }> {
    // No content to process
    if (!content) return [];

    // Function to extract steps from a string
    const extractStepsFromContent = (text: string): Array<{ title: string; id: string; completionMarkers?: string[] }> => {
        // Find only h2 headings (exactly two # characters),
        // using word boundary \b to ensure we don't match ### or more
        const headingRegex = /^##\s+(.+?)(?=\n|$)/gm;
        const matches = [...text.matchAll(headingRegex)];

        return matches.map(match => {
            const title = match[1].trim();
            // Create a valid HTML ID by converting to lowercase, replacing spaces with hyphens
            // and removing any characters that aren't alphanumeric, hyphens, or underscores
            const id = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

            // Find the content for this heading until the next heading or end of text
            const headingStart = match.index! + match[0].length;
            const nextHeadingMatch = text.slice(headingStart).match(/^##\s+/m);
            const headingEnd = nextHeadingMatch
                ? headingStart + nextHeadingMatch.index!
                : text.length;
            const headingContent = text.slice(headingStart, headingEnd);

            // Look for completion markers in the heading content
            const completionMarkerRegex = /\[complete\]/gi;
            const completionMarkers = [...headingContent.matchAll(completionMarkerRegex)]
                .map(marker => marker[0]);

            return {
                title,
                id,
                completionMarkers: completionMarkers.length > 0 ? completionMarkers : undefined
            };
        });
    };

    // If segments are available and there's a steps segment, use that first
    if (segments && segments.steps) {
        const stepsFromSegment = extractStepsFromContent(segments.steps);
        if (stepsFromSegment.length > 0) {
            return stepsFromSegment;
        }
    }

    // Otherwise fall back to searching the entire content (backward compatibility)
    return extractStepsFromContent(content);
}

/**
 * Extracts missing features from the frontmatter metadata
 * Falls back to content parsing if no metadata is available
 * Works with segmented content by examining the 'intro' segment first
 */
export function extractMissingFeatures(
    content: string,
    frontmatter?: import('../types').GuideFrontmatter,
    segments?: ContentSegments
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
            /## What's Different\s+([\s\S]*?)(?=##|$)/,
            /## Limitations\s+([\s\S]*?)(?=##|$)/,
            /## Missing Features\s+([\s\S]*?)(?=##|$)/,
            /## Feature Comparison\s+([\s\S]*?)(?=##|$)/
        ];

        let extractedFeatures: string[] = [];

        for (const regex of sectionRegexes) {
            const sectionMatch = text.match(regex);
            if (sectionMatch && sectionMatch[1]) {
                const sectionContent = sectionMatch[1].trim();

                // First try to find list items that mention missing features
                const listItems = sectionContent
                    .split('\n')
                    .filter(line => {
                        const trimmedLine = line.trim();
                        return (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* '));
                    })
                    .map(line => line.replace(/^[*-]\s+/, '').trim())
                    .filter(item => item.length > 0);

                // If we found list items, add them
                if (listItems.length > 0) {
                    extractedFeatures = [...extractedFeatures, ...listItems];
                    continue;
                }

                // Otherwise, try to parse tables for missing features
                // This is a simplified approach - a more comprehensive table parser might be needed
                // for real-world varied markdown table formats
                const tableRows = sectionContent.split('\n')
                    .filter(line => line.includes('|'))
                    .map(line => {
                        const cells = line.split('|').map(cell => cell.trim());
                        // Filter out empty cells (beginning and end of the line)
                        return cells.filter(cell => cell.length > 0);
                    })
                    .filter(cells => cells.length >= 2); // Ensure it has at least 2 columns

                // Skip header and separator rows
                const dataRows = tableRows.filter(row =>
                    !row.some(cell => cell.includes('---')) &&
                    !row.some(cell => cell.toLowerCase() === 'feature')
                );

                // Extract feature comparison info
                for (const row of dataRows) {
                    if (row.length >= 3) {
                        const feature = row[0];
                        const sourceInfo = row[1];
                        const targetInfo = row[2];

                        // If source has the feature but target doesn't
                        if (
                            (sourceInfo.toLowerCase().includes('yes') || sourceInfo.toLowerCase().includes('✓')) &&
                            (targetInfo.toLowerCase().includes('no') || targetInfo.toLowerCase().includes('limited') || targetInfo.toLowerCase().includes('✗'))
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
        const segmentOrder = ['before', 'troubleshooting', 'outro', 'steps', 'unsegmented'];
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
 * Processes markdown content to find [complete] markers for step completion buttons
 * Returns content with markers mapped to specified HTML classes for later processing
 * Now also extracts and includes the closest h2/h3 heading to improve marker association
 */
export function processCompletionMarkers(content: string, guideId: string): string {
    if (!content || typeof content !== 'string') return '';

    try {
        // First pass: extract h2 and h3 headings
        const headings: Array<{ title: string; index: number }> = [];
        const headingRegex = /^(##|###)\s+(.+?)(?=\n|$)/gm;
        let match;

        while ((match = headingRegex.exec(content)) !== null) {
            headings.push({
                title: match[2].trim(),
                index: match.index
            });
        }

        // Second pass: replace [complete] markers with references to the closest heading
        let lastResult = content;
        const markerRegex = /\[complete\]/gi;
        let markerMatch;
        let offset = 0;

        while ((markerMatch = markerRegex.exec(content)) !== null) {
            // Find the closest heading that appears before this marker
            let closestHeading = null;
            for (const heading of headings) {
                if (heading.index < markerMatch.index &&
                    (!closestHeading || heading.index > closestHeading.index)) {
                    closestHeading = heading;
                }
            }

            const headingTitle = closestHeading ? closestHeading.title : '';
            const replacement = `<span class="step-completion-marker" data-guide-id="${guideId}" data-heading="${encodeURIComponent(headingTitle)}"></span>`;

            // Replace this specific marker in the result string
            const beforeMarker = lastResult.substring(0, markerMatch.index + offset);
            const afterMarker = lastResult.substring(markerMatch.index + offset + markerMatch[0].length);
            lastResult = beforeMarker + replacement + afterMarker;

            // Update offset for next replacement
            offset += replacement.length - markerMatch[0].length;
        }

        return lastResult;
    } catch (error) {
        console.error('Error processing completion markers:', error);
        return content; // Return original content if there's an error
    }
}