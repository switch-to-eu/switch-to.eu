/**
 * Preview and development deployments on Vercel (dev.switch-to.eu and the
 * *.vercel.app preview URLs) must stay out of search results. Production, and
 * builds outside Vercel, stay indexable: a missing VERCEL_ENV must never
 * de-index the live site.
 */
export const isNonProductionDeploy =
  process.env.VERCEL_ENV === "preview" ||
  process.env.VERCEL_ENV === "development";
