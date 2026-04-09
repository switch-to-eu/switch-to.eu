/* eslint-disable @typescript-eslint/no-unsafe-argument */
/**
 * Markdown-to-Lexical converter for Payload CMS seed scripts.
 *
 * Converts Markdown strings into Payload's Lexical editor JSON format
 * (SerializedEditorState). Uses a headless Lexical editor with Payload's
 * node types and markdown transformers to produce output that is fully
 * compatible with Payload's richText fields.
 *
 * Two modes of operation:
 *
 * 1. `markdownToLexical(markdown)` — standalone, uses a manually assembled
 *    set of nodes and transformers. Covers headings, paragraphs, bold, italic,
 *    strikethrough, inline code, links, ordered/unordered lists, blockquotes,
 *    and horizontal rules. Sufficient for seed scripts.
 *
 * 2. `markdownToLexicalWithPayload(markdown, payload)` — uses the Payload
 *    instance's editor config for full fidelity. Preferred when a Payload
 *    instance is available (e.g., inside the seed entry point).
 */

import type { SerializedEditorState, LexicalNode } from "lexical";
import type { Payload } from "payload";

import { createHeadlessEditor } from "@payloadcms/richtext-lexical/lexical/headless";
import {
  $convertFromMarkdownString,
  TRANSFORMERS,
  type Transformer,
} from "@payloadcms/richtext-lexical/lexical/markdown";
import { HeadingNode, QuoteNode } from "@payloadcms/richtext-lexical/lexical/rich-text";
import { ListItemNode, ListNode } from "@payloadcms/richtext-lexical/lexical/list";
import {
  $createTextNode,
  DecoratorNode,
  $applyNodeReplacement,
} from "@payloadcms/richtext-lexical/lexical";
import {
  $createLinkNode,
  $isLinkNode,
  LinkNode,
  AutoLinkNode,
} from "@payloadcms/richtext-lexical";

import type { LexicalRichTextAdapter } from "./types.js";

// ---------------------------------------------------------------------------
// HorizontalRuleNode
//
// Minimal server-side horizontal rule node that mirrors Payload's
// HorizontalRuleServerNode. We define it here using the same `lexical`
// module that the headless editor uses, avoiding the "multiple copies of
// lexical" error that occurs when importing from internal package paths.
// The node type is "horizontalrule" — matching Payload's convention.
// ---------------------------------------------------------------------------

type SerializedHorizontalRuleNode = {
  type: "horizontalrule";
  version: 1;
};

class HorizontalRuleNode extends DecoratorNode<null> {
  static getType(): string {
    return "horizontalrule";
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(
    // eslint-disable-next-line no-unused-vars
    _serializedNode: SerializedHorizontalRuleNode,
  ): HorizontalRuleNode {
    return $createHorizontalRuleNode();
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return { type: "horizontalrule", version: 1 };
  }

  createDOM(): HTMLElement {
    return document.createElement("hr");
  }

  updateDOM(): false {
    return false;
  }

  decorate(): null {
    return null;
  }
}

function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode());
}

function $isHorizontalRuleNode(
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode;
}

// ---------------------------------------------------------------------------
// Link markdown transformer
// Adapted from @payloadcms/richtext-lexical link feature.
// Creates Payload's LinkNode (with fields.linkType, fields.url, etc.)
// ---------------------------------------------------------------------------

