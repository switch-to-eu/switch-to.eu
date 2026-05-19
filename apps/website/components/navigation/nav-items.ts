import { unstable_cache } from "next/cache";
import { getPayload } from "@/lib/payload";
import { getAllToolsSorted, getToolUrl } from "@switch-to-eu/blocks/data/tools";
import { getLocale, getTranslations } from "next-intl/server";
import type { MainNavItem } from "@switch-to-eu/blocks/components/nav-types";
import type { Category } from "@/payload-types";

const i18nKeyMap: Record<string, string> = {
  "eu-scan": "euScan",
};

// Header/Footer render on every page in the app — this fetch was the residual
// 3–4 DB transactions per "warm" request. Cache the trimmed nav payload and
// invalidate via the `categories` tag in afterChange hooks.
const getNavCategories = unstable_cache(
  async (): Promise<Pick<Category, "title" | "slug" | "description" | "icon">[]> => {
    const payload = await getPayload();
    const { docs } = (await payload.find({
      collection: "categories",
      locale: "en",
      limit: 100,
      sort: "title",
      select: { title: true, slug: true, description: true, icon: true },
    })) as { docs: Pick<Category, "title" | "slug" | "description" | "icon">[] };
    return docs;
  },
  ["nav-categories"],
  { tags: ["categories"] }
);

export async function getNavItems(): Promise<MainNavItem[]> {
  const categoryDocs = await getNavCategories();
  const categories = categoryDocs.map((category) => ({
    title: category.title,
    href: `/services/${category.slug}`,
    description: category.description,
    icon: category.icon,
  }));

  const t = await getTranslations("navigation");
  const tTools = await getTranslations("tools.items");
  const locale = await getLocale();

  const allTools = getAllToolsSorted();
  const toolChildren = allTools.map((tool) => {
    const i18nKey = i18nKeyMap[tool.id] ?? tool.id;
    return {
      title: tTools(`${i18nKey}.title`),
      href: getToolUrl(tool, locale),
      description: tTools(`${i18nKey}.description`),
      icon: tool.icon,
      isExternal: true,
      disabled: tool.status !== "active",
    };
  });

  return [
    {
      title: t("services"),
      dropdown: "mega",
      children: [...categories],
    },
    {
      title: t("tools"),
      href: `/tools`,
      dropdown: "mega",
      children: toolChildren,
    },
    {
      title: t("about"),
      dropdown: "simple",
      children: [
        { title: t("aboutUs"), href: `/about` },
        { title: t("contribute"), href: `/contribute` },
      ],
    },
    {
      title: t("github"),
      href: "https://github.com/switch-to-eu/switch-to.eu",
      isExternal: true,
      mobileOnly: true,
    },
  ];
}
