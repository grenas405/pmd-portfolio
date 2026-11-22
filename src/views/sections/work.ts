import type { CaseStudy, SiteContent } from "../../content";
import { html, type Html } from "../../html";
import { mockup } from "../mockups";
import { exampleTag, sectionHeader } from "./shared";

const showcase = (study: CaseStudy, i: number): Html => html`<li class="showcase${i % 2 ? " showcase--flip" : ""}">
  <div class="showcase__art">${mockup(study.mockup)}</div>
  <div class="showcase__text">
    <p class="showcase__meta">${study.industry} ${exampleTag(study)}</p>
    <h3 class="showcase__title" data-vt="work-${study.slug}">${study.title}</h3>
    <p class="showcase__summary">${study.summary}</p>
    <p class="showcase__outcome">${study.keyOutcome}</p>
    <a class="button button--ghost" href="/work/${study.slug}">Read the project<span class="visually-hidden">: ${study.title}</span></a>
  </div>
</li>`;

export const work = (content: SiteContent): Html => {
  const hasExamples = content.caseStudies.some((study) => study.kind === "example");
  return html`<section class="section section--raised" id="work" aria-labelledby="work-title">
  ${sectionHeader(
    "work",
    "projects",
    "Projects",
    hasExamples ? "Projects marked as examples show the kind of work I take on for local businesses. Client projects are added here as they launch." : undefined,
  )}
  <ol class="showcases">${content.caseStudies.map(showcase)}</ol>
</section>`;
};
