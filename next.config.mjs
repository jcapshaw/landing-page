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
};

export default nextConfig;
