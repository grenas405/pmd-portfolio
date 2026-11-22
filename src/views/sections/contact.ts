import type { SiteContent } from "../../content";
import { html, type Html } from "../../html";

/** The closing band: the prairie returns behind the phone number. */
export const contact = (content: SiteContent): Html => {
  const { profile } = content;
  return html`<section class="contact" id="contact" aria-labelledby="contact-title">
  <canvas class="prairie prairie--band" data-prairie="band" aria-hidden="true"></canvas>
  <div class="contact__inner">
    <p class="path" aria-hidden="true">${content.terminal.user}@${content.terminal.host}:~$ call pedro</p>
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
