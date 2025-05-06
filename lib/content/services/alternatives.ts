import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getLanguageContentPath, isAlternativesFrontmatter } from "../utils";
import { getServicesByCategory } from "./services";
import { AlternativesFrontmatter } from "../schemas";
import { Locale } from "next-intl";

/**
 * Function to get services for a category
 */
export async function getAlternativesByCategory(
    category: string,
    lang: Locale = "en"
): Promise<AlternativesFrontmatter | null> {
    const langContentRoot = getLanguageContentPath(lang);
    const mdFile = path.join(
        langContentRoot,
        "alternatives",
        category,
        "index.md"
    );

    try {
        if (fs.existsSync(mdFile)) {
            const fileContent = fs.readFileSync(mdFile, "utf8");
            const { data } = matter(fileContent);

            if (!isAlternativesFrontmatter(data)) {
                console.warn(`Invalid frontmatter in ${mdFile}`);
                return null;
            }

            return data;
        }

        // If no legacy file exists, try to load from individual service files
        const services = await getServicesByCategory(category, undefined, lang);

        if (services.length === 0) {
            return null;
        }

        // Create a compatible AlternativesFrontmatter object from the services
        const alternativesData: AlternativesFrontmatter = {
            title: `${category.charAt(0).toUpperCase() + category.slice(1)
                } Service Alternatives`,
            description: `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`,
            services: services.map((service) => ({
                name: service.name,
                location: service.location,
                freeOption: service.freeOption,
                startingPrice: service.startingPrice,
                description: service.description,
                url: service.url,
            })),
        };

        return alternativesData;
    } catch (error) {
        console.error(`Error reading alternatives for ${category}:`, error);
        return null;
    }
}

/**
 * Get a list of all alternatives categories
 */
export function getAlternativesCategories(lang: Locale = "en"): Array<string> {
    const langContentRoot = getLanguageContentPath(lang);
    const alternativesPath = path.join(langContentRoot, "alternatives");

    return fs.existsSync(alternativesPath)
        ? fs
            .readdirSync(alternativesPath)
            .filter(
                (dir) =>
                    fs.statSync(path.join(alternativesPath, dir)).isDirectory() &&
                    !dir.startsWith(".")
            )
        : [];
}
