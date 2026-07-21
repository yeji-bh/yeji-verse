import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @libsql/client/web needs workerd-specific transitive deps copied into the bundle.
  // See https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ["@libsql/isomorphic-ws", "@libsql/isomorphic-fetch"],
  allowedDevOrigins: ["192.168.100.187", "192.168.0.35"],
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
