import Link from "next/link";
import { Container } from "@/components/layout/container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background py-6 md:py-10">
      <Container className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/guides"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Guides
          </Link>
          <Link
            href="/services"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Services
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            About
          </Link>
          <Link
            href="/contribute"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Contribute
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