import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface FooterProps {
  lang: Locale;
}

export async function Footer({ lang }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const dict = await getDictionary(lang);

  return (
    <footer className="border-t bg-background py-6 md:py-10">
      <Container className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Link
            href={`/${lang}`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {dict.navigation.home}
          </Link>
          <Link
            href={`/${lang}/services`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {dict.navigation.services}
          </Link>
          <Link
            href={`/${lang}/about`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {dict.navigation.about}
          </Link>
          <Link
            href={`/${lang}/contribute`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {dict.navigation.contribute}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/switch-to.eu/switch-to.eu"
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