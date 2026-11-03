import { createRobots } from "@switch-to-eu/i18n/seo";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://quiz.switch-to.eu";

export default function robots() {
  return createRobots(baseUrl, ["/*/quiz/"]);
}
