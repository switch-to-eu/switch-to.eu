import { getAllCategoriesMetadata } from "@/lib/content/services/categories";
import { getTranslations } from "next-intl/server";

export type MainNavItem = {
  title: string;
  href?: string;
  isExternal?: boolean;
  dropdown?: boolean;
  mobileOnly?: boolean;
  children?: SubNavItem[];
};

export interface SubNavItem {
  title: string;
  href: string;
  isExternal?: boolean;
}

export async function getNavItems(): Promise<MainNavItem[]> {
  const categories = getAllCategoriesMetadata().map((category) => ({
    title: category.metadata.title,
    href: `/services/${category.slug}`,
  }));

  const t = await getTranslations("navigation");

  return [
    {
      title: t("home"),
      href: `/`,
    },
    {
      title: t("services"),
      dropdown: true,
      children: [...categories],
    },
    {
      title: t("websiteTool"),
      href: `/tools/website`,
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
      href: "https://github.com/switch-to-eu/switch-to.eu",
      isExternal: true,
      mobileOnly: true,
    },
  ];
}
