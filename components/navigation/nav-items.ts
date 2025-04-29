import { getAllCategoriesMetadata } from "@/lib/content/services/categories";
import { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";

export interface NavItem {
    title: string;
    href: string;
    isExternal?: boolean;
    dropdown?: boolean;
    children?: NavItem[];
    mobileOnly?: boolean;
}

export async function getNavItems(lang: Locale = 'en'): Promise<NavItem[]> {
    const categories = getAllCategoriesMetadata().map((category) => ({
        title: category.metadata.title,
        href: `/${lang}/services/${category.slug}`,
    }));

    const dict = await getDictionary(lang);

    return [
        {
            title: dict.navigation.home,
            href: `/${lang}`,
        },
        {
            title: dict.navigation.services,
            href: `/${lang}/services`,
            dropdown: true,
            children: [
                {
                    title: dict.navigation.allCategories,
                    href: `/${lang}/services`,
                },
                ...categories,
            ],
        },
        {
            title: dict.navigation.tools,
            href: `/${lang}/tools`,
            dropdown: true,
            children: [
                {
                    title: dict.navigation.websiteTool,
                    href: `/${lang}/tools/website`,
                },
            ],
        },
        {
            title: dict.navigation.about,
            href: `/${lang}/about`,
        },
        {
            title: dict.navigation.contribute,
            href: `/${lang}/contribute`,
        },
        {
            title: dict.navigation.github,
            href: "https://github.com/VincentPeters/switch-to.eu",
            isExternal: true,
            mobileOnly: true,
        },
    ];
}
