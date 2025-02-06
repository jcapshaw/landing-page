/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
      };
    }
    return config;
  },
  output: 'standalone',
  // Enable CSS support
  cssModules: true,
  // Configure CSS handling
  webpack5: true,
};

export default nextConfig;
