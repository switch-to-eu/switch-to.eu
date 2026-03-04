import { Footer as BlocksFooter } from "@switch-to-eu/blocks/components/footer";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("navigation");
  const footerT = await getTranslations("footer");
  const toolsT = await getTranslations("footerTools");

  return (
    <BlocksFooter
      toolsSectionTitle={toolsT("sectionTitle")}
      linksSectionTitle={toolsT("linksTitle")}
      links={[
        {
          label: t("about"),
          href: `/about`,
        },
        {
          label: t("contribute"),
          href: `/contribute`,
        },
        {
          label: footerT("privacyPolicy"),
          href: `/privacy`,
        },
        {
          label: footerT("termsOfService"),
          href: `/terms`,
        },
      ]}
      branding={
        <div className="flex flex-col gap-1">
          <span style={{ fontFamily: "var(--font-bonbance)", fontWeight: 400 }} className="text-2xl tracking-wide text-white">
            Switch-to.eu
          </span>
          <span className="text-sm text-white/50">
            EU alternatives to global services
          </span>
        </div>
      }
    />
  );
}
