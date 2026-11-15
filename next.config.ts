import type { NextConfig } from "next";

// Legacy URLs from before Europe moved under /europe and the US became the home page.
// These lists are frozen on purpose: they cover old links only, so new countries or topics
// never need entries here.
const LEGACY_EUROPE_TOPICS = ["map", "native-share", "anti-immigration", "market-cap", "median-age"];
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
      { source: "/topics/native-ranking", destination: "/europe/topics/native-share", permanent: true },
      { source: "/topics/native-trend", destination: "/europe/topics/native-share", permanent: true },
      { source: "/state/:slug", destination: "/united-states/:slug", permanent: true },
      { source: "/united-states", destination: "/", permanent: true },
      ...LEGACY_EUROPE_TOPICS.map((slug) => ({
        source: `/topics/${slug}`,
        destination: `/europe/topics/${slug}`,
        permanent: true,
      })),
      ...LEGACY_COUNTRY_SLUGS.map((slug) => ({
        source: `/${slug}`,
        destination: `/europe/${slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
