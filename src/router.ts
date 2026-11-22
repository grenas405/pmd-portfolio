/** Maps a request's method and URL to a route. Pure: no I/O, no globals. */
export type Route =
  | { readonly kind: "home" }
  | { readonly kind: "caseStudy"; readonly slug: string }
  | { readonly kind: "vcard" }
  | { readonly kind: "sitemap" }
  | { readonly kind: "redirect"; readonly location: string }
  | { readonly kind: "methodNotAllowed"; readonly method: string }
  | { readonly kind: "notFound"; readonly path: string }
  | { readonly kind: "asset" };

export const ALLOWED_METHODS = ["GET", "HEAD"] as const;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 64;

export const isValidSlug = (slug: string): boolean => slug.length <= MAX_SLUG_LENGTH && SLUG.test(slug);

/**
 * The canonical host is the bare domain. (http → https is enforced by the zone's
 * "Always Use HTTPS" setting plus HSTS, so it also works under `wrangler dev`.)
 */
const canonicalRedirect = (url: URL): string | null =>
  url.hostname.startsWith("www.") ? `https://${url.hostname.slice(4)}${url.pathname}${url.search}` : null;

const routePath = (pathname: string): Route => {
  if (pathname === "/") return { kind: "home" };
  if (pathname === "/contact.vcf") return { kind: "vcard" };
  if (pathname === "/sitemap.xml") return { kind: "sitemap" };
  if (pathname.startsWith("/work/")) {
    const rest = pathname.slice("/work/".length);
    if (rest.endsWith("/") && rest.length > 1) return { kind: "redirect", location: `/work/${rest.slice(0, -1)}` };
    return isValidSlug(rest) ? { kind: "caseStudy", slug: rest } : { kind: "notFound", path: pathname };
  }
  return { kind: "asset" };
};

export const route = (method: string, url: URL): Route => {
  if (!(ALLOWED_METHODS as readonly string[]).includes(method)) return { kind: "methodNotAllowed", method };
  const location = canonicalRedirect(url);
  return location ? { kind: "redirect", location } : routePath(url.pathname);
};
