import localFont from 'next/font/local';

// BricolageGrotesque ExtraBold for titles
export const bricolageGrotesqueExtraBold = localFont({
  src: '../public/fonts/BricolageGrotesque-ExtraBold.woff2',
  variable: '--font-bricolage-grotesque',
  display: 'swap',
});

// HankenGrotesk SemiBold for regular text
export const hankenGroteskSemiBold = localFont({
  src: '../public/fonts/HankenGrotesk-SemiBold.woff2',
  variable: '--font-hanken-grotesk',
  display: 'swap',
});

// HankenGrotesk Bold for bold text
export const hankenGroteskBold = localFont({
  src: '../public/fonts/HankenGrotesk-Bold.woff2',
  variable: '--font-hanken-grotesk-bold',
  display: 'swap',
});

// Bold Italic
export const hankenGroteskBoldItalic = localFont({
  src: '../public/fonts/HankenGrotesk-BoldItalic.woff2',
  variable: '--font-hanken-grotesk-bold-italic',
  display: 'swap',
});

// SemiBold Italic
export const hankenGroteskSemiBoldItalic = localFont({
  src: '../public/fonts/HankenGrotesk-SemiBoldItalic.woff2',
  variable: '--font-hanken-grotesk-italic',
  display: 'swap',
});