import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@switch-to-eu/ui', '@switch-to-eu/trpc', '@switch-to-eu/i18n', '@switch-to-eu/blocks'],
};

export default withNextIntl(nextConfig);
