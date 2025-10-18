/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable transpilation of better-auth package
  transpilePackages: ['better-auth'],
  
  // Configure webpack to handle better-auth
  webpack: (config, { isServer }) => {
    // For server-side builds, add node externals workaround for better-auth
    if (isServer) {
      config.externals.push({
        'better-auth': 'commonjs better-auth'
      });
    }
    
    return config;
  },
  
  // Configure experimental features
  experimental: {
    // Server Actions are enabled by default in newer Next.js versions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize package imports
    optimizePackageImports: ['better-auth'],
  },
};

module.exports = nextConfig;