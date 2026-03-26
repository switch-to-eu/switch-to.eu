/**
 * Minimal type definitions for seed scripts.
 *
 * These types extract the parts of Payload's internal types that we need
 * without pulling in the full Payload type system or requiring database
 * connectivity at import time.
 */

import type { SanitizedServerEditorConfig } from "@payloadcms/richtext-lexical";
import type { SerializedEditorState } from "lexical";

/**
 * Subset of Payload's LexicalRichTextAdapter that we access in seed scripts.
 * The full type lives in @payloadcms/richtext-lexical but requires importing
 * from a path that also pulls in React and other heavy dependencies.
 */
export interface LexicalRichTextAdapter {
  editorConfig: SanitizedServerEditorConfig;
}

/**
 * Re-export for convenience in seed scripts.
 */
export type { SerializedEditorState, SanitizedServerEditorConfig };
