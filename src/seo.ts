/** Structured data and sitemap builders. Pure: content in, data out. */
import type { CaseStudy, SiteContent } from "./content";

const person = (content: SiteContent) => ({
  "@type": "Person",
  name: content.profile.name,
  jobTitle: content.profile.role,
  url: content.profile.url,
  sameAs: content.profile.links.map((link) => link.href),
});

export const businessJsonLd = (content: SiteContent) => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${content.profile.url}/#business`,
  name: `${content.profile.name} — Software Development`,
  description: content.intro,
  url: content.profile.url,
  image: `${content.profile.url}/og.png`,
  email: `mailto:${content.profile.email}`,
  telephone: content.profile.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: content.profile.city,
    addressRegion: content.profile.region,
    addressCountry: "US",
  },
  areaServed: content.serviceArea.map((city) => ({ "@type": "City", name: `${city}, ${content.profile.region}` })),
  founder: person(content),
  knowsAbout: content.services.map((service) => service.name),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Software development services",
    itemListElement: content.services.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service.name, description: service.summary },
    })),
  },
});

export const faqJsonLd = (content: SiteContent) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: content.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

export const caseStudyJsonLd = (content: SiteContent, study: CaseStudy) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${content.profile.url}/` },
    { "@type": "ListItem", position: 2, name: study.title, item: `${content.profile.url}/work/${study.slug}` },
  ],
});

const escapeXml = (text: string): string =>
  text.replace(/[<>&'"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[ch] ?? ch);

export const sitemapXml = (content: SiteContent): string => {
  const paths = ["/", ...content.caseStudies.map((study) => `/work/${study.slug}`)];
  const urls = paths.map((path) => `  <url><loc>${escapeXml(content.profile.url + path)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};
