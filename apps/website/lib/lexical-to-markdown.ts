/**
 * Converts Payload CMS Lexical rich text JSON to Markdown.
 *
 * Supports the default lexicalEditor() node types: paragraphs, headings,
 * lists (bullet + numbered), quotes, horizontal rules, links, and inline
 * formatting (bold, italic, strikethrough, inline code).
 */

// ---------------------------------------------------------------------------
// Types (minimal subset of Lexical serialized state)
// ---------------------------------------------------------------------------

interface LexicalNode {
  type: string;
  version: number;
  children?: LexicalNode[];
  // Text nodes
  text?: string;
  format?: number;
  // Heading nodes
  tag?: string;
  // List nodes
  listType?: string;
  // Link nodes (Payload wraps URL in `fields`)
  fields?: { url?: string; linkType?: string };
  // Top-level
  direction?: string | null;
  indent?: number;
  [key: string]: unknown;
}

// Format bitmask values used by Lexical
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_CODE = 16;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a Payload Lexical rich text field value to a markdown string.
 * Returns an empty string for null/undefined input.
 *
 * Accepts `unknown` so callers don't need to cast Payload's generated types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lexicalToMarkdown(data: any): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const root = data?.root;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!root?.children) return "";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return serializeChildren(root.children as LexicalNode[]).trim();
}

// ---------------------------------------------------------------------------
// Internal serialization
// ---------------------------------------------------------------------------

function serializeChildren(nodes: LexicalNode[]): string {
  return nodes.map((node) => serializeNode(node)).join("");
}

function serializeNode(node: LexicalNode): string {
  switch (node.type) {
    case "paragraph":
      return serializeParagraph(node);
    case "heading":
      return serializeHeading(node);
    case "list":
      return serializeList(node, 0);
    case "quote":
      return serializeQuote(node);
    case "horizontalrule":
      return "\n---\n\n";
    case "text":
      return serializeText(node);
    case "linebreak":
      return "\n";
    case "link":
    case "autolink":
      return serializeLink(node);
    case "tab":
      return "\t";
    default:
      // Unknown block node with children — render children
      if (node.children) {
        return serializeChildren(node.children);
      }
      return "";
  }
}

function serializeParagraph(node: LexicalNode): string {
  const inner = node.children ? serializeInline(node.children) : "";
  // Empty paragraphs become blank lines
  if (!inner.trim()) return "\n";
  return inner + "\n\n";
}

function serializeHeading(node: LexicalNode): string {
  const level = parseInt(node.tag?.replace("h", "") ?? "2", 10);
  const hashes = "#".repeat(level);
  const inner = node.children ? serializeInline(node.children) : "";
  return `${hashes} ${inner}\n\n`;
}

function serializeList(
  node: LexicalNode,
  depth: number
): string {
  if (!node.children) return "";
  const isOrdered = node.listType === "number";
  let result = "";
  let index = 1;

  for (const item of node.children) {
    if (item.type === "listitem") {
      const indent = "  ".repeat(depth);
      const bullet = isOrdered ? `${index}.` : "-";

      // List items can contain a mix of inline children and nested lists
      const inlineChildren: LexicalNode[] = [];
      const nestedLists: LexicalNode[] = [];

      for (const child of item.children ?? []) {
        if (child.type === "list") {
          nestedLists.push(child);
        } else {
          inlineChildren.push(child);
        }
      }

      const text = serializeInline(inlineChildren);
      result += `${indent}${bullet} ${text}\n`;

      for (const nested of nestedLists) {
        result += serializeList(nested, depth + 1);
      }

      index++;
    }
  }

  // Only add trailing newline at top level
  if (depth === 0) result += "\n";
  return result;
}

function serializeQuote(node: LexicalNode): string {
  const inner = node.children ? serializeInline(node.children) : "";
  const lines = inner.split("\n").map((line) => `> ${line}`);
  return lines.join("\n") + "\n\n";
}

// ---------------------------------------------------------------------------
// Inline serialization
// ---------------------------------------------------------------------------

/** Serialize an array of inline nodes (text, links, linebreaks). */
function serializeInline(nodes: LexicalNode[]): string {
  return nodes.map((n) => serializeInlineNode(n)).join("");
}

function serializeInlineNode(node: LexicalNode): string {
  switch (node.type) {
    case "text":
      return serializeText(node);
    case "link":
    case "autolink":
      return serializeLink(node);
    case "linebreak":
      return "\n";
    case "tab":
      return "\t";
    default:
      // Fallback: if it has children, serialize them inline
      if (node.children) return serializeInline(node.children);
      return "";
  }
}

function serializeText(node: LexicalNode): string {
  let text = node.text ?? "";
  if (!text) return "";

  const fmt = node.format ?? 0;

  // Apply formatting in a consistent order (code first since it shouldn't nest)
  if (fmt & IS_CODE) text = `\`${text}\``;
  if (fmt & IS_BOLD) text = `**${text}**`;
  if (fmt & IS_ITALIC) text = `*${text}*`;
  if (fmt & IS_STRIKETHROUGH) text = `~~${text}~~`;

  return text;
}

function serializeLink(node: LexicalNode): string {
  const url = node.fields?.url ?? "";
  const inner = node.children ? serializeInline(node.children) : url;
  return `[${inner}](${url})`;
}
