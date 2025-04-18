import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import {
  bricolageGrotesqueExtraBold,
  hankenGroteskSemiBold,
  hankenGroteskBold,
  hankenGroteskBoldItalic,
  hankenGroteskSemiBoldItalic
} from "./fonts";

// Keep Geist Mono for code blocks
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "switch-to.eu - EU alternatives to global services",
  description: "A guide to help you switch from non-EU to EU-based digital services and products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD for website structured data
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Switch-to.EU",
    "url": "https://switch-to.eu",
    "description": "A guide to help you switch from non-EU to EU-based digital services and products.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://switch-to.eu/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${bricolageGrotesqueExtraBold.variable} ${hankenGroteskSemiBold.variable} ${hankenGroteskBold.variable} ${hankenGroteskBoldItalic.variable} ${hankenGroteskSemiBoldItalic.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
