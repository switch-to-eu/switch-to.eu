import localFont from 'next/font/local';
import { Anton } from 'next/font/google';

// Anton for hero display text (ultra-black condensed)
export const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

// BricolageGrotesque ExtraBold for titles
export const bricolageGrotesqueExtraBold = localFont({
  src: './fonts/BricolageGrotesque-ExtraBold.woff2',
  variable: '--font-bricolage-grotesque',
  display: 'swap',
});

// HankenGrotesk SemiBold for regular text
export const hankenGroteskSemiBold = localFont({
  src: './fonts/HankenGrotesk-SemiBold.woff2',
  variable: '--font-hanken-grotesk',
  display: 'swap',
});

// HankenGrotesk Bold for bold text
export const hankenGroteskBold = localFont({
  src: './fonts/HankenGrotesk-Bold.woff2',
  variable: '--font-hanken-grotesk-bold',
  display: 'swap',
});

// Bold Italic
export const hankenGroteskBoldItalic = localFont({
  src: './fonts/HankenGrotesk-BoldItalic.woff2',
  variable: '--font-hanken-grotesk-bold-italic',
  display: 'swap',
});

// SemiBold Italic
export const hankenGroteskSemiBoldItalic = localFont({
  src: './fonts/HankenGrotesk-SemiBoldItalic.woff2',
  variable: '--font-hanken-grotesk-italic',
  display: 'swap',
});

// KT Kiyosuna Sans — geometric sans-serif with smooth arching strokes
export const kiyosunaSansBold = localFont({
  src: './fonts/KiyosunaSans-Bold.woff2',
  variable: '--font-kiyosuna-sans',
  display: 'swap',
});

export const kiyosunaSansLight = localFont({
  src: './fonts/KiyosunaSans-Light.woff2',
  variable: '--font-kiyosuna-sans-light',
  display: 'swap',
});

// Bonbance — vintage serif inspired by early 20th-century French printing
export const bonbanceBoldCondensed = localFont({
  src: './fonts/Bonbance-BoldCondensed.woff2',
  variable: '--font-bonbance',
  display: 'swap',
});

/** All font CSS variable classes combined, for use in <body> or <html> className */
export const fontVariables = [
  bricolageGrotesqueExtraBold.variable,
  hankenGroteskSemiBold.variable,
  hankenGroteskBold.variable,
  hankenGroteskBoldItalic.variable,
  hankenGroteskSemiBoldItalic.variable,
  anton.variable,
  kiyosunaSansBold.variable,
  kiyosunaSansLight.variable,
  bonbanceBoldCondensed.variable,
].join(' ');
