import Fuse from 'fuse.js';
import {
    getAllGuides,
    getAllServices,
    getAllCategoriesMetadata,
} from './content';
import { routing } from '@/i18n/routing';

type Locale = typeof routing.locales[number];

// Define types for search results
export type SearchResultType = 'guide' | 'service' | 'category';

export interface BaseSearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    description: string;
    url: string;
}

export interface GuideSearchResult extends BaseSearchResult {
    type: 'guide';
    sourceService: string;
    targetService: string;
    category: string;
}

export interface ServiceSearchResult extends BaseSearchResult {
    type: 'service';
    location: string;
    category: string;
    privacyRating: number;
    freeOption: boolean;
    region: 'eu' | 'non-eu';
}

export interface CategorySearchResult extends BaseSearchResult {
    type: 'category';
}

export type SearchResult = GuideSearchResult | ServiceSearchResult | CategorySearchResult;

// In-memory cache for search index (keyed by language)
const searchIndexes: Record<Locale, { index: Fuse<SearchResult>, lastUpdated: number } | undefined> = {
    en: undefined,
    nl: undefined,
};
const INDEX_TTL = 1000 * 60 * 5; // 5 minutes

// Function to build the search index
export async function buildSearchIndex(lang: Locale = 'en'): Promise<Fuse<SearchResult>> {
    console.log(`Building or retrieving search index for language: ${lang}`);

    // Check if we have a recent index in memory for this language
    const now = Date.now();
    const indexData = searchIndexes[lang];

    if (indexData && (now - indexData.lastUpdated < INDEX_TTL)) {
        console.log(`Using cached search index for language: ${lang}`);
        return indexData.index;
    }

    console.log(`Building new search index for language: ${lang}`);

    // Start with an empty array of search results
    const searchResults: SearchResult[] = [];

    try {
        // Get and index all guides
        const guides = await getAllGuides({ lang });
        console.log(`Indexing ${guides.length} guides for language: ${lang}`);

        for (const guide of guides) {
            searchResults.push({
                id: `guide-${guide.category}-${guide.slug}`,
                type: 'guide',
                title: guide.frontmatter.title,
                description: guide.frontmatter.description,
                url: `/${lang}/guides/${guide.category}/${guide.slug}`,
                sourceService: guide.frontmatter.sourceService,
                targetService: guide.frontmatter.targetService,
                category: guide.category
            });
        }

        // Get and index all services
        const services = await getAllServices(lang);
        console.log(`Indexing ${services.length} services for language: ${lang}`);

        for (const service of services) {
            // Ensure region is properly set
            const region = service.region || 'eu'; // Default to 'eu' for backward compatibility
            const slug = service.name.toLowerCase().replace(/\s+/g, '-');

            // Create the URL with the proper region path
            const url = `/${lang}/services/${region}/${slug}`;

            searchResults.push({
                id: `service-${slug}`,
                type: 'service',
                title: service.name,
                description: service.description,
                url: url,
                location: service.location,
                category: service.category,
                privacyRating: service.privacyRating,
                freeOption: service.freeOption,
                region: region
            });
        }

        // Get and index all categories
        const categories = getAllCategoriesMetadata(lang);
        console.log(`Indexing ${categories.length} categories for language: ${lang}`);

        for (const category of categories) {
            searchResults.push({
                id: `category-${category.slug}`,
                type: 'category',
                title: category.metadata.title,
                description: category.metadata.description,
                url: `/${lang}/services/${category.slug}`
            });
        }

        console.log(`Total indexed items: ${searchResults.length} for language: ${lang}`);

        // Create and configure Fuse instance for fuzzy search
        const fuseOptions = {
            includeScore: true,
            threshold: 0.4,
            keys: [
                { name: 'title', weight: 2 },
                { name: 'description', weight: 1 },
                'sourceService',
                'targetService',
                'category',
                'region',
                'location'
            ],
        };

        // Create new Fuse instance with our search results
        const newIndex = new Fuse(searchResults, fuseOptions);

        // Store in cache
        searchIndexes[lang] = {
            index: newIndex,
            lastUpdated: now
        };

        return newIndex;
    } catch (error) {
        console.error(`Error building search index for language ${lang}:`, error);
        throw new Error(`Failed to build search index: ${error}`);
    }
}

// Function to perform a search
export async function performSearch(query: string, options: {
    limit?: number;
    types?: SearchResultType[];
    region?: 'eu' | 'non-eu';
    lang?: Locale;
} = {}): Promise<SearchResult[]> {
    console.log(`Search lib: Performing search for "${query}"`);
    console.log('Search lib: Full options:', JSON.stringify(options, null, 2));

    if (!query.trim()) {
        console.log('Search lib: Empty query, returning empty results');
        return [];
    }

    const { limit = 20, types, region, lang = 'en' } = options;
    console.log(`Search lib: options - limit: ${limit}, types: ${types ? types.join(',') : 'all'}, region: ${region || 'all'}, lang: ${lang}`);

    const index = await buildSearchIndex(lang);

    // Create a basic search options object
    // We're explicitly using any here as the Fuse.js types are complex
    // and the code works correctly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchOptions: any = {};

    // Only filter by type for the Fuse.js search
    // We'll handle region filtering separately
    if (types && types.length > 0) {
        searchOptions.filter = (item: SearchResult) => {
            return types.includes(item.type);
        };
    }

    console.log(`Search lib: Starting search with type filter applied`);
    const fuseResults = index.search(query, searchOptions);
    console.log(`Search lib: Initial Fuse results: ${fuseResults.length}`);

    // Apply our own region filter AFTER Fuse.js search
    let filteredResults = fuseResults;

    if (region) {
        console.log(`Search lib: Applying region filter: ${region}`);
        filteredResults = fuseResults.filter(result => {
            const item = result.item;

            // If it's not a service, exclude it when region filter is applied
            if (item.type !== 'service') {
                return false;
            }

            // Check if the service has the correct region
            const serviceItem = item as ServiceSearchResult;
            const regionMatch = serviceItem.region === region;

            if (item.title.toLowerCase().includes(query.toLowerCase())) {
                console.log(`Post-filter check: ${item.title}, region=${serviceItem.region}, requested=${region}, match=${regionMatch}`);
            }

            return regionMatch;
        });

        console.log(`Search lib: After region filter: ${filteredResults.length} results`);
    }

    // Log all result items for debugging
    console.log('Search lib: Final results:', JSON.stringify(filteredResults.map(r => ({
        title: r.item.title,
        type: r.item.type,
        region: r.item.type === 'service' ? (r.item as ServiceSearchResult).region : 'N/A'
    })), null, 2));

    // Return limited results, mapped to just the item (without the score)
    return filteredResults.slice(0, limit).map(result => result.item);
}

// Function to get featured or recommended search results
export async function getRecommendedSearchResults(lang: Locale = 'en'): Promise<SearchResult[]> {
    console.log(`Getting recommended search results for language: ${lang}`);

    const index = await buildSearchIndex(lang);
    // Since we can't directly access the index data structure in a type-safe way,
    // let's get all items by doing an empty search
    const allResults = index.search('');
    const allItems = allResults.map(result => result.item);

    console.log(`Found ${allItems.length} total items for recommendations in language: ${lang}`);

    // Get a mix of result types, with a bias toward services
    const services = allItems.filter(item => item.type === 'service').slice(0, 5);
    const guides = allItems.filter(item => item.type === 'guide').slice(0, 3);
    const categories = allItems.filter(item => item.type === 'category').slice(0, 2);

    return [...services, ...guides, ...categories];
}