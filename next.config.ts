import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

function remotePatternFromEnvUrl(
  envUrl: string | undefined,
  fallbackHostname: string,
) {
  if (!envUrl) {
    return { protocol: "https" as const, hostname: fallbackHostname };
  }
  try {
    const parsed = new URL(envUrl);
    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
    };
  } catch {
    console.warn(
      `Invalid URL in env var, falling back to "${fallbackHostname}": ${envUrl}`,
    );
    return { protocol: "https" as const, hostname: fallbackHostname };
  }
}

function originFromEnvUrl(envUrl: string | undefined): string[] {
  if (!envUrl) return [];
  try {
    return [new URL(envUrl).origin];
  } catch {
    console.warn(
      `Invalid NEXTAUTH_URL, skipping allowedOrigins entry: ${envUrl}`,
    );
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactProductionProfiling: true,
  webpack: (config, { isServer }) => {
    // Handle SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_EXTERNAL_SIGNUPS: process.env.EXTERNAL_SIGNUPS,
  },
  async headers() {
    return [
      {
        source: "/api/presentations/sseCapacity",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Connection",
            value: "keep-alive",
          },
          {
            key: "Content-Type",
            value: "text/event-stream",
          },
          {
            key: "X-Accel-Buffering",
            value: "no",
          },
          // Force HTTP/1.1 for SSE to avoid HTTP/2 protocol errors
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      remotePatternFromEnvUrl(process.env.PROXY_URL, "localhost"),
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.ejg.hu",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        hostname: "encrypted-tbn0.gstatic.com",
        protocol: "https",
      },
      {
        protocol: "https",
        hostname: "d3t3ozftmdmh3i.cloudfront.net",
      },
      {
        protocol: "http",
        hostname: "d3t3ozftmdmh3i.cloudfront.net",
      },
      remotePatternFromEnvUrl(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        "localhost",
      ),
      {
        hostname: "picsum.photos",
        protocol: "https",
      },
      {
        hostname: "127.0.0.1",
        protocol: "https",
      },
      {
        hostname: "localhost",
        protocol: "https",
      },
      {
        hostname: "drive.google.com",
        protocol: "https",
      },
      {
        hostname: "e5vosdo.hu",
        protocol: "https",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.IGNORE_BUILD_ERRORS === "true",
  },
  serverExternalPackages: ["pdfkit"],
  experimental: {
    serverActions: {
      allowedOrigins: originFromEnvUrl(process.env.NEXTAUTH_URL),
      bodySizeLimit: 1024 * 1024 * 10, // 10MB
    },
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "local.e5vos.hu",
  ],
};

export default withBundleAnalyzer(nextConfig);
