import "./[locale]/styles/globals.css";

import { Geist } from "next/font/google";
import { getLocale } from "next-intl/server";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
