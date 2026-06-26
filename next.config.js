/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['stripe'],
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
