import { getAllCategoriesMetadata } from "@/lib/content/services/categories";
import { getTranslations } from "next-intl/server";

export interface NavItem {
  title: string;
  href: string;
  isExternal?: boolean;
  dropdown?: boolean;
  children?: NavItem[];
  mobileOnly?: boolean;
}

export async function getNavItems(): Promise<NavItem[]> {
  const categories = getAllCategoriesMetadata().map((category) => ({
    title: category.metadata.title,
    href: `/services/${category.slug}`,
  }));

  const t = await getTranslations("navigation");

  return [
    {
      title: t("home"),
      href: ``,
    },
    {
      title: t("services"),
      href: `/services`,
      dropdown: true,
      children: [
        {
          title: t("allCategories"),
          href: `/services`,
        },
        ...categories,
      ],
    },
    {
      title: t("tools"),
      href: `/tools`,
      dropdown: true,
      children: [
        {
          title: t("websiteTool"),
          href: `/tools/website`,
        },
      ],
    },
    {
      title: t("about"),
      href: `/about`,
    },
    {
      title: t("contribute"),
      href: `/contribute`,
    },
    {
      title: t("github"),
      href: "https://github.com/VincentPeters/switch-to.eu",
      isExternal: true,
      mobileOnly: true,
    },
  ];
}
