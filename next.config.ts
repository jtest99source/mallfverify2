import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async redirects() {
    return [
      // Category change: bucca was indexed under /cafes/ but is a restaurant
      {
        source: "/:locale/cafes/bucca-food-and-drinks-puerto-pollensa",
        destination: "/:locale/restaurants/bucca-food-and-drinks-puerto-pollensa",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
