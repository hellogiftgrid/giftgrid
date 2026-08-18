/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'special-dollop-xr9j569j757pf6pp7-3000.app.github.dev',
      ],
    },
  },
};

module.exports = nextConfig;
