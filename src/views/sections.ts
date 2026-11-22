/** Home page sections. Each is a pure function from content to markup. */
import type { CaseStudy, Faq, Service, SiteContent, Step } from "../content";
import { html, type Html } from "../html";

const words = (line: string): Html[] => line.split(" ").map((word) => html`<span class="word">${word}</span> `);

export const hero = (content: SiteContent): Html => {
  const { profile } = content;
  return html`<section class="hero" aria-labelledby="hero-title">
  <div class="field" data-field aria-hidden="true"></div>
  <div class="hero__content">
    <h1 id="hero-title" class="hero__title">
      ${content.headline.map((line) => html`<span class="line">${words(line)}</span>`)}
    </h1>
    <p class="hero__intro">${content.intro}</p>
    <div class="hero__actions">
      <a class="button" href="tel:${profile.phone}">Call ${profile.phoneDisplay}</a>
      <a class="button button--quiet" href="mailto:${profile.email}">Email me</a>
    </div>
  </div>
  <button class="motion-toggle" type="button" data-motion-toggle hidden>Pause animation</button>
</section>`;
};

const service = (item: Service): Html => html`<li class="service" id="${item.id}">
  <h3 class="service__name">${item.name}</h3>
  <div class="service__body">
    <p>${item.summary}</p>
    <p class="service__good-for-label">Good for</p>
    <ul class="service__good-for">${item.goodFor.map((use) => html`<li>${use}</li>`)}</ul>
  </div>
</li>`;

export const services = (content: SiteContent): Html => html`<section class="section" id="services" aria-labelledby="services-title">
  <h2 id="services-title" class="section__title">What I build</h2>
  <ul class="services">${content.services.map(service)}</ul>
</section>`;

export const exampleNote = (study: CaseStudy): Html =>
  study.kind === "example" ? html`<span class="tag">Example project</span>` : html``;

const project = (study: CaseStudy): Html => html`<li class="project">
  <a class="project__link" href="/work/${study.slug}">
    <span class="project__meta">${study.industry} ${exampleNote(study)}</span>
    <h3 class="project__title" data-vt="work-${study.slug}">${study.title}</h3>
    <span class="project__summary">${study.summary}</span>
  </a>
</li>`;

export const work = (content: SiteContent): Html => {
  const hasExamples = content.caseStudies.some((study) => study.kind === "example");
  return html`<section class="section" id="work" aria-labelledby="work-title">
  <h2 id="work-title" class="section__title">Projects</h2>
  ${hasExamples
    ? html`<p class="section__lede">Projects marked as examples show the kind of work I take on for local businesses. Client projects are added here as they launch.</p>`
    : html``}
  <ul class="projects">${content.caseStudies.map(project)}</ul>
</section>`;
};

const step = (item: Step): Html => html`<li class="step">
  <h3 class="step__name">${item.name}</h3>
  <p class="step__detail">${item.detail}</p>
</li>`;

export const process = (content: SiteContent): Html => html`<section class="section" id="process" aria-labelledby="process-title">
  <h2 id="process-title" class="section__title">How a project goes</h2>
  <ol class="steps">${content.process.map(step)}</ol>
</section>`;

export const local = (content: SiteContent): Html => html`<section class="section section--local" id="local" aria-labelledby="local-title">
  <h2 id="local-title" class="section__title">Right here in the metro</h2>
  <p class="section__lede">${content.localPitch}</p>
  <ul class="cities" aria-label="Areas I serve">${content.serviceArea.map((city) => html`<li>${city}</li>`)}</ul>
</section>`;

export const about = (content: SiteContent): Html => html`<section class="section section--about" id="about" aria-labelledby="about-title">
  <h2 id="about-title" class="section__title">About Pedro</h2>
  <div class="prose">${content.about.map((paragraph) => html`<p>${paragraph}</p>`)}</div>
</section>`;

const faq = (item: Faq): Html => html`<details class="faq" name="faq">
  <summary class="faq__question">${item.question}</summary>
  <p class="faq__answer">${item.answer}</p>
</details>`;

export const faqs = (content: SiteContent): Html => html`<section class="section" id="faq" aria-labelledby="faq-title">
  <h2 id="faq-title" class="section__title">Questions owners ask</h2>
  <div class="faqs">${content.faqs.map(faq)}</div>
</section>`;

export const contact = (content: SiteContent): Html => {
  const { profile } = content;
  return html`<section class="section contact" id="contact" aria-labelledby="contact-title">
  <h2 id="contact-title" class="contact__title">Tell me what's slowing your business down.</h2>
  <p class="contact__lede">Call or text, or send an email. ${profile.responseTime}</p>
  <a class="contact__phone" href="tel:${profile.phone}">${profile.phoneDisplay}</a>
  <ul class="contact__options">
    <li><a class="button" href="sms:${profile.phone}">Text me</a></li>
    <li><a class="button button--quiet" href="mailto:${profile.email}">${profile.email}</a></li>
    <li><button class="button button--quiet" type="button" data-copy="${profile.email}" data-copied="Email address copied">Copy email</button></li>
    <li><a class="button button--quiet" href="/contact.vcf" download>Save my contact</a></li>
  </ul>
</section>`;
};
