import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  getLanguageContentPath,
  isGuideFrontmatter,
  extractContentSegments,
} from "../utils";
import { ContentSegments, GuideFrontmatter } from "../schemas";
import { Locale } from "../types";

/**
 * Function to get all guide categories
 */
export function getGuideCategories(lang: Locale = "en"): Array<string> {
  try {
    const langContentRoot = getLanguageContentPath(lang);
    const guidesDir = path.join(langContentRoot, "guides");

    return fs
      .readdirSync(guidesDir)
      .filter(
        (file) =>
          fs.statSync(path.join(guidesDir, file)).isDirectory() &&
          !file.startsWith(".")
      );
  } catch (error) {
    console.error("Error reading guide categories:", error);
    return [];
  }
}

/**
 * Function to get all guides for a category
 */
export function getGuidesByCategory(
  category: string,
  lang: Locale = "en"
): Array<{
  slug: string;
  frontmatter: GuideFrontmatter;
}> {
  const langContentRoot = getLanguageContentPath(lang);
  const categoryDir = path.join(langContentRoot, "guides", category);

  try {
    if (!fs.existsSync(categoryDir)) {
      return [];
    }

    const guides = fs
      .readdirSync(categoryDir)
      .filter(
        (dir) =>
          fs.statSync(path.join(categoryDir, dir)).isDirectory() &&
          !dir.startsWith(".")
      );

    const guidesData = guides
      .map((slug) => {
        const mdxFile = path.join(categoryDir, slug, "index.md");

        // Skip if MDX file doesn't exist
        if (!fs.existsSync(mdxFile)) {
          return null;
        }

        const fileContent = fs.readFileSync(mdxFile, "utf8");
        const { data } = matter(fileContent);

        // Skip if data is not valid
        if (!isGuideFrontmatter(data)) {
          console.warn(`Invalid frontmatter in ${mdxFile}`);
          return null;
        }

        return {
          slug,
          frontmatter: data,
        };
      })
      .filter(
        (item): item is { slug: string; frontmatter: GuideFrontmatter } =>
          item !== null
      );

    return guidesData;
  } catch (error) {
    console.error(`Error reading guides for category ${category}:`, error);
    return [];
  }
}

/**
 * Function to get a specific guide
 */
export function getGuide(
  category: string,
  slug: string,
  lang: Locale = "en"
): {
  frontmatter: GuideFrontmatter;
  content: string;
  segments: ContentSegments;
} | null {
  const langContentRoot = getLanguageContentPath(lang);
  const mdFile = path.join(
    langContentRoot,
    "guides",
    category,
    slug,
    "index.md"
  );

  try {
    if (!fs.existsSync(mdFile)) {
      return null;
    }

    const fileContent = fs.readFileSync(mdFile, "utf8");
    const { data, content } = matter(fileContent);

    if (!isGuideFrontmatter(data)) {
      console.warn(`Invalid frontmatter in ${mdFile}`);
      return null;
    }

    // Extract segments using the content segmentation function
    const segments = extractContentSegments(content);

    return {
      frontmatter: data,
      content,
      segments,
    };
  } catch (error) {
    console.error(`Error reading guide ${category}/${slug}:`, error);
    return null;
  }
}

/**
 * Get all guides (optionally filtered by source or target service)
 */
export function getAllGuides({
  sourceService,
  targetService,
  lang = "en",
}: {
  sourceService?: string;
  targetService?: string;
  lang?: Locale;
} = {}): Array<{
  category: string;
  slug: string;
  frontmatter: GuideFrontmatter;
}> {
  const categories = getGuideCategories(lang);
  const allGuides: Array<{
    category: string;
    slug: string;
    frontmatter: GuideFrontmatter;
  }> = [];

  // Process categories one by one
  for (const category of categories) {
    const guides = getGuidesByCategory(category, lang);
    for (const guide of guides) {
      allGuides.push({
        category,
        slug: guide.slug,
        frontmatter: guide.frontmatter,
      });
    }
  }

  // Apply filters if provided
  return allGuides.filter((guide) => {
    if (sourceService && guide.frontmatter.sourceService !== sourceService) {
      return false;
    }
    if (targetService && guide.frontmatter.targetService !== targetService) {
      return false;
    }
    return true;
  });
}

/**
 * Get all guides where a specific service is the target
 */
export function getGuidesByTargetService(
  targetService: string,
  lang: Locale = "en"
): Array<{
  slug: string;
  frontmatter: GuideFrontmatter;
  category: string;
}> {
  const categories = getGuideCategories(lang);
  const allGuides: Array<{
    slug: string;
    frontmatter: GuideFrontmatter;
    category: string;
  }> = [];

  // Gather guides from all categories
  for (const category of categories) {
    const categoryGuides = getGuidesByCategory(category, lang);

    // Add each guide with its category
    categoryGuides.forEach((guide) => {
      allGuides.push({
        ...guide,
        category,
      });
    });
  }

  // Filter guides to only those targeting the specified service
  return allGuides.filter(
    (guide) =>
      guide.frontmatter.targetService.toLowerCase() ===
      targetService.toLowerCase()
  );
}
