import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-hanken-grotesk)'],
        heading: ['var(--font-bricolage-grotesque)'],
        bold: ['var(--font-hanken-grotesk-bold)'],
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
