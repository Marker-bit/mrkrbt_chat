import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://izd1mndzyics5xju.public.blob.vercel-storage.com/**'),
    ],
  },
};

export default nextConfig;
