import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations("navigation");

  return (
    <footer className="border-t bg-background py-6 md:py-10">
      <Container className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Link
            href={`/`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t("home")}
          </Link>
          <Link
            href={`/about`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t("about")}
          </Link>
          <Link
            href={`/contribute`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t("contribute")}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} switch-to.eu a project by{" "}
            <Link
              href="https://www.vinnie.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 transition-colors font-semibold underline"
            >
              Studio Vinnie
            </Link>{" "}
            and{" "}
            <Link
              href="https://www.mvpeters.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 transition-colors underline font-semibold"
            >
              MVPeters
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
