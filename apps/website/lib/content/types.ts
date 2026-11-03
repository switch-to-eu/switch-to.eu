/**
 * Content types for the markdown files in `/content`.
 *
 * Every document is read from `content/<collection>/<slug>/en.md`, with
 * `nl.md` overriding localized fields. Relations are stored as slugs in the
 * files and resolved to objects by the loader. Rich text is a markdown string.
 */

export type Locale = "en" | "nl";

export type Region = "eu" | "non-eu" | "eu-friendly";

export type PipelineStatus =
  | "not-started"
  | "in-progress"
  | "written"
  | "humanized"
  | "seo-checked"
  | "translated"
  | "complete";

/** SEO + workflow fields shared by every collection. */
export interface SeoFields {
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  seoScore?: number | null;
  seoNotes?: string | null;
  lastSeoReviewAt?: string | null;
}

interface BaseDoc extends SeoFields {
  /** Same as `slug`. Kept so list keys and comparisons read naturally. */
  id: string;
  slug: string;
  /** `draft: true` hides the document from production builds. */
  draft?: boolean;
  /** ISO date (YYYY-MM-DD). */
  updatedAt: string;
}

export interface Category extends BaseDoc {
  title: string;
  /** Short name for links like "See all in AI". Falls back to title. */
  shortTitle: string;
  description: string;
  icon?: string | null;
  /** Markdown. On a buyer's-guide category this is the "How to choose" text. */
  content?: string | null;
  /** Editorial picks, one per need. Present only on buyer's-guide categories. */
  picks?: CategoryPick[];
  /** Category-specific comparison columns, read from each service's `specs`. */
  compare?: CompareColumn[];
}

export interface CategoryPick {
  /** The need this pick answers, e.g. "Best free plan". */
  label: string;
  /** Service slug. */
  service: string;
  reason: string;
  tradeoff: string;
}

export interface CompareColumn {
  /** Key into `Service.specs`. */
  key: string;
  label: string;
}

export interface PricingTier {
  name: string;
  price: string;
  billingNote?: string | null;
  features?: string[];
}

export interface Faq {
  question: string;
  /** Markdown */
  answer: string;
}

export interface SourceUrl {
  url: string;
  label?: string | null;
  /** ISO date the page was last read (evidence rules). */
  checkedAt?: string | null;
}

export interface UserSentiment {
  positive?: number | null;
  negative?: number | null;
  mixed?: number | null;
  summary?: string | null;
  lastUpdated?: string | null;
}

export interface RedditMention {
  subreddit: string;
  postUrl: string;
  postTitle?: string | null;
  sentiment?: "positive" | "negative" | "mixed" | "neutral" | null;
  snippet?: string | null;
  date?: string | null;
}

export interface NewsItem {
  source: string;
  url: string;
  title?: string | null;
  date?: string | null;
  summary?: string | null;
}

export interface Service extends BaseDoc {
  name: string;
  region: Region;
  category: Category;
  featured?: boolean;
  contentPipelineStatus?: PipelineStatus | null;
  location: string;
  freeOption?: boolean;
  startingPrice?: string | null;
  description: string;
  url: string;
  affiliateUrl?: string | null;
  /** Public path or absolute URL. */
  screenshot?: string | null;
  logo?: string | null;
  features?: string[];
  /** Short comparison values keyed by the category's `compare` columns. */
  specs?: Record<string, string>;
  pricingTiers?: PricingTier[];
  tags?: string[];
  angle?: string | null;
  /** Markdown */
  content?: string | null;

  // Non-EU page
  issues?: string[];
  recommendedAlternative?: Service | null;
  oneLineProblem?: string | null;
  whatYoudGain?: string[];
  whatYoudLose?: string[];
  faqs?: Faq[];

  // Research
  researchStatus?: "not-started" | "in-progress" | "needs-update" | "complete" | null;
  lastResearchedAt?: string | null;
  gdprCompliance?: "compliant" | "partial" | "non-compliant" | "unknown" | null;
  gdprNotes?: string | null;
  privacyPolicyUrl?: string | null;
  pricingDetails?: string | null;
  pricingUrl?: string | null;
  headquarters?: string | null;
  parentCompany?: string | null;
  foundedYear?: number | null;
  employeeCount?: string | null;
  dataStorageLocations?: string[];
  certifications?: string[];
  openSource?: boolean;
  sourceCodeUrl?: string | null;
  /** Markdown */
  researchNotes?: string | null;
  sourceUrls?: SourceUrl[];
  userSentiment?: UserSentiment | null;
  redditMentions?: RedditMention[];
  recentNews?: NewsItem[];
}

export interface GuideStep {
  /** Anchor id derived from the title, unique within the guide. */
  id: string;
  title: string;
  /** Markdown */
  content: string;
  /** Absolute URL or public path. */
  video?: string | null;
  videoOrientation?: "landscape" | "portrait" | null;
  complete?: boolean;
}

export interface Guide extends BaseDoc {
  title: string;
  description: string;
  category: Category;
  sourceService: Service | null;
  targetService: Service | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  timeRequired: string;
  date?: string | null;
  author?: string | null;
  featuredOnHomepage?: boolean;
  contentPipelineStatus?: PipelineStatus | null;
  missingFeatures?: string[];
  /** Markdown sections */
  intro?: string | null;
  beforeYouStart?: string | null;
  steps: GuideStep[];
  troubleshooting?: string | null;
  outro?: string | null;
}

export interface LandingPage extends BaseDoc {
  title: string;
  description: string;
  category?: Category | null;
  recommendedServices: Service[];
  relatedService?: Service | null;
  /** Markdown */
  content?: string | null;
}

export interface Page extends BaseDoc {
  title: string;
  /** Markdown */
  content?: string | null;
}

export type ArticleLocale = "en" | "nl" | "fr";

export interface ArticleSource {
  title: string;
  publisher: string;
  url: string;
  date?: string | null;
}

/**
 * A news article in one locale. Unlike other collections, each locale file is
 * a complete translation with its own `draft` flag; a missing or draft locale
 * file means the article doesn't exist in that language.
 */
export interface Article extends SeoFields {
  id: string;
  slug: string;
  locale: ArticleLocale;
  /** Locales in which this article is published (or visible in dev). */
  locales: ArticleLocale[];
  draft?: boolean;
  /**
   * Placeholder content for layout testing. Shown with a visible notice,
   * never indexed, and left out of the sitemap, RSS feed and knowledge graph.
   */
  sample?: boolean;
  /** Header photo under public/, e.g. /images/articles/<slug>.jpg. */
  image?: string | null;
  imageAlt?: string;
  /** Visible credit line, e.g. "Photo: Tony Webster, CC BY 2.0, via Wikimedia Commons". */
  imageCredit?: string;
  /** Source page of the photo (licence and author). */
  imageCreditUrl?: string;
  title: string;
  description: string;
  /** Publication date, YYYY-MM-DD. */
  date: string;
  type: "news" | "analysis";
  /** knowledge/stories slug (not resolved: knowledge isn't shipped). */
  story?: string | null;
  entities: string[];
  services: Service[];
  categories: Category[];
  guides: Guide[];
  sources: ArticleSource[];
  author: string;
  /** Markdown */
  content: string;
  updatedAt: string;
}
