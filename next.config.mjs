/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  basePath: basePath,
  output: 'standalone',
  webpack: (config, { isServer, webpack }) => {
    // Don't bundle Node.js built-in modules in client-side code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    // Exclude test files and __tests__ directories from the build
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /pages\/__tests__/,
      })
    );
    // Exclude test files
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      use: 'ignore-loader',
    });
    return config;
  },
};

export default nextConfig;
