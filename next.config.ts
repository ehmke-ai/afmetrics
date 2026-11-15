import type { NextConfig } from "next";

// Legacy URLs. These lists are frozen on purpose: they cover old links only.
// The Europe section was removed (the site is US-only), so its old URLs go to the home page.
const LEGACY_COUNTRY_SLUGS = [
  "germany",
  "austria",
  "switzerland",
  "netherlands",
  "norway",
  "denmark",
  "sweden",
  "poland",
  "italy",
  "france",
  "ireland",
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/state/:slug", destination: "/united-states/:slug", permanent: true },
      { source: "/united-states", destination: "/", permanent: true },
      { source: "/europe", destination: "/", permanent: true },
      { source: "/europe/:path*", destination: "/", permanent: true },
      { source: "/topics/:slug", destination: "/", permanent: true },
      ...LEGACY_COUNTRY_SLUGS.map((slug) => ({
        source: `/${slug}`,
        destination: "/",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
