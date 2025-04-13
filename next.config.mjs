/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Increase timeout for development
  staticPageGenerationTimeout: 120,
  // Add proper webpack configuration
  webpack: (config, { isServer }) => {
    // Add polyfills and handle browser-only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        punycode: false,
      };
    }

    return config;
  },
  // Next.js 15 specific experimental features
  experimental: {
    // Enable server actions with increased payload limit for forms
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize for React 19 features
    optimizePackageImports: ['react', 'react-dom'],
  },
  // We don't need redirects here as middleware.ts handles authentication and redirects
  // Add CodeSandbox specific configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  // Next.js 15 uses React 19 by default, but we can specify it explicitly
  reactStrictMode: true,
  // Improved caching for better performance
  poweredByHeader: false,
};

export default nextConfig;