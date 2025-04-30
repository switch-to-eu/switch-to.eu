import 'server-only';
import { locales } from "@/middleware";

// Define the type for locale
export type Locale = (typeof locales)[number];

// Define default language
export const defaultLanguage: Locale = 'en';

//TODO: SIMON pls fix this?!

// Define the dictionary type to provide TypeScript support
export type Dictionary = {
    common: {
        title: string;
        description: string;
        search: string;
        searchPlaceholder: string;
        searchResults: string;
        noResults: string;
        loading: string;
    };
    navigation: {
        home: string;
        services: string;
        tools: string;
        about: string;
        contribute: string;
        github: string;
        allCategories: string;
        websiteTool: string;
        contributeGuide: string;
        feedback: string;
    };
    home: {
        heading: string;
        subheading: string;
        featuredSection: string;
        categoriesSectionTitle: string;
        viewAll: string;
        heroTitle: string;
        heroSubtitle: string;
        heroDescription: string;
        exampleLabel: string;
        featuresEuropeanTitle: string;
        featuresEuropeanDescription: string;
        featuresGuidesTitle: string;
        featuresGuidesDescription: string;
        featuresCommunityTitle: string;
        featuresCommunityDescription: string;
        whySwitchTitle: string;
        whySwitchDescription1: string;
        whySwitchDescription2: string;
        knowMoreButton: string;
    };
    footer: {
        rightsReserved: string;
        privacyPolicy: string;
        termsOfService: string;
        contactUs: string;
        poweredBy: string;
    };
    contribute: {
        title: string;
        description: string;
        cta: string;
        ctaTitle: string;
        ctaDescription: string;
    };
    about: {
        title: string;
        description: string;
        heroTitle: string;
        heroDescription1: string;
        heroDescription2: string;
        pillarsTitle: string;
        pillar1Title: string;
        pillar1Description: string;
        pillar2Title: string;
        pillar2Description: string;
        pillar3Title: string;
        pillar3Description: string;
        whyChooseTitle: string;
        reason1Title: string;
        reason1Description: string;
        reason2Title: string;
        reason2Description: string;
        reason3Title: string;
        reason3Description: string;
        reason4Title: string;
        reason4Description: string;
        reason5Title: string;
        reason5Description: string;
        reason6Title: string;
        reason6Description: string;
        joinMissionTitle: string;
        joinMissionDescription1: string;
        joinMissionDescription2: string;
        contributeTitle: string;
        contribute1Title: string;
        contribute1Description: string;
        contribute2Title: string;
        contribute2Description: string;
        contribute3Title: string;
        contribute3Description: string;
        contributeButtonText: string;
    };
    services: {
        title: string;
        description: string;
        viewServices: string;
        alternatives: string;
        featuredAlternatives: string;
        viewMore: string;
        category: string;
        location: string;
        freeOption: string;
        paidOnly: string;
        viewDetails: string;
    };
    tools: {
        title: string;
        description: string;
        websiteTool: {
            title: string;
            description: string;
        };
    };
    language: {
        en: string;
        nl: string;
    };
    feedback: {
        meta: {
            title: string;
            description: string;
        };
        hero: {
            title: string;
            description1: string;
            description2: string;
            imageAlt: string;
        };
        form: {
            title: string;
            description: string;
            titleLabel: string;
            titlePlaceholder: string;
            descriptionLabel: string;
            descriptionPlaceholder: string;
            categoryLabel: string;
            categoryPlaceholder: string;
            bugCategory: string;
            featureCategory: string;
            feedbackCategory: string;
            otherCategory: string;
            contactInfoLabel: string;
            contactInfoPlaceholder: string;
            submitButton: string;
            submitting: string;
            successMessage: string;
            errorMessage: string;
            viewIssue: string;
            validation: {
                titleMinLength: string;
                titleNoHtml: string;
                descriptionMinLength: string;
                descriptionNoHtml: string;
                categoryRequired: string;
                invalidEmail: string;
            };
        };
    };
    guideProgress: {
        stepCompletionButton: {
            markComplete: string;
            completed: string;
        };
        progressIndicator: {
            progress: string;
            stepsCount: string;
            completed: string;
        };
        completionCelebration: {
            congratulations: string;
            successMessage: string;
            continueButton: string;
        };
        unnamedStep: string;
    };
};

// Import dictionaries lazily
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default) as Promise<Dictionary>,
    nl: () => import('@/dictionaries/nl.json').then((module) => module.default) as Promise<Dictionary>,
};

export const getDictionary = async (locale: Locale) => {
    try {
        return await dictionaries[locale]();
    } catch {
        // If dictionary for locale is not found, fall back to English
        console.error(`Dictionary for locale ${locale} not found, falling back to English`);
        return await dictionaries.en();
    }
};

/**
 * Access nested dictionary values using dot notation
 * Example: getNestedValue(dict, 'contribute.guide.heading')
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    return keys.reduce((o, k) => (o && typeof o === 'object' && k in o ? o[k as keyof typeof o] : undefined), obj as unknown);
}