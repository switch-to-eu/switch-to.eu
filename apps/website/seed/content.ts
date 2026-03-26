/**
 * Content package import helper.
 *
 * The @switch-to-eu/content package is CJS (no "type": "module").
 * When the website runs as ESM ("type": "module"), named imports from
 * CJS packages fail. We use createRequire to load it as CJS, then
 * re-export the functions we need.
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Load each submodule via require (CJS-compatible)
const categories = require("@switch-to-eu/content/services/categories");
const services = require("@switch-to-eu/content/services/services");
const guides = require("@switch-to-eu/content/services/guides");
const landingPages = require("@switch-to-eu/content/services/landing-pages");
const pages = require("@switch-to-eu/content/services/pages");
const utils = require("@switch-to-eu/content/utils");

// Re-export as ESM named exports
export const getAllCategoriesMetadata = categories.getAllCategoriesMetadata;
export const getCategoryContent = categories.getCategoryContent;

export const getServiceSlugs = services.getServiceSlugs;
export const getServiceBySlug = services.getServiceBySlug;

export const getAllGuides = guides.getAllGuides;
export const getGuide = guides.getGuide;

export const getAllLandingPages = landingPages.getAllLandingPages;
export const getLandingPage = landingPages.getLandingPage;

export const getPageContent = pages.getPageContent;

export const extractStepsWithMeta = utils.extractStepsWithMeta;
