import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  turbopack: {
    // 複数の package-lock.json を誤検知しないようルートを明示
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
