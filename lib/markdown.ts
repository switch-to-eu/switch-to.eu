import { marked } from 'marked';

/**
 * Creates a custom markdown renderer with support for external links
 * opening in new tabs and other custom rendering features
 */
export function createCustomRenderer() {
    const renderer = new marked.Renderer();

    // Use @ts-expect-error to bypass TypeScript's type checking for this function
    // as we're handling both legacy and new Marked API formats
    // @ts-expect-error - Marked API type definitions don't match runtime behavior
    renderer.link = function (href, title, text) {
        // Handle both object-style (newer API) and string parameters (older API)
        let finalHref = '';
        let finalTitle = '';
        let finalText = '';

        if (typeof href === 'object' && href !== null) {
            // New API - first parameter is an object with href, title, and tokens
            finalHref = href.href || '';
            finalTitle = href.title || '';
            // For text, we'll use either the provided text parameter or get it from tokens
            finalText = text || '';
            if (!finalText && href.tokens && href.tokens.length) {
                // Try to extract text from tokens if available
                finalText = href.tokens.map((t: unknown) => {
                    return typeof t === 'object' && t !== null && 'text' in t ?
                        String(t.text || '') : '';
                }).join('');
            }
        } else {
            // Old API - separate parameters
            finalHref = href || '';
            finalTitle = title || '';
            finalText = text || '';
        }

        // Check if the link is external
        const isExternal = typeof finalHref === 'string' &&
            (finalHref.startsWith('http') || finalHref.startsWith('//'));

        // Build the HTML manually
        let html = '<a href="' + finalHref + '"';

        if (finalTitle) {
            html += ' title="' + finalTitle + '"';
        }

        if (isExternal) {
            html += ' target="_blank" rel="noopener noreferrer"';
        }

        html += '>' + finalText + '</a>';
        return html;
    };

    return renderer;
}

/**
 * Parses markdown with custom renderer options
 *
 * @param markdown The markdown string to parse
 * @param options Additional marked options to merge
 * @returns HTML string
 */
export function parseMarkdown(markdown: string, options = {}) {
    // Set up marked with common options
    marked.setOptions({
        gfm: true,         // GitHub Flavored Markdown
        breaks: true,      // Convert line breaks to <br>
    });

    // Create the custom renderer
    const renderer = createCustomRenderer();

    // Parse with our custom renderer and any additional options
    return marked.parse(markdown, {
        renderer,
        ...options
    });
}