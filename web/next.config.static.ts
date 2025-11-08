import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import './src/libs/Env';

// Static export configuration for Go backend integration
const baseConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Disable features that don't work with static export
  trailingSlash: true,
};

// Initialize the Next-Intl plugin
const nextConfig = createNextIntlPlugin('./src/libs/I18n.ts')(baseConfig);

export default nextConfig;
