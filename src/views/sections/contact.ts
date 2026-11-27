import type { SiteContent } from "../../content";
import { html, type Html } from "../../html";
import { skyline } from "../skyline";

/** The closing band: the OKC skyline at golden hour behind the phone number. */
export const contact = (content: SiteContent): Html => {
  const { profile } = content;
  return html`<section class="contact" id="contact" aria-labelledby="contact-title">
  ${skyline("contact__skyline", "contain")}
  <div class="contact__inner">
    <h2 id="contact-title" class="contact__title">Tell me what's slowing your business down.</h2>
    <p class="contact__lede">Call or text, or send an email. ${profile.responseTime}</p>
    <a class="contact__phone" href="tel:${profile.phone}">${profile.phoneDisplay}</a>
    <div class="contact__actions">
      <a class="button button--primary" href="tel:${profile.phone}" data-magnetic>Call now</a>
      <a class="button button--ghost" href="sms:${profile.phone}">Text me</a>
    </div>
    <ul class="contact__more">
      <li><a href="mailto:${profile.email}">${profile.email}</a></li>
      <li><button class="link-button" type="button" data-copy="${profile.email}" data-copied="Email address copied">Copy email</button></li>
      <li><a href="/contact.vcf" download>Save my contact card</a></li>
    </ul>
  </div>
</section>`;
};
