import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Locale } from './i18n/dictionaries';
import { remark } from 'remark';
import html from 'remark-html';

export interface MarkdownContent {
  contentHtml: string;
  data: {
    [key: string]: unknown;
  };
}

/**
 * Loads a markdown file from the content directory and parses it
 * @param locale - The locale to use for finding the content
 * @param filePath - The path to the file relative to the content/[locale] directory
 * @returns The parsed content and frontmatter data
 */
export async function getMarkdownContent(locale: Locale, filePath: string): Promise<MarkdownContent | null> {
  const fullPath = path.join(process.cwd(), 'content', locale, filePath);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  // Read file content
  const fileContent = fs.readFileSync(fullPath, 'utf8');

  // Parse frontmatter and content
  const { data, content } = matter(fileContent);

  // Convert markdown to HTML
  const processedContent = await remark()
    .use(html)
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    contentHtml,
    data,
  };
}