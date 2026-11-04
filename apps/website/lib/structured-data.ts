const siteUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";

/** Absolute URL for a path after the locale, such as `services/email`. */
function pageUrl(locale: string, path: string): string {
  return `${siteUrl}/${locale}${path ? `/${path}` : ""}`;
}

/** BreadcrumbList for a page. The last crumb is the page itself. */
export function breadcrumbJsonLd(
  locale: string,
  crumbs: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: pageUrl(locale, crumb.path),
    })),
  };
}

/** ItemList of the pages a category page links to. */
export function itemListJsonLd(
  locale: string,
  name: string,
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: pageUrl(locale, item.path),
    })),
  };
}

/** Article for a guide. */
export function articleJsonLd({
  locale,
  path,
  headline,
  description,
  datePublished,
  dateModified,
}: {
  locale: string;
  path: string;
  headline: string;
  description: string;
  datePublished?: string | null;
  dateModified?: string | null;
}) {
  const publisher = {
    "@type": "Organization",
    name: "switch-to.eu",
    url: siteUrl,
  };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage: locale,
    mainEntityOfPage: pageUrl(locale, path),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified || datePublished
      ? { dateModified: dateModified || datePublished }
      : {}),
    author: publisher,
    publisher,
  };
}

/**
 * ISO 8601 duration for a guide's `timeRequired` ("45 minutes", "1 hour").
 * Returns null for a format it does not know, so the field is left out.
 */
export function isoDuration(timeRequired?: string | null): string | null {
  const match = timeRequired?.match(/^(\d+)\s*(minut|hour|uur)/i);
  if (!match) return null;
  const unit = match[2]?.toLowerCase().startsWith("m") ? "M" : "H";
  return `PT${match[1]}${unit}`;
}
