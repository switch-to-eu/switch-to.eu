import { redirect } from "next/navigation";
import { mainSiteUrl } from "@switch-to-eu/blocks/data/main-site";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(mainSiteUrl(locale, "/privacy"));
}
