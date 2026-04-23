import type { ReactNode } from "react";
import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import { Link } from "@switch-to-eu/i18n/navigation";

type RichTextProps = Parameters<typeof LexicalRichText>[0];

function isInternalPath(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

function renderLink(
  href: string,
  newTab: boolean | undefined,
  children: ReactNode
): ReactNode {
  if (isInternalPath(href) && !newTab) {
    return <Link href={href}>{children}</Link>;
  }
  return (
    <a
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const href = node.fields.url ?? "#";
    return renderLink(
      href,
      node.fields.newTab,
      nodesToJSX({ nodes: node.children })
    );
  },
  autolink: ({ node, nodesToJSX }) =>
    renderLink(
      node.fields.url ?? "#",
      node.fields.newTab,
      nodesToJSX({ nodes: node.children })
    ),
});

export function RichText(props: RichTextProps) {
  return <LexicalRichText {...props} converters={jsxConverters} />;
}
