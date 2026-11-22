/**
 * Worker entry point. The only module with side effects: it reads the request,
 * calls pure route/render functions, fetches static assets, and logs errors.
 */
import { assets } from "./assets.gen";
import { content } from "./content";
import { describeError } from "./errors";
import { cacheKindForPath } from "./headers";
import { assetResponse, htmlResponse, redirectResponse, textResponse } from "./respond";
import { ALLOWED_METHODS, route } from "./router";
import { sitemapXml } from "./seo";
import { themeFromCookie } from "./theme";
import { vcard } from "./vcard";
import { caseStudyPage, errorPage, homePage } from "./views/pages";
import type { PageContext } from "./views/types";

const pageContext = (request: Request): PageContext => ({
  content,
  assets,
  theme: themeFromCookie(request.headers.get("Cookie")),
  year: new Date().getUTCFullYear(),
});

const serveAsset = async (request: Request, env: Env, ctx: PageContext): Promise<Response> => {
  const url = new URL(request.url);
  const response = await env.ASSETS.fetch(request);
  if (response.status === 404) return htmlResponse(errorPage(ctx, 404, url.pathname), request.method, 404);
  return assetResponse(response, cacheKindForPath(url.pathname));
};

export const handle = async (request: Request, env: Env): Promise<Response> => {
  const url = new URL(request.url);
  const ctx = pageContext(request);
  const target = route(request.method, url);
  const { method } = request;

  switch (target.kind) {
    case "home":
      return htmlResponse(homePage(ctx), method);
    case "caseStudy": {
      const page = caseStudyPage(ctx, target.slug);
      return page.ok ? htmlResponse(page.value, method) : htmlResponse(errorPage(ctx, 404, page.error.path), method, 404);
    }
    case "vcard":
      return textResponse(vcard(content.profile), method, "text/vcard; charset=utf-8", {
        "Content-Disposition": 'attachment; filename="pedro-m-dominguez.vcf"',
      });
    case "sitemap":
      return textResponse(sitemapXml(content), method, "application/xml; charset=utf-8");
    case "redirect":
      return redirectResponse(new URL(target.location, url).toString());
    case "methodNotAllowed":
      return htmlResponse(errorPage(ctx, 405, url.pathname), "GET", 405, { Allow: ALLOWED_METHODS.join(", ") });
    case "notFound":
      return htmlResponse(errorPage(ctx, 404, target.path), method, 404);
    case "asset":
      return serveAsset(request, env, ctx);
  }
};

export default {
  async fetch(request, env): Promise<Response> {
    try {
      return await handle(request, env);
    } catch (cause) {
      // Log what failed and where, never request bodies, cookies, or stack traces to the client.
      console.error(JSON.stringify({ level: "error", message: "Unhandled request error", path: new URL(request.url).pathname, error: describeError(cause) }));
      return htmlResponse(errorPage(pageContext(request), 500, new URL(request.url).pathname), request.method, 500);
    }
  },
} satisfies ExportedHandler<Env>;
