import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite loads a WASM artifact at runtime. Keeping it external prevents
  // Turbopack/webpack from bundling the WASM fs path, which otherwise throws
  // "The path argument must be of type string ... Received an instance of URL".
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
