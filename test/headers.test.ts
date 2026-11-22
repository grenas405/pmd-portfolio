import { describe, expect, it } from "vitest";
import { cacheKindForPath, contentSecurityPolicy, securityHeaders, withHeaders } from "../src/headers";

describe("security headers", () => {
  it("builds a strict CSP with Trusted Types and no unsafe sources", () => {
    const csp = contentSecurityPolicy();
    for (const directive of [
      "default-src 'none'",
      "script-src 'self'",
      "object-src 'none'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
      "require-trusted-types-for 'script'",
    ]) {
      expect(csp).toContain(directive);
    }
    expect(csp).not.toContain("unsafe");
  });

  it("includes the OWASP-recommended companion headers", () => {
    const headers = securityHeaders();
    expect(Object.keys(headers)).toEqual(
      expect.arrayContaining([
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "Cross-Origin-Opener-Policy",
        "Cross-Origin-Resource-Policy",
      ]),
    );
  });
});

describe("withHeaders", () => {
  it("returns a new response and leaves the original untouched", () => {
    const original = new Response("hi", { headers: { "X-Test": "1" } });
    const next = withHeaders(original, { "X-Added": "yes" });
    expect(next.headers.get("X-Added")).toBe("yes");
    expect(next.headers.get("X-Test")).toBe("1");
    expect(original.headers.has("X-Added")).toBe(false);
  });
});

describe("cacheKindForPath", () => {
  it("treats hashed build output as immutable", () => {
    expect(cacheKindForPath("/assets/app-ABC123.js")).toBe("immutable");
    expect(cacheKindForPath("/favicon.svg")).toBe("static");
  });
});
