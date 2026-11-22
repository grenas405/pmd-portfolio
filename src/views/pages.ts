/** Full pages. Each returns markup or an explicit error; nothing here throws. */
import { findCaseStudy, type CaseStudy } from "../content";
import type { NotFoundError } from "../errors";
import { html, type Html } from "../html";
import { err, ok, type Result } from "../result";
import { businessJsonLd, caseStudyJsonLd, faqJsonLd } from "../seo";
import { layout } from "./layout";
import { mockup } from "./mockups";
import { about, contact, exampleTag, faqs, hero, local, process, proof, services, work } from "./sections";
import type { PageContext } from "./types";

export const homePage = (ctx: PageContext): Html =>
  layout(
    ctx,
    {
      title: `${ctx.content.profile.name} — Custom software for Oklahoma City businesses`,
      description:
        "Websites, web apps, APIs, and Android apps for local businesses in the Oklahoma City metro. Fixed prices, fast turnaround, and a developer who answers the phone.",
      path: "/",
      ogType: "website",
      jsonLd: [businessJsonLd(ctx.content), faqJsonLd(ctx.content)],
      indexable: true,
    },
    html`${hero(ctx.content)}
${services(ctx.content)}
${work(ctx.content)}
${proof(ctx.content)}
${process(ctx.content)}
${local(ctx.content)}
${about(ctx.content)}
${faqs(ctx.content)}
${contact(ctx.content)}`,
  );

const list = (items: readonly string[]): Html => html`<ul class="case__list">${items.map((item) => html`<li>${item}</li>`)}</ul>`;

/** The project after this one, wrapping around to the first. */
export const nextCaseStudy = (studies: readonly CaseStudy[], slug: string): CaseStudy | undefined => {
  const index = studies.findIndex((study) => study.slug === slug);
  return index === -1 ? undefined : studies[(index + 1) % studies.length];
};

const caseStudyBody = (ctx: PageContext, study: CaseStudy): Html => {
  const next = nextCaseStudy(ctx.content.caseStudies, study.slug);
  return html`<article class="case">
  <header class="case__hero">
    <div class="case__intro">
      <a class="case__back" href="/#work">All projects</a>
      <p class="case__meta">${study.industry} ${exampleTag(study)}</p>
      <h1 class="case__title" data-vt="work-${study.slug}">${study.title}</h1>
      <p class="case__summary">${study.summary}</p>
      ${study.kind === "example"
        ? html`<p class="case__note">This is an example project. It shows the kind of build I take on; client projects are added as they launch.</p>`
        : html``}
    </div>
    <div class="case__art">${mockup(study.mockup)}</div>
  </header>
  <div class="case__grid">
    <section class="case__card" aria-labelledby="problem-title">
      <h2 id="problem-title">The problem</h2>
      <p>${study.problem}</p>
    </section>
    <section class="case__card" aria-labelledby="built-title">
      <h2 id="built-title">What I built</h2>
      ${list(study.built)}
    </section>
    <section class="case__card case__card--accent" aria-labelledby="outcomes-title">
      <h2 id="outcomes-title">What changes for the business</h2>
      ${list(study.outcomes)}
    </section>
    <section class="case__card" aria-labelledby="facts-title">
      <h2 id="facts-title">Project details</h2>
      <dl class="facts">
        <div><dt>Business</dt><dd>${study.business}</dd></div>
        <div><dt>Timeline</dt><dd>${study.timeline}</dd></div>
        <div><dt>Built with</dt><dd>${study.stack.join(", ")}</dd></div>
      </dl>
    </section>
  </div>
  ${next && next.slug !== study.slug
    ? html`<nav class="case__next" aria-label="Next project"><a href="/work/${next.slug}"><span class="case__next-label">Next project</span><span class="case__next-title">${next.title}</span></a></nav>`
    : html``}
</article>
${contact(ctx.content)}`;
};

export const caseStudyPage = (ctx: PageContext, slug: string): Result<Html, NotFoundError> => {
  const study = findCaseStudy(ctx.content.caseStudies, slug);
  if (!study) return err({ kind: "NotFound", path: `/work/${slug}` });
  return ok(
    layout(
      ctx,
      {
        title: `${study.title} — ${ctx.content.profile.name}`,
        description: study.summary,
        path: `/work/${study.slug}`,
        ogType: "article",
        jsonLd: [caseStudyJsonLd(ctx.content, study)],
        indexable: true,
      },
      caseStudyBody(ctx, study),
    ),
  );
};

const STATUS_COPY = {
  404: { code: "404", title: "That page isn't here.", body: "The link may be old or mistyped. Everything is on the home page." },
  405: { code: "405", title: "That request isn't supported.", body: "This site only serves pages. Head to the home page to look around." },
  500: { code: "500", title: "Something went wrong on my end.", body: "The page couldn't load. Try again in a moment, or call or email me directly." },
} as const;

export type ErrorStatus = keyof typeof STATUS_COPY;

export const errorPage = (ctx: PageContext, status: ErrorStatus, path: string): Html => {
  const copy = STATUS_COPY[status];
  const { profile, terminal } = ctx.content;
  return layout(
    ctx,
    { title: `${copy.title} — ${profile.name}`, description: copy.body, path, ogType: "website", jsonLd: [], indexable: false },
    html`<section class="error-page" aria-labelledby="error-title">
  <canvas class="prairie prairie--band" data-prairie="band" aria-hidden="true"></canvas>
  <div class="error-page__inner">
    <p class="path" aria-hidden="true">${terminal.user}@${terminal.host}:~$ cd ${path}</p>
    <p class="error-page__code" aria-hidden="true">bash: cd: no such page (${copy.code})</p>
    <h1 id="error-title" class="error-page__title">${copy.title}</h1>
    <p class="error-page__body">${copy.body}</p>
    <p class="error-page__actions">
      <a class="button button--primary" href="/">Go to the home page</a>
      <a class="button button--ghost" href="tel:${profile.phone}">Call ${profile.phoneDisplay}</a>
    </p>
  </div>
</section>`,
  );
};
