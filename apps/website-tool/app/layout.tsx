import "./[locale]/styles/globals.css";

import { fontVariables } from "@switch-to-eu/ui/fonts";
import { getLocale } from "next-intl/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${fontVariables} antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
