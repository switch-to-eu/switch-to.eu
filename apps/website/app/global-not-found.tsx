import "./(frontend)/globals.css";

import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "@switch-to-eu/ui/fonts";

export const metadata: Metadata = {
  title: "Page not found | switch-to.eu",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

const FOCUS =
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

/**
 * The 404 page for every unknown path. It is static and outside a locale, so it
 * cannot know the reader's language. It therefore speaks both.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body className="antialiased min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center text-[#1a1a1a]">
        <h1 className="font-heading text-brand-green text-4xl sm:text-5xl mb-2">
          Page not found
        </h1>
        <p lang="nl" className="font-heading text-brand-green text-2xl sm:text-3xl mb-8">
          Pagina niet gevonden
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/en"
            className={`inline-block rounded-full bg-brand-green px-6 py-3 font-semibold text-white no-underline hover:opacity-90 transition-opacity ${FOCUS}`}
          >
            Go to the homepage
          </Link>
          <Link
            href="/nl"
            lang="nl"
            className={`inline-block rounded-full border border-brand-green px-6 py-3 font-semibold text-brand-green no-underline hover:bg-brand-green/10 transition-colors ${FOCUS}`}
          >
            Naar de homepage
          </Link>
        </div>
      </body>
    </html>
  );
}
