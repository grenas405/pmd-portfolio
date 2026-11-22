import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { content } from "../src/content";

const ORIGIN = "https://pedromdominguez.dev";
const get = (path: string, init?: RequestInit) => exports.default.fetch(new Request(ORIGIN + path, init));

const expectSecurityHeaders = (response: Response) => {
  expect(response.headers.get("Content-Security-Policy")).toContain("default-src 'none'");
  expect(response.headers.get("Strict-Transport-Security")).toContain("max-age=");
  expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
};

describe("worker", () => {
  it("serves the home page", async () => {
    const response = await get("/");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expectSecurityHeaders(response);
    expect(await response.text()).toContain(content.profile.name);
  });

  it("answers HEAD with headers and no body", async () => {
    const response = await get("/", { method: "HEAD" });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
  });

  it("serves every case study", async () => {
    for (const study of content.caseStudies) {
      const response = await get(`/work/${study.slug}`);
      expect(response.status).toBe(200);
      await response.text();
    }
  });

  it("returns a 404 page for unknown projects and files", async () => {
    for (const path of ["/work/does-not-exist", "/nope.html"]) {
      const response = await get(path);
      expect(response.status).toBe(404);
      expectSecurityHeaders(response);
      expect(await response.text()).toContain("That page isn&#39;t here.");
    }
  });

  it("rejects other methods with 405 and an Allow header", async () => {
    const response = await get("/", { method: "POST", body: "x" });
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, HEAD");
    await response.text();
  });

  it("redirects www to the bare domain", async () => {
    const response = await exports.default.fetch(new Request("https://www.pedromdominguez.dev/work/x"), { redirect: "manual" } as RequestInit);
    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(`${ORIGIN}/work/x`);
  });

  it("serves the vCard as a download", async () => {
    const response = await get("/contact.vcf");
    expect(response.headers.get("Content-Type")).toBe("text/vcard; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toContain("attachment");
    expect(await response.text()).toContain("BEGIN:VCARD");
  });

  it("serves static assets with security and cache headers", async () => {
    const response = await get("/favicon.svg");
    expect(response.status).toBe(200);
    expectSecurityHeaders(response);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
    await response.text();
  });

  it("marks hashed build output as immutable", async () => {
    const home = await (await get("/")).text();
    const script = home.match(/src="(\/assets\/app-[^"]+\.js)"/)?.[1];
    expect(script).toBeDefined();
    const response = await get(script!);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("immutable");
    await response.text();
  });
});
