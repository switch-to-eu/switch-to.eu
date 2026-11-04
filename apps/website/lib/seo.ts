import type { Metadata, ResolvingMetadata } from "next";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import type { Locale } from "@switch-to-eu/i18n/routing";

/**
 * Open Graph values a page keeps from its parents. Next.js replaces the whole
 * `openGraph` object when a page sets one, so a page that sets its own title
 * must copy these or it loses `og:site_name`, `og:locale` and the parent image.
 */
export async function inheritedOpenGraph(
  parent: ResolvingMetadata,
  url: string,
) {
  const { siteName, locale, images } = (await parent).openGraph ?? {};
  return {
    url,
    siteName: siteName ?? undefined,
    locale,
    images,
  };
}

/** Title, description, canonical, hreflang and Open Graph tags for one page. */
export async function pageMetadata({
  parent,
  path,
  locale,
  title,
  description,
}: {
  parent: ResolvingMetadata;
  /** Path after the locale, with no leading slash. Empty for the home page. */
  path: string;
  locale: string;
  title: string;
  description: string;
}): Promise<Metadata> {
  const alternates = generateLanguageAlternates(path, locale as Locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      ...(await inheritedOpenGraph(parent, alternates.canonical)),
      type: "website",
      title,
      description,
    },
  };
}
