import { describe, expect, it } from "vitest";
import { escapeHtml, html, jsonScript, raw, toMarkup } from "../src/html";

describe("html", () => {
  it("escapes interpolated strings", () => {
    const name = `<script>alert("x")</script>&'`;
    expect(toMarkup(html`<p>${name}</p>`)).toBe("<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;&#39;</p>");
  });

  it("escapes attribute breakouts", () => {
    const value = `" onmouseover="alert(1)`;
    expect(toMarkup(html`<a title="${value}">x</a>`)).toBe('<a title="&quot; onmouseover=&quot;alert(1)">x</a>');
  });

  it("does not double-escape nested templates", () => {
    const inner = html`<b>${"a&b"}</b>`;
    expect(toMarkup(html`<p>${inner}</p>`)).toBe("<p><b>a&amp;b</b></p>");
  });

  it("joins arrays and drops empty values", () => {
    expect(toMarkup(html`${["<", html`<i></i>`, null, undefined, false, 3]}`)).toBe("&lt;<i></i>3");
  });

  it("passes raw markup through unchanged", () => {
    expect(toMarkup(raw("<br>"))).toBe("<br>");
  });

  it("escapes every HTML-significant character", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("serializes JSON-LD without allowing a closing script tag", () => {
    const out = toMarkup(jsonScript({ text: "</script><script>alert(1)</script>" }));
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out)).toEqual({ text: "</script><script>alert(1)</script>" });
  });
});
