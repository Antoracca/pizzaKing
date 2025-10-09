/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // Required for static export
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Pizza King',
  },
  // Transpile packages from monorepo
  transpilePackages: ['@pizza-king/shared', '@pizza-king/firebase-config'],

  // Output for Firebase Hosting (commented out for development)
  // output: 'export',
  // distDir: 'out',
};

module.exports = nextConfig;
