import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/rewrite": ["./clint-prompt.md"],
  },
  devIndicators: false,
};

export default nextConfig;
