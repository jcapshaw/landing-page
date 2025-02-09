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
  // Add CodeSandbox specific configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
