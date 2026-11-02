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
  description: string;
  icon?: string | null;
  /** Markdown */
  content?: string | null;
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
