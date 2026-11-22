import { describe, expect, it } from "vitest";
import { isValidSlug, route } from "../src/router";

const at = (path: string, origin = "https://pedromdominguez.dev") => new URL(path, origin);

describe("route", () => {
  it("routes the home page", () => {
    expect(route("GET", at("/"))).toEqual({ kind: "home" });
  });

  it("routes case studies by slug", () => {
    expect(route("GET", at("/work/booking-app"))).toEqual({ kind: "caseStudy", slug: "booking-app" });
  });

  it("rejects malformed slugs without touching content", () => {
    for (const path of ["/work/", "/work/UPPER", "/work/a..b", "/work/a/b", "/work/-lead", `/work/${"a".repeat(65)}`]) {
      expect(route("GET", at(path)).kind).toBe("notFound");
    }
  });

  it("strips a trailing slash from case study URLs", () => {
    expect(route("GET", at("/work/booking-app/"))).toEqual({ kind: "redirect", location: "/work/booking-app" });
  });

  it("routes the vCard and sitemap", () => {
    expect(route("GET", at("/contact.vcf"))).toEqual({ kind: "vcard" });
    expect(route("HEAD", at("/sitemap.xml"))).toEqual({ kind: "sitemap" });
  });

  it("sends everything else to static assets", () => {
    expect(route("GET", at("/favicon.svg"))).toEqual({ kind: "asset" });
  });

  it("only allows GET and HEAD", () => {
    for (const method of ["POST", "PUT", "DELETE", "PATCH", "OPTIONS"]) {
      expect(route(method, at("/"))).toEqual({ kind: "methodNotAllowed", method });
    }
  });

  it("redirects www to the bare domain over https", () => {
    expect(route("GET", at("/work/x?a=1", "https://www.pedromdominguez.dev"))).toEqual({
      kind: "redirect",
      location: "https://pedromdominguez.dev/work/x?a=1",
    });
  });

  it("leaves the bare domain and local development hosts alone", () => {
    expect(route("GET", at("/", "http://pedromdominguez.dev"))).toEqual({ kind: "home" });
    expect(route("GET", at("/", "http://localhost:8787"))).toEqual({ kind: "home" });
  });
});

describe("isValidSlug", () => {
  it("accepts lowercase kebab-case", () => {
    expect(isValidSlug("online-ordering-for-a-family-restaurant")).toBe(true);
  });
});
