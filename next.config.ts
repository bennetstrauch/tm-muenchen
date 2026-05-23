import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tm-de.s3.amazonaws.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/depression",
        destination: "/erschoepfung",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
