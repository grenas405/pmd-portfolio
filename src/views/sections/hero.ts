import type { SiteContent } from "../../content";
import { html, type Html } from "../../html";
import { icon } from "../icons";

const prompt = (content: SiteContent): Html =>
  html`<span class="term__prompt" aria-hidden="true">${content.terminal.user}@${content.terminal.host}:~$</span>`;

/** A command line. The command text is real text; the client types it out. */
const command = (content: SiteContent, text: string): Html =>
  html`<p class="term__line">${prompt(content)} <span class="term__cmd" data-type>${text}</span></p>`;

export const hero = (content: SiteContent): Html => {
  const { profile, terminal } = content;
  return html`<section class="hero" aria-labelledby="hero-title">
  <canvas class="prairie" data-prairie="hero" aria-hidden="true"></canvas>
  <div class="hero__inner">
    <div class="term" data-term>
      <div class="term__bar">
        <span class="term__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="term__title">${terminal.user}@${terminal.host}: ~</span>
        <span class="term__tabs" aria-hidden="true"><span class="is-on">1:web</span><span>2:api</span><span>3:android</span></span>
        <span class="term__clock" aria-hidden="true" data-clock>OKC</span>
        <button class="term__pause" type="button" data-motion-toggle aria-pressed="false" hidden>
          <span class="term__pause-icon" aria-hidden="true"></span><span class="visually-hidden" data-motion-label>Pause animation</span>
        </button>
      </div>
      <div class="term__body">
        ${command(content, `cat ${terminal.greetingFile}`)}
        <p class="term__out" data-boot-out>${terminal.greeting}</p>
        <h1 id="hero-title" class="hero__title">${content.headline.map((line) => html`<span class="line">${line}</span>`)}</h1>
        <p class="hero__intro" data-boot-out>${content.intro}</p>
        ${command(content, "ls services/")}
        <ul class="term__ls" data-boot-out aria-label="Services">
          ${content.services.map((service) => html`<li><a href="/#${service.id}">${service.dir}/</a></li>`)}
        </ul>
        <div class="hero__actions" data-boot-out>
          <a class="button button--primary" href="tel:${profile.phone}" data-magnetic>Call ${profile.phoneDisplay}</a>
          <a class="button button--ghost" href="mailto:${profile.email}">Email me</a>
        </div>
        <div class="term__log" data-term-log role="log" aria-live="polite"></div>
        <form class="term__input" data-term-form data-name="${profile.name}" data-role="${profile.role}" data-city="${profile.city}">
          <label for="term-input">${prompt(content)}<span class="visually-hidden">Terminal command. Type help for a list.</span></label>
          <input id="term-input" name="command" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" placeholder="type help" maxlength="40">
        </form>
      </div>
    </div>
    <div class="hero__meta">
      <p class="availability"><span class="availability__dot" aria-hidden="true"></span>${content.availability}</p>
      <ul class="trust">
        ${content.guarantees.map((item) => html`<li>${icon(item.icon)}<span>${item.title}</span></li>`)}
      </ul>
    </div>
  </div>
</section>`;
};
