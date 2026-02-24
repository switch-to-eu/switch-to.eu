import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

interface TokenWithText {
  text?: string;
}

interface LinkToken {
  href?: string;
  title?: string;
  tokens?: TokenWithText[];
}

/**
 * Creates a custom markdown renderer with support for external links
 * opening in new tabs and other custom rendering features
 */
export function createCustomRenderer() {
  const renderer = new marked.Renderer();

  // Use @ts-expect-error to bypass TypeScript's type checking for this function
  // as we're handling both legacy and new Marked API formats
  // @ts-expect-error - Marked API type definitions don't match runtime behavior
  renderer.link = function (href: string | LinkToken, title?: string, text?: string) {
    // Handle both object-style (newer API) and string parameters (older API)
    let finalHref = "";
    let finalTitle = "";
    let finalText = "";

    if (typeof href === "object" && href !== null) {
      // New API - first parameter is an object with href, title, and tokens
      finalHref = (href as LinkToken).href || "";
      finalTitle = (href as LinkToken).title || "";
      // For text, we'll use either the provided text parameter or get it from tokens
      finalText = text || "";
      const hrefToken = href as LinkToken;
      if (!finalText && hrefToken.tokens && hrefToken.tokens.length) {
        // Try to extract text from tokens if available
        finalText = hrefToken.tokens
          .map((t: TokenWithText) => {
            return String(t.text || "");
          })
          .join("");
      }
    } else {
      // Old API - separate parameters
      finalHref = href || "";
      finalTitle = title || "";
      finalText = text || "";
    }

    // Check if the link is external
    const isExternal =
      typeof finalHref === "string" &&
      (finalHref.startsWith("http") || finalHref.startsWith("//"));

    // Build the HTML manually
    let html = '<a href="' + finalHref + '"';

    if (finalTitle) {
      html += ' title="' + finalTitle + '"';
    }

    if (isExternal) {
      html += ' target="_blank" rel="noopener noreferrer"';
    }

    html += ">" + finalText + "</a>";
    return html;
  };

  return renderer;
}

/**
 * Parses markdown with custom renderer options and sanitizes the output
 *
 * @param markdown The markdown string to parse
 * @param options Additional marked options to merge
 * @returns Sanitized HTML string
 */
export function parseMarkdown(markdown: string, options = {}) {
  // Set up marked with common options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert line breaks to <br>
  });

  // Create the custom renderer
  const renderer = createCustomRenderer();

  // Parse with our custom renderer and any additional options (synchronously)
  const htmlContent = marked(markdown, {
    renderer,
    ...options,
  }) as string;

  // Sanitize the HTML to prevent XSS attacks
  return sanitizeHtml(htmlContent, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "div",
      "span",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "mark",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "blockquote",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "del",
      "ins",
    ],
    allowedAttributes: {
      "*": ["class", "id"],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
  });
}
