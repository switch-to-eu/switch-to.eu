import localFont from 'next/font/local';

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

/** All font CSS variable classes combined, for use in <body> or <html> className */
export const fontVariables = [
  bricolageGrotesqueExtraBold.variable,
  hankenGroteskSemiBold.variable,
  hankenGroteskBold.variable,
  hankenGroteskBoldItalic.variable,
  hankenGroteskSemiBoldItalic.variable,
].join(' ');
