import type { NextConfig } from "next";

/**
 * Locked down as far as a statically prerendered Next app can be: framing and
 * plugins blocked, no referrer leakage, camera, microphone and location denied.
 * Scripts and styles need `unsafe-inline` because hydration data and React's
 * inline styles are injected without a nonce, and a nonce would force every
 * page to render on request.
 */
// React's development build needs eval for its debugging tools; production doesn't.
const scriptSrc = process.env.NODE_ENV === "production" ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
];

/**
 * There is one design, `depth`. `@/design/entry` and `@/design/fonts` resolve
 * to it, so the build carries only the depth design's components, CSS and
 * webfonts.
 */
const design = "depth";

const nextConfig: NextConfig = {
  experimental: {
    // Each design is its own root layout, so unmatched addresses need a 404
    // that isn't rendered inside any one of them.
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    resolveAlias: {
      "@/design/entry": `./src/design/entry.${design}.tsx`,
      "@/design/fonts": `./src/design/fonts.${design}.ts`,
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
