// Type shim for the sibling importMap.js which Payload regenerates via
// `generate:importmap`. Without this, TS tries to infer the type from the
// .js file and the inferred type references non-portable node_modules
// paths (e.g. @payloadcms/richtext-lexical internals), which breaks the
// declaration build on Vercel.
export const importMap: Record<string, unknown>;
