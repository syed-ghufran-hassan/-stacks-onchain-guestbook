import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', //  Forces Next.js to build static HTML/CSS/JS
  basePath: '/-stacks-onchain-guestbook', //  Required for GitHub Pages routing
  images: {
    unoptimized: true, //  Required for static exports
  },
};

export default nextConfig;
