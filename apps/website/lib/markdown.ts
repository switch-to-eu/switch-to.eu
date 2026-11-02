import { Marked, type Tokens } from "marked";

/**
 * Markdown → HTML for content from /content. The content is authored in this
 * repository, so the output is trusted.
 *
 * Internal links (`/privacy`, `/services/eu/proton-mail`) get the current
 * locale prefixed, matching what the i18n `Link` component does. External
 * links open in a new tab.
 */

const LOCALE_PREFIX = /^\/(en|nl)(\/|$|#|\?)/;

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function localizeHref(href: string, locale: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (LOCALE_PREFIX.test(href)) return href;
  return `/${locale}${href === "/" ? "" : href}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// eslint-disable-next-line no-unused-vars
type InlineParser = { parser: { parseInline: (tokens: Tokens.Generic[]) => string } };

const instances = new Map<string, Marked>();

function getMarked(locale: string): Marked {
  let marked = instances.get(locale);
  if (marked) return marked;

  marked = new Marked({ gfm: true, async: false });
  marked.use({
    renderer: {
      // Slug ids so in-page anchors like /terms#tool-specific-terms resolve.
      heading(this: InlineParser, token: Tokens.Heading) {
        const text = this.parser.parseInline(token.tokens);
        return `<h${token.depth} id="${slugify(token.text)}">${text}</h${token.depth}>\n`;
      },
      link(this: InlineParser, token: Tokens.Link) {
        const text = this.parser.parseInline(token.tokens);
        const href = localizeHref(token.href, locale);
        const title = token.title ? ` title="${escapeAttr(token.title)}"` : "";
        const external = /^https?:\/\//.test(href);
        const target = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${escapeAttr(href)}"${title}${target}>${text}</a>`;
      },
    },
  });
  instances.set(locale, marked);
  return marked;
}

export function renderMarkdown(markdown: string | null | undefined, locale: string): string {
  if (!markdown) return "";
  return getMarked(locale).parse(markdown) as string;
}

/** Strip markdown syntax for plain-text contexts (JSON-LD, meta tags). */
export function markdownToPlainText(markdown: string | null | undefined): string {
  if (!markdown) return "";
  return markdown
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/(\*\*|__|\*|_|~~|`)/g, "")
    .replace(/\\\n/g, "\n")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}
