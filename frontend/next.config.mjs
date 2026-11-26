/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Disable Next.js runtime Image Optimization API to eliminate SSRF/DoS attack surface
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const rawProxy = process.env.BACKEND_PROXY_URL?.trim().replace(/\/+$/, "");
    if (!rawProxy) {
      return [];
    }
    const backendProxyUrl = /^https?:\/\//i.test(rawProxy)
      ? rawProxy
      : `https://${rawProxy}`;
    return [
      {
        source: "/api/:path*",
        destination: `${backendProxyUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
