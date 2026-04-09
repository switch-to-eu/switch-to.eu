import { getPayload } from "@/lib/payload";
import { getAllToolsSorted } from "@switch-to-eu/blocks/data/tools";
import { getTranslations } from "next-intl/server";
import type { MainNavItem } from "@switch-to-eu/blocks/components/nav-types";
import type { Category } from "@/payload-types";

const i18nKeyMap: Record<string, string> = {
  "eu-scan": "euScan",
};

export async function getNavItems(): Promise<MainNavItem[]> {
  const payload = await getPayload();
  const { docs: categoryDocs } = await payload.find({
    collection: "categories",
    locale: "en",
    limit: 100,
    sort: "title",
  }) as { docs: Category[] };
  const categories = categoryDocs.map((category) => ({
    title: category.title,
    href: `/services/${category.slug}`,
    description: category.description,
    icon: category.icon,
  }));

  const t = await getTranslations("navigation");
  const tTools = await getTranslations("tools.items");

  const allTools = getAllToolsSorted();
  const toolChildren = allTools.map((tool) => {
    const i18nKey = i18nKeyMap[tool.id] ?? tool.id;
    return {
      title: tTools(`${i18nKey}.title`),
      href: tool.url,
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
