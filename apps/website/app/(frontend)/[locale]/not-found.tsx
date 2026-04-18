import type { Metadata } from "next";
import { Link } from "@switch-to-eu/i18n/navigation";

export const metadata: Metadata = {
  title: "Page not found | switch-to.eu",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function LocaleNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page not found</p>
      <Link
        href="/"
        className="text-primary underline hover:no-underline"
      >
        Go home
      </Link>
    </div>
  );
}
