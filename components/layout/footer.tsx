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
            href={`/services`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t("services")}
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
          <Link
            href="https://github.com/switch-to-eu/switch-to.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            GitHub
          </Link>
          <p className="text-sm text-muted-foreground">
            © {currentYear} switch-to.eu
          </p>
        </div>
      </Container>
    </footer>
  );
}
