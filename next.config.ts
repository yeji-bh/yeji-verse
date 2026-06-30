import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.187"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i0.hdslb.com" },
      { protocol: "https", hostname: "i1.hdslb.com" },
      { protocol: "https", hostname: "i2.hdslb.com" },
      { protocol: "https", hostname: "**.hdslb.com" },
    ],
  },
};

export default nextConfig;
