/**
 * Response header policies. Pure functions that build header records, plus
 * `withHeaders`, which returns a new Response instead of mutating its input.
 */
export type HeaderRecord = Readonly<Record<string, string>>;

const CSP_DIRECTIVES: ReadonlyArray<readonly [string, string]> = [
  ["default-src", "'none'"],
  ["script-src", "'self'"],
  ["style-src", "'self'"],
  ["img-src", "'self' data:"],
  ["font-src", "'self'"],
  ["connect-src", "'self'"],
  ["manifest-src", "'self'"],
  ["base-uri", "'none'"],
  ["form-action", "'none'"],
  ["frame-ancestors", "'none'"],
  ["object-src", "'none'"],
  ["require-trusted-types-for", "'script'"],
  ["trusted-types", "'none'"],
  ["upgrade-insecure-requests", ""],
];

export const contentSecurityPolicy = (): string =>
  CSP_DIRECTIVES.map(([name, value]) => (value ? `${name} ${value}` : name)).join("; ");

export const securityHeaders = (): HeaderRecord => ({
  "Content-Security-Policy": contentSecurityPolicy(),
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
});

export type CacheKind = "document" | "immutable" | "static";

const CACHE_CONTROL: Readonly<Record<CacheKind, string>> = {
  // Rendered pages: always revalidate so content edits show up on the next visit.
  document: "public, max-age=0, must-revalidate",
  // Content-hashed build output under /assets/.
  immutable: "public, max-age=31536000, immutable",
  // Unhashed static files (favicon, robots.txt, ...).
  static: "public, max-age=3600",
};

export const cacheHeaders = (kind: CacheKind): HeaderRecord => ({ "Cache-Control": CACHE_CONTROL[kind] });

export const cacheKindForPath = (pathname: string): CacheKind =>
  pathname.startsWith("/assets/") ? "immutable" : "static";

export const withHeaders = (response: Response, headers: HeaderRecord): Response => {
  const next = new Response(response.body, response);
  for (const [name, value] of Object.entries(headers)) next.headers.set(name, value);
  return next;
};