const LinkMarkdownTransformer: Transformer = {
  type: "text-match",
  dependencies: [LinkNode],
  export: (
    _node: LexicalNode,
    // eslint-disable-next-line no-unused-vars
    exportChildren: (_node: LexicalNode) => string,
  ) => {
    if (!$isLinkNode(_node)) {
      return null;
    }
    const node = _node as unknown as {
      getFields: () => { url?: string };
    };
    const { url } = node.getFields();
    const textContent = exportChildren(_node);
    return `[${textContent}](${url})`;
  },
  importRegExp:
    /(?<!!)\[([^[]+)\]\(([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?\)/,
  regExp:
    /(?<!!)\[([^[]+)\]\(([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?\)$/,
  replace: (textNode: LexicalNode, match: RegExpMatchArray) => {
    const [, linkText, linkUrl] = match;
    const linkNode = $createLinkNode({
      fields: {
        doc: null,
        linkType: "custom",
        newTab: false,
        url: linkUrl,
      },
    });
    // eslint-disable-next-line no-unused-vars
    const tn = textNode as unknown as { getFormat: () => number; replace: (_node: LexicalNode) => void };
    const linkTextNode = $createTextNode(linkText);
    linkTextNode.setFormat(tn.getFormat());
    linkNode.append(linkTextNode);
    tn.replace(linkNode);
    return linkTextNode;
  },
  trigger: ")",
};

// ---------------------------------------------------------------------------
// Horizontal rule markdown transformer
// ---------------------------------------------------------------------------

const HorizontalRuleMarkdownTransformer: Transformer = {
  type: "element",
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    if (!$isHorizontalRuleNode(node)) {
      return null;
    }
    return "---";
  },
  regExp: /^---\s*$/,
  replace: (parentNode: LexicalNode) => {
    const node = $createHorizontalRuleNode();
    // eslint-disable-next-line no-unused-vars
    const pn = parentNode as unknown as { replace: (_node: LexicalNode) => void };
    pn.replace(node);
  },
};

// ---------------------------------------------------------------------------
// Node and transformer configuration
// ---------------------------------------------------------------------------

/**
 * All Lexical node types needed by the markdown transformers.
 */
const NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  HorizontalRuleNode,
];

/**
 * Combined set of markdown transformers:
 * - TRANSFORMERS (from @lexical/markdown): heading, quote, ordered list,
 *   unordered list, bold, italic, strikethrough, highlight, inline code
 * - LinkMarkdownTransformer: [text](url) links using Payload's LinkNode
 * - HorizontalRuleMarkdownTransformer: --- horizontal rules
 */
const ALL_TRANSFORMERS: Transformer[] = [
  ...TRANSFORMERS,
  LinkMarkdownTransformer,
  HorizontalRuleMarkdownTransformer,
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a Markdown string to Payload-compatible Lexical editor JSON.
 *
 * This standalone version creates its own headless editor with all the
 * node types and transformers needed for typical content (headings, text
 * formatting, links, lists, blockquotes, horizontal rules).
 *
 * @param markdown - The Markdown string to convert
 * @returns SerializedEditorState compatible with Payload's richText field
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function markdownToLexical(
  markdown: string,
): Promise<SerializedEditorState> {
  const headlessEditor = createHeadlessEditor({
    nodes: NODES,
  });

  headlessEditor.update(
    () => {
      $convertFromMarkdownString(markdown, ALL_TRANSFORMERS);
    },
    { discrete: true },
  );

  return headlessEditor.getEditorState().toJSON();
}

/**
 * Convert a Markdown string to Payload-compatible Lexical editor JSON,
 * using the full editor config from a Payload instance.
 *
 * This version extracts the SanitizedServerEditorConfig from the Payload
 * instance's editor adapter, ensuring all registered features (including
 * any custom ones) are available during conversion.
 *
 * @param markdown - The Markdown string to convert
 * @param payload - The Payload instance (from getPayload())
 * @returns SerializedEditorState compatible with Payload's richText field
 */
export async function markdownToLexicalWithPayload(
  markdown: string,
  payload: Payload,
): Promise<SerializedEditorState> {
  const { convertMarkdownToLexical } = await import(
    "@payloadcms/richtext-lexical"
  );

  const editor = payload.config.editor as unknown as LexicalRichTextAdapter;

  if (!editor?.editorConfig) {
    throw new Error(
      "Could not extract editor config from Payload instance. " +
        "Make sure the Payload config uses lexicalEditor().",
    );
  }

  return convertMarkdownToLexical({
    editorConfig: editor.editorConfig,
    markdown,
  });
}
