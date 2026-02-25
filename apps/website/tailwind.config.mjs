/** @type {import('tailwindcss').Config} */
import baseConfig from '@switch-to-eu/ui/tailwind-config';

const config = {
  presets: [baseConfig],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};

export default config;
