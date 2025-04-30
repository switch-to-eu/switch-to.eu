import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import PlausibleProvider from "next-plausible";

import {
  bricolageGrotesqueExtraBold,
  hankenGroteskSemiBold,
  hankenGroteskBold,
  hankenGroteskBoldItalic,
  hankenGroteskSemiBoldItalic,
} from "./fonts";

// Keep Geist Mono for code blocks
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "switch-to.eu - EU alternatives to global services",
  description:
    "A guide to help you switch from non-EU to EU-based digital services and products.",
  icons: {
    icon: [
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png" },
    ],
    other: [
      {
        rel: "manifest",
        url: "/favicon/site.webmanifest"
      },
    ],
  },
  openGraph: {
    images: [
      {
        url: "/images/share.png",
        width: 1200,
        height: 630,
        alt: "Switch-to.eu - EU alternatives to global services",
      },
    ],
    type: "website",
    siteName: "Switch-to.eu",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/share.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <PlausibleProvider domain="switch-to.eu">
        <body
          className={`${bricolageGrotesqueExtraBold.variable} ${hankenGroteskSemiBold.variable} ${hankenGroteskBold.variable} ${hankenGroteskBoldItalic.variable} ${hankenGroteskSemiBoldItalic.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        >
          <main className="flex-1">{children}</main>
        </body>
      </PlausibleProvider>
    </html>
  );
}
