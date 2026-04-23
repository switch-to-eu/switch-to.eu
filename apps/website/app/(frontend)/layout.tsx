import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { fontVariables } from "@switch-to-eu/ui/fonts";
import { getLocale } from "next-intl/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={fontVariables}>
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
