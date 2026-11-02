import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  Article,
  ArticleLocale,
  ArticleSource,
  Category,
  Guide,
  GuideStep,
  LandingPage,
  Locale,
  Page,
  Service,
} from "./types";
import { slugify } from "@/lib/markdown";

/**
 * Markdown content loader.
 *
 * Layout: `content/<collection>/<slug>/en.md` holds every field (YAML
 * frontmatter) plus the main body. An optional `nl.md` overrides localized
 * fields; any key it leaves out falls back to English. For guides the body is
 * split into `<!-- section:name -->` blocks and Dutch sections fall back to
 * English one by one.
 *
 * Everything is parsed once per process. In development the cache is skipped
 * so edits show up on refresh.
 */

export const LOCALES: Locale[] = ["en", "nl"];

type Raw = Record<string, unknown>;
interface RawDoc {
  slug: string;
  data: Partial<Record<Locale, Raw>>;
  body: Partial<Record<Locale, string>>;
}

interface Store {
  categories: Map<string, Category>;
  services: Map<string, Service>;
  guides: Map<string, Guide>;
  landingPages: Map<string, LandingPage>;
  pages: Map<string, Page>;
}

const isDev = process.env.NODE_ENV === "development";

/** Drafts are visible in `next dev` and hidden from production builds. */
const includeDrafts = process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1";

/**
 * `/content` at the repo root. Next runs from `apps/website` in dev, build and
 * the standalone server, and `outputFileTracingIncludes` in next.config.ts
 * ships the files alongside the server bundle.
 */
const CONTENT_ROOT = path.join(process.cwd(), "..", "..", "content");

export function getContentRoot(): string {
  return CONTENT_ROOT;
}

// ---------------------------------------------------------------------------
// Reading files
// ---------------------------------------------------------------------------

/** gray-matter turns unquoted YAML dates into Date objects. Undo that. */
function normalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Raw).map(([k, v]) => [k, normalize(v)])
    );
  }
  return value;
}

function readCollection(collection: string): RawDoc[] {
  const dir = path.join(CONTENT_ROOT, collection);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => {
      const doc: RawDoc = { slug: entry.name, data: {}, body: {} };
      for (const locale of LOCALES) {
        const file = path.join(dir, entry.name, `${locale}.md`);
        if (!fs.existsSync(file)) continue;
        const parsed = matter(fs.readFileSync(file, "utf8"));
        doc.data[locale] = normalize(parsed.data) as Raw;
        doc.body[locale] = parsed.content.trim();
      }
      return doc;
    })
    .filter((doc) => {
      if (!doc.data.en) {
        console.warn(`[content] ${collection}/${doc.slug} has no en.md, skipping`);
        return false;
      }
      return includeDrafts || doc.data.en.draft !== true;
    });
}

/** English data with the locale's overrides applied. */
/** Coerce a frontmatter scalar to string (YAML may parse numbers/booleans). */
function str(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function localized(doc: RawDoc, locale: Locale): Raw {
  const en = doc.data.en ?? {};
  if (locale === "en") return { ...en };
  return { ...en, ...(doc.data[locale] ?? {}) };
}

function localizedBody(doc: RawDoc, locale: Locale): string {
  return (doc.body[locale] || doc.body.en || "").trim();
}

function base(doc: RawDoc, data: Raw) {
  return {
    ...data,
    id: doc.slug,
    slug: doc.slug,
    updatedAt: (data.updatedAt as string | undefined) ?? "",
  };
}

// ---------------------------------------------------------------------------
// Guide body sections
// ---------------------------------------------------------------------------

const SECTION_RE = /<!--\s*section:(\w+)\s*-->([\s\S]*?)<!--\s*end-section\s*-->/g;
const STEP_RE =
  /<!--\s*step-start\s*-->\s*<!--\s*step-meta\s*([\s\S]*?)-->([\s\S]*?)<!--\s*step-end\s*-->/g;

function parseSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  for (const match of body.matchAll(SECTION_RE)) {
    sections[match[1]!] = match[2]!.trim();
  }
  return sections;
}

