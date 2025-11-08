import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import createNextIntlPlugin from 'next-intl/plugin';
import './src/libs/Env';

// Development configuration with proxy for Chatlog API
const baseConfig: NextConfig = {
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Proxy API requests to Go backend
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:5030/api/v1/:path*',
      },
      {
        source: '/image/:path*',
        destination: 'http://localhost:5030/image/:path*',
      },
      {
        source: '/video/:path*',
        destination: 'http://localhost:5030/video/:path*',
      },
      {
        source: '/voice/:path*',
        destination: 'http://localhost:5030/voice/:path*',
      },
      {
        source: '/file/:path*',
        destination: 'http://localhost:5030/file/:path*',
      },
      {
        source: '/data/:path*',
        destination: 'http://localhost:5030/data/:path*',
      },
    ];
  },
  // Enable Code Inspector for Turbopack (Next.js >= 15.3.x)
  turbopack: {
    rules: codeInspectorPlugin({ bundler: 'turbopack' }),
  },
  webpack: (config, { dev }) => {
    // Add code-inspector-plugin only in development
    if (dev) {
      config.plugins.push(codeInspectorPlugin({ bundler: 'webpack' }));
    }
    return config;
  },
};

// Initialize the Next-Intl plugin
let configWithPlugins = createNextIntlPlugin('./src/libs/I18n.ts')(baseConfig);

// Conditionally enable bundle analysis
if (process.env.ANALYZE === 'true') {
  configWithPlugins = withBundleAnalyzer()(configWithPlugins);
}

// Conditionally enable Sentry configuration
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    org: process.env.SENTRY_ORGANIZATION,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    reactComponentAnnotation: {
      enabled: true,
    },
    tunnelRoute: '/monitoring',
    disableLogger: true,
    telemetry: false,
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;
