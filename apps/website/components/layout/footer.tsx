import { Footer as BlocksFooter } from "@switch-to-eu/blocks/components/footer";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const currentYear = new Date().getFullYear();
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
          <span className="text-lg font-black tracking-wide uppercase text-foreground">
            Switch-to.eu
          </span>
          <span className="text-sm text-muted-foreground">
            EU alternatives to global services
          </span>
        </div>
      }
      copyright={
        <>
          &copy; {currentYear} switch-to.eu — a project by{" "}
          <Link
            href="https://www.vinnie.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-500 transition-colors font-semibold underline"
          >
            Studio Vinnie
          </Link>{" "}
          &amp;{" "}
          <Link
            href="https://www.mvpeters.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-500 transition-colors underline font-semibold"
          >
            MVPeters
          </Link>
        </>
      }
    />
  );
}
