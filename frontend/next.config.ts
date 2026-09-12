import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // ALLOW CLOUDINARY IMAGES!
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https', // 👈 ADDED: Google OAuth profile pictures
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;