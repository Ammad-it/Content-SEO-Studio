import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  allowedDevOrigins: ["192.168.0.129"],
};

export default nextConfig;
