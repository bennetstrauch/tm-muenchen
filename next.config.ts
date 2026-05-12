import type { NextConfig } from "next";

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

export default nextConfig;
