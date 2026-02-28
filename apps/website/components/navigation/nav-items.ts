import { getAllCategoriesMetadata } from "@switch-to-eu/content/services/categories";
import { getTranslations } from "next-intl/server";

export type MainNavItem = {
  title: string;
  href?: string;
  isExternal?: boolean;
  dropdown?: "simple" | "mega";
  mobileOnly?: boolean;
  children?: SubNavItem[];
};

export interface SubNavItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  isExternal?: boolean;
}

export async function getNavItems(): Promise<MainNavItem[]> {
  const categories = getAllCategoriesMetadata().map((category) => ({
    title: category.metadata.title,
    href: `/services/${category.slug}`,
    description: category.metadata.description,
    icon: category.metadata.icon,
  }));

  const t = await getTranslations("navigation");

  return [
    {
      title: t("services"),
      dropdown: "mega",
      children: [...categories],
    },
    {
      title: t("websiteTool"),
      href: `/tools/website`,
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
