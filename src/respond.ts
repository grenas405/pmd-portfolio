/** Small Response builders shared by the Worker entry point. Pure. */
import { cacheHeaders, securityHeaders, withHeaders, type CacheKind, type HeaderRecord } from "./headers";
import { toMarkup, type Html } from "./html";

const finalize = (response: Response, extra: HeaderRecord = {}): Response =>
  withHeaders(response, { ...securityHeaders(), ...extra });

/** HEAD requests get the same headers with no body. */
const body = (text: string, method: string): string | null => (method === "HEAD" ? null : text);

export const htmlResponse = (page: Html, method: string, status = 200, extra: HeaderRecord = {}): Response =>
  finalize(
    new Response(body(toMarkup(page), method), {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8", Vary: "Cookie" },
    }),
    { ...cacheHeaders("document"), ...extra },
  );

export const textResponse = (text: string, method: string, contentType: string, extra: HeaderRecord = {}): Response =>
  finalize(new Response(body(text, method), { headers: { "Content-Type": contentType } }), {
    ...cacheHeaders("static"),
    ...extra,
  });

export const redirectResponse = (location: string): Response =>
  finalize(new Response(null, { status: 301, headers: { Location: location } }), cacheHeaders("static"));

export const assetResponse = (response: Response, kind: CacheKind): Response =>
  finalize(response, cacheHeaders(kind));
