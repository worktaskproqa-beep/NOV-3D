import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [384, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  async redirects() {
    // The single "Everyday Hoodie" listing became four colourway listings.
    return [{ source: "/shop/everyday-hoodie", destination: "/shop/skyline-hoodie-burgundy", permanent: true }];
  },
};

export default nextConfig;
