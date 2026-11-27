import type { Faq, SiteContent } from "../../content";
import { html, type Html } from "../../html";
import { sectionHeader } from "./shared";

const faq = (item: Faq): Html => html`<details class="faq" name="faq">
  <summary class="faq__question">${item.question}<span class="faq__chevron" aria-hidden="true"></span></summary>
  <div class="faq__answer"><p>${item.answer}</p></div>
</details>`;

export const faqs = (content: SiteContent): Html => html`<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="faq-layout">
    ${sectionHeader("faq", "Questions owners ask", html`<p>Don't see yours? <a href="tel:${content.profile.phone}">Call me</a> and ask.</p>`)}
    <div class="faqs">${content.faqs.map(faq)}</div>
  </div>
</section>`;
