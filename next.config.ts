import type { NextConfig } from "next";

const resolvedApiBaseUrl =
  (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTPUBLICBASEURL || "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: resolvedApiBaseUrl,
    NEXTPUBLICBASEURL: resolvedApiBaseUrl,
  },
};

export default nextConfig;
