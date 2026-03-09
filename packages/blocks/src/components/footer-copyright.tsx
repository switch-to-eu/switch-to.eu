"use client";

import { useTranslations } from "next-intl";

const linkClassName =
  "text-orange-400 hover:text-orange-300 transition-colors font-semibold underline";

export function FooterCopyright() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <p className="text-xs text-white/40">
      &copy;{" "}
      {t.rich("copyright", {
        year: String(currentYear),
        link: (chunks) => (
          <a
            href="https://switch-to.eu"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {chunks}
          </a>
        ),
      })}{" "}
      <a
        href="https://www.vinnie.studio"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        Studio Vinnie
      </a>
      {" & "}
      <a
        href="https://www.mvpeters.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        MVPeters
      </a>
    </p>
  );
}
