/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-hanken-grotesk)'],
        heading: ['var(--font-bricolage-grotesque)'],
        bold: ['var(--font-hanken-grotesk-bold)'],
      },
    },
  },
  plugins: [typography],
};

export default config;