function parseSteps(stepsSection: string | undefined): GuideStep[] {
  if (!stepsSection) return [];
  const used = new Set<string>();
  return [...stepsSection.matchAll(STEP_RE)].map((match, index) => {
    const meta = (normalize(matter(`---\n${match[1]!.trim()}\n---\n`).data) ?? {}) as Raw;
    const title = str(meta.title, `Step ${index + 1}`);
    let id = slugify(title) || `step-${index + 1}`;
    while (used.has(id)) id = `${id}-${index + 1}`;
    used.add(id);
    return {
      id,
      title,
      content: match[2]!.trim(),
      video: (meta.video as string | undefined) ?? null,
      videoOrientation: (meta.videoOrientation as GuideStep["videoOrientation"]) ?? null,
      complete: meta.complete === true,
    };
  });
}

// ---------------------------------------------------------------------------
// Building the store
// ---------------------------------------------------------------------------

function buildStore(locale: Locale): Store {
  const categories = new Map<string, Category>();
  for (const doc of readCollection("categories")) {
    const data = localized(doc, locale);
    categories.set(doc.slug, {
      ...base(doc, data),
      title: str(data.title, doc.slug),
      description: str(data.description),
      content: localizedBody(doc, locale) || null,
    } as Category);
  }

  const resolveCategory = (slug: unknown, owner: string): Category => {
    const category = typeof slug === "string" ? categories.get(slug) : undefined;
    if (!category) throw new Error(`[content] ${owner}: unknown category "${String(slug)}"`);
    return category;
  };

  const services = new Map<string, Service>();
  const serviceDocs = readCollection("services");
  for (const doc of serviceDocs) {
    const data = localized(doc, locale);
    services.set(doc.slug, {
      ...base(doc, data),
      category: resolveCategory(data.category, `services/${doc.slug}`),
      recommendedAlternative: null,
      content: localizedBody(doc, locale) || null,
    } as Service);
  }
  // Second pass once every service exists.
  for (const doc of serviceDocs) {
    const alt = doc.data.en?.recommendedAlternative;
    if (typeof alt === "string") {
      services.get(doc.slug)!.recommendedAlternative = services.get(alt) ?? null;
    }
  }

  const resolveService = (slug: unknown) =>
    typeof slug === "string" ? (services.get(slug) ?? null) : null;

  const guides = new Map<string, Guide>();
  for (const doc of readCollection("guides")) {
    const data = localized(doc, locale);
    const sections = {
      ...parseSections(doc.body.en ?? ""),
      ...(locale === "en" ? {} : parseSections(doc.body[locale] ?? "")),
    };
    guides.set(doc.slug, {
      ...base(doc, data),
      title: str(data.title, doc.slug),
      description: str(data.description),
      category: resolveCategory(data.category, `guides/${doc.slug}`),
      sourceService: resolveService(data.sourceService),
      targetService: resolveService(data.targetService),
      intro: sections.intro || null,
      beforeYouStart: sections.beforeYouStart || null,
      steps: parseSteps(sections.steps),
      troubleshooting: sections.troubleshooting || null,
      outro: sections.outro || null,
    } as Guide);
  }

  const landingPages = new Map<string, LandingPage>();
  for (const doc of readCollection("landing-pages")) {
    const data = localized(doc, locale);
    landingPages.set(doc.slug, {
      ...base(doc, data),
      category: typeof data.category === "string" ? (categories.get(data.category) ?? null) : null,
      recommendedServices: ((data.recommendedServices as string[] | undefined) ?? [])
        .map(resolveService)
        .filter((s): s is Service => s !== null),
      relatedService: resolveService(data.relatedService),
      content: localizedBody(doc, locale) || null,
    } as LandingPage);
  }

  const pages = new Map<string, Page>();
  for (const doc of readCollection("pages")) {
    const data = localized(doc, locale);
    pages.set(doc.slug, {
      ...base(doc, data),
      title: str(data.title, doc.slug),
      content: localizedBody(doc, locale) || null,
    } as Page);
  }

  return { categories, services, guides, landingPages, pages };
}

const cache = new Map<Locale, Store>();

function toLocale(locale: string): Locale {
  return (LOCALES as string[]).includes(locale) ? (locale as Locale) : "en";
}

export function getStore(locale: string): Store {
  const loc = toLocale(locale);
  if (isDev) return buildStore(loc);
  let store = cache.get(loc);
  if (!store) {
    store = buildStore(loc);
    cache.set(loc, store);
  }
  return store;
}

// ---------------------------------------------------------------------------
// Collection accessors
// ---------------------------------------------------------------------------

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
const byTitle = (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title);

/** Services sorted by name (A→Z). */
export const getAllServices = (locale: string) =>
  [...getStore(locale).services.values()].sort(byName);
