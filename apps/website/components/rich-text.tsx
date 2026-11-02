import { getLocale } from "next-intl/server";
import { renderMarkdown } from "@/lib/markdown";

interface RichTextProps {
  /** Markdown source. */
  data: string | null | undefined;
  className?: string;
  /** Kept for call-site compatibility; the wrapper div is always rendered. */
  disableContainer?: boolean;
}

/** Renders markdown content from /content as HTML (server component). */
export async function RichText({ data, className }: RichTextProps) {
  if (!data) return null;
  const locale = await getLocale();
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(data, locale) }}
    />
  );
}
