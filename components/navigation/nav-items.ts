import { getAllCategoriesMetadata } from "@/lib/content";

export interface NavItem {
  title: string;
  href: string;
  isExternal?: boolean;
  dropdown?: boolean;
  children?: NavItem[];
  mobileOnly?: boolean;
}

export function getNavItems(): NavItem[] {
  const categories = getAllCategoriesMetadata().map((category) => ({
    title: category.metadata.title,
    href: `/services/${category.slug}`,
  }));

  return [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Services",
      href: "/services",
      dropdown: true,
      children: [
        {
          title: "All Categories",
          href: "/services",
        },
        ...categories,
      ],
    },
    {
      title: "Tools",
      href: "/tools",
      dropdown: true,
      children: [
        {
          title: "Website tool",
          href: "/tools/website",
        },
      ],
    },
    {
      title: "About",
      href: "/about",
    },
    {
      title: "Contribute",
      href: "/contribute",
    },
    {
      title: "GitHub",
      href: "https://github.com/VincentPeters/switch-to.eu",
      isExternal: true,
      mobileOnly: true,
    },
  ];
}
