import type { NextConfig } from "next";

const r2PublicUrl = (() => {
  try {
    return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL) : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2PublicUrl
      ? [{ protocol: r2PublicUrl.protocol === "http:" ? "http" : "https", hostname: r2PublicUrl.hostname, port: r2PublicUrl.port, pathname: "/**" }]
      : [],
  },
};

export default nextConfig;
