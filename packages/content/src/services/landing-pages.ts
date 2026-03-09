import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getLanguageContentPath, extractContentSegments } from "../utils";
import { Locale } from "../types";
import {
  ContentSegments,
  LandingPageFrontmatter,
  LandingPageFrontmatterSchema,
} from "../schemas";

/**
 * Get a specific landing page by slug
 */
export function getLandingPage(
  slug: string,
  lang: Locale = "en"
): {
  frontmatter: LandingPageFrontmatter;
  content: string;
  segments: ContentSegments;
} | null {
  const langContentRoot = getLanguageContentPath(lang);
  const pageFile = path.join(langContentRoot, "landing-pages", `${slug}.md`);

  try {
    if (!fs.existsSync(pageFile)) {
      return null;
    }

    const fileContent = fs.readFileSync(pageFile, "utf8");
    const { data, content } = matter(fileContent);

    const parsed = LandingPageFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(`Invalid landing page frontmatter in ${pageFile}:`, parsed.error);
      return null;
    }

    const segments = extractContentSegments(content);

    return {
      frontmatter: parsed.data,
      content: content.trim(),
      segments,
    };
  } catch (error) {
    console.error(`Error reading landing page ${slug}:`, error);
    return null;
  }
}

/**
 * Get all landing pages for a locale
 */
export function getAllLandingPages(
  lang: Locale = "en"
): Array<{
  frontmatter: LandingPageFrontmatter;
  slug: string;
}> {
  const langContentRoot = getLanguageContentPath(lang);
  const landingPagesDir = path.join(langContentRoot, "landing-pages");

  try {
    if (!fs.existsSync(landingPagesDir)) {
      return [];
    }

    const files = fs
      .readdirSync(landingPagesDir)
      .filter((file) => file.endsWith(".md") && !file.startsWith("."));

    const pages: Array<{ frontmatter: LandingPageFrontmatter; slug: string }> = [];

    for (const file of files) {
      const fullPath = path.join(landingPagesDir, file);
      const fileContent = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContent);

      const parsed = LandingPageFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        console.warn(`Invalid landing page frontmatter in ${fullPath}`);
        continue;
      }

      pages.push({
        frontmatter: parsed.data,
        slug: parsed.data.slug,
      });
    }

    return pages;
  } catch (error) {
    console.error("Error reading landing pages:", error);
    return [];
  }
}

/**
 * Get all landing page slugs for generateStaticParams
 */
export function getLandingPageSlugs(lang: Locale = "en"): string[] {
  return getAllLandingPages(lang).map((page) => page.slug);
}