/** Categories sorted by title (A→Z). */
export const getAllCategories = (locale: string) =>
  [...getStore(locale).categories.values()].sort(byTitle);
export const getAllGuides = (locale: string) =>
  [...getStore(locale).guides.values()].sort(byTitle);
export const getAllLandingPages = (locale: string) =>
  [...getStore(locale).landingPages.values()].sort(byTitle);
export const getAllPages = (locale: string) =>
  [...getStore(locale).pages.values()].sort(byTitle);

export const findService = (slug: string, locale: string) =>
  getStore(locale).services.get(slug) ?? null;
export const findCategory = (slug: string, locale: string) =>
  getStore(locale).categories.get(slug) ?? null;
export const findGuide = (slug: string, locale: string) =>
  getStore(locale).guides.get(slug) ?? null;
export const findLandingPage = (slug: string, locale: string) =>
  getStore(locale).landingPages.get(slug) ?? null;
export const findPage = (slug: string, locale: string) =>
  getStore(locale).pages.get(slug) ?? null;

// ---------------------------------------------------------------------------
// Articles
//
// Each locale file is a full translation with its own `draft` flag (see
// .claude/skills/_shared/content-files.md, "Articles"). Shared metadata
// (date, story, relations, sources) lives only in en.md.
// ---------------------------------------------------------------------------

export const ARTICLE_LOCALES: ArticleLocale[] = ["en", "nl", "fr"];

interface RawArticle {
  slug: string;
  files: Partial<Record<ArticleLocale, { data: Raw; body: string }>>;
}

function readArticles(): RawArticle[] {
  const dir = path.join(CONTENT_ROOT, "articles");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => {
      const article: RawArticle = { slug: entry.name, files: {} };
      for (const locale of ARTICLE_LOCALES) {
        const file = path.join(dir, entry.name, `${locale}.md`);
        if (!fs.existsSync(file)) continue;
        const parsed = matter(fs.readFileSync(file, "utf8"));
        const data = normalize(parsed.data) as Raw;
        if (!includeDrafts && data.draft === true) continue;
        article.files[locale] = { data, body: parsed.content.trim() };
      }
      return article;
    })
    .filter((article) => article.files.en);
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function buildArticles(locale: ArticleLocale): Article[] {
  const store = getStore(locale === "fr" ? "en" : locale);
  const lookup = <T>(map: Map<string, T>, slugs: unknown) =>
    stringList(slugs)
      .map((slug) => map.get(slug))
      .filter((v): v is T => v !== undefined);

  return readArticles()
    .filter((a) => a.files[locale])
    .map((a) => {
      const en = a.files.en!.data;
      const own = a.files[locale]!;
      const sources = (Array.isArray(en.sources) ? (en.sources as Raw[]) : [])
        .map((src): ArticleSource => ({
          title: str(src.title),
          publisher: str(src.publisher),
          url: str(src.url),
          date: str(src.date) || null,
        }))
        .filter((src) => !!src.url);
      return {
        ...own.data,
        id: a.slug,
        slug: a.slug,
        locale,
        locales: ARTICLE_LOCALES.filter((l) => a.files[l]),
        draft: own.data.draft === true,
        title: str(own.data.title, a.slug),
        description: str(own.data.description),
        date: str(en.date),
        type: en.type === "analysis" ? "analysis" : "news",
        story: str(en.story) || null,
        entities: stringList(en.entities),
        services: lookup(store.services, en.services),
        categories: lookup(store.categories, en.categories),
        guides: lookup(store.guides, en.guides),
        sources,
        author: str(en.author, "Switch-to.eu"),
        keywords: stringList(own.data.keywords),
        content: own.body,
        updatedAt: str(own.data.updatedAt) || str(en.updatedAt) || str(en.date),
      } as Article;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

const articleCache = new Map<ArticleLocale, Article[]>();

/** Published articles in a locale, newest first. */
export function getAllArticles(locale: string): Article[] {
  const loc = (ARTICLE_LOCALES as string[]).includes(locale) ? (locale as ArticleLocale) : "en";
  if (isDev) return buildArticles(loc);
  let articles = articleCache.get(loc);
  if (!articles) {
    articles = buildArticles(loc);
    articleCache.set(loc, articles);
  }
  return articles;
}

export const findArticle = (slug: string, locale: string) =>
  getAllArticles(locale).find((a) => a.slug === slug) ?? null;
