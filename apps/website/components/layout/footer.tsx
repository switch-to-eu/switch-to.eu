import { Footer as BlocksFooter } from "@switch-to-eu/blocks/components/footer";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations("navigation");
  const footerT = await getTranslations("footer");

  return (
    <BlocksFooter
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
      copyright={
        <>
          © {currentYear} switch-to.eu a project by{" "}
          <Link
            href="https://www.vinnie.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-yellow hover:text-brand-yellow/80 transition-colors font-semibold"
          >
            Studio Vinnie
          </Link>{" "}
          and{" "}
          <Link
            href="https://www.mvpeters.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-yellow hover:text-brand-yellow/80 transition-colors font-semibold"
          >
            MVPeters
          </Link>
        </>
      }
    />
  );
}
