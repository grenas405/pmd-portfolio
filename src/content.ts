/**
 * Every word on the site lives here. Edit this file to change copy, contact
 * details, services, or projects — the views only arrange what they are given.
 *
 * TODO(Pedro): replace the placeholder phone number and email address, and swap
 * the example projects for real client work as it ships.
 */

export type Portrait = {
  /** Path under public/, e.g. "/img/pedro.avif". */
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
};

export type Profile = {
  readonly name: string;
  readonly givenName: string;
  readonly familyName: string;
  readonly role: string;
  readonly email: string;
  /** E.164 format, used for tel:/sms: links and the vCard. */
  readonly phone: string;
  readonly phoneDisplay: string;
  readonly city: string;
  readonly region: string;
  readonly url: string;
  readonly responseTime: string;
  readonly links: ReadonlyArray<{ readonly label: string; readonly href: string }>;
  /** Leave undefined to show the monogram placeholder. */
  readonly portrait?: Portrait;
};

/** Names of the line icons in src/views/icons.ts. */
export type IconName = "browser" | "nodes" | "phone" | "wrench" | "price" | "key" | "clock" | "pin";

export type Service = {
  readonly id: string;
  /** Directory name shown by `ls services/` in the hero terminal. */
  readonly dir: string;
  readonly icon: IconName;
  readonly name: string;
  readonly summary: string;
  readonly goodFor: readonly string[];
};

export type ProjectKind = "example" | "client";

/** Which coded UI mockup illustrates a project (src/views/mockups.ts). */
export type MockupKind = "ordering" | "field-service" | "booking";

export type CaseStudy = {
  readonly slug: string;
  /** "example" projects are labeled as such on the page. */
  readonly kind: ProjectKind;
  readonly business: string;
  readonly industry: string;
  readonly title: string;
  readonly summary: string;
  /** The single result shown on the project card. */
  readonly keyOutcome: string;
  readonly mockup: MockupKind;
  readonly problem: string;
  readonly built: readonly string[];
  readonly outcomes: readonly string[];
  readonly stack: readonly string[];
  readonly timeline: string;
};

export type Step = { readonly name: string; readonly detail: string };

export type Faq = { readonly question: string; readonly answer: string };

export type Guarantee = { readonly icon: IconName; readonly title: string; readonly detail: string };

/** Only real, attributable quotes. The section stays hidden while this list is empty. */
export type Testimonial = { readonly quote: string; readonly name: string; readonly business: string };

export type Terminal = {
  readonly user: string;
  readonly host: string;
  readonly greetingFile: string;
  readonly greeting: string;
};

export type SiteContent = {
  readonly profile: Profile;
  readonly headline: readonly string[];
  readonly intro: string;
  readonly terminal: Terminal;
  /** One line shown under the hero, e.g. when you can take new work. */
  readonly availability: string;
  readonly guarantees: readonly Guarantee[];
  readonly testimonials: readonly Testimonial[];
  readonly services: readonly Service[];
  readonly caseStudies: readonly CaseStudy[];
  readonly process: readonly Step[];
  readonly serviceArea: readonly string[];
  readonly localPitch: string;
  readonly about: readonly string[];
  readonly howIWork: readonly string[];
  readonly faqs: readonly Faq[];
};

export const content: SiteContent = {
  profile: {
    name: "Pedro M. Dominguez",
    givenName: "Pedro",
    familyName: "Dominguez",
    role: "Web, API & Android developer",
    email: "hello@pedromdominguez.dev",
    phone: "+14055550123",
    phoneDisplay: "(405) 555-0123",
    city: "Oklahoma City",
    region: "OK",
    url: "https://pedromdominguez.dev",
    responseTime: "I reply within one business day.",
    links: [
      { label: "GitHub", href: "https://github.com/grenas405" },
    ],
  },

  // Each entry is one line of the hero headline.
  headline: ["Custom software", "for Oklahoma City", "businesses."],

  terminal: {
    user: "pedro",
    host: "okc",
    greetingFile: "howdy.txt",
    greeting: "Howdy, y'all. Pull up a chair.",
  },

  availability: "Booking new projects for January 2027",

  guarantees: [
    { icon: "price", title: "A fixed price, up front", detail: "You get one number before work starts. No hourly meter, no surprise invoices." },
    { icon: "key", title: "You own everything", detail: "The code, the accounts, and the domain are yours. Leave any time and take it all with you." },
    { icon: "clock", title: "A reply within a business day", detail: "Call, text, or email and you'll hear back from me, not a ticket system." },
  ],

  testimonials: [],

  intro:
    "I'm Pedro. I build websites, web apps, and Android apps for owners across the metro — online ordering, booking, customer portals, and the tools that replace the spreadsheet you're tired of fighting.",

  services: [
    {
      id: "web-apps",
      dir: "web-apps",
      icon: "browser",
      name: "Websites & web apps",
      summary:
        "Fast sites that bring in calls, and web apps your staff and customers actually use: booking, quotes, ordering, member portals.",
      goodFor: ["Restaurants taking online orders", "Salons and clinics booking appointments", "Contractors sending quotes"],
    },
    {
      id: "apis",
      dir: "apis",
      icon: "nodes",
      name: "APIs & integrations",
      summary:
        "Connect the systems you already pay for — point of sale, QuickBooks, Square, Google — so data moves on its own instead of being retyped.",
      goodFor: ["Syncing sales into your books", "Text alerts when an order comes in", "One dashboard instead of five logins"],
    },
    {
      id: "android",
      dir: "android-apps",
      icon: "phone",
      name: "Android apps",
      summary:
        "Apps for your field crew or your customers, published on Google Play or installed directly on company phones.",
      goodFor: ["Technicians logging jobs and photos", "Loyalty and reordering apps", "Inventory counts on the floor"],
    },
    {
      id: "modernize",
      dir: "fixes",
      icon: "wrench",
      name: "Fixes, rescues & upgrades",
      summary:
        "A slow site, a broken form, an old system nobody can update. I'll find what's wrong, explain it in plain English, and fix it.",
      goodFor: ["Sites that load slowly on phones", "Forms that stopped sending", "Moving off a costly platform"],
    },
  ],

  caseStudies: [
    {
      slug: "online-ordering-for-a-family-restaurant",
      kind: "example",
      business: "Family-owned Tex-Mex restaurant",
      industry: "Restaurant",
      title: "Online ordering without the delivery-app fees",
      summary: "Pickup orders straight from the restaurant's own site, printed in the kitchen the moment they're paid.",
      keyOutcome: "Keeps the margin that delivery apps used to take",
      mockup: "ordering",
      problem:
        "Third-party apps were taking up to 30% of every order, and phone orders during the Friday rush meant missed calls and mistakes.",
      built: [
        "A mobile-first ordering page with the full menu, modifiers, and pickup times",
        "Card payments through the restaurant's existing Square account",
        "An API that sends each paid order to the kitchen printer and texts the customer when it's ready",
      ],
      outcomes: [
        "Owner keeps the margin that used to go to delivery apps",
        "Fewer phone calls during the rush",
        "Menu and prices updated by the owner, no developer needed",
      ],
      stack: ["Cloudflare Workers", "TypeScript", "Square API", "SMS"],
      timeline: "About 4 weeks",
    },
    {
      slug: "field-service-app-for-an-hvac-company",
      kind: "example",
      business: "HVAC and plumbing company",
      industry: "Home services",
      title: "A field app that replaced paper work orders",
      summary: "Technicians see their day, log parts and photos, and collect signatures from an Android phone.",
      keyOutcome: "Invoices go out the same day the job is done",
      mockup: "field-service",
      problem:
        "Paper tickets came back to the office late, illegible, or not at all — so invoices went out days after the job.",
      built: [
        "An Android app for technicians that works offline in attics and crawlspaces",
        "Photo, parts, and signature capture tied to each job",
        "A web dashboard for the office to dispatch jobs and send invoices the same day",
      ],
      outcomes: [
        "Invoices go out the day the job is finished",
        "No more retyping tickets at the office",
        "Photos on file for every warranty question",
      ],
      stack: ["Kotlin", "Android", "TypeScript API", "SQLite"],
      timeline: "About 8 weeks",
    },
    {
      slug: "booking-and-reminders-for-a-salon",
      kind: "example",
      business: "Independent hair salon",
      industry: "Personal care",
      title: "Booking and text reminders that cut no-shows",
      summary: "Clients book online at any hour and get a reminder the day before, with one tap to confirm or reschedule.",
      keyOutcome: "Fewer empty chairs from forgotten appointments",
      mockup: "booking",
      problem:
        "The front desk spent hours on the phone booking appointments, and no-shows were costing several chairs a week.",
      built: [
        "An online booking page that shows each stylist's real availability",
        "Automatic text reminders with confirm and reschedule links",
        "A simple calendar view for stylists on their phones",
      ],
      outcomes: [
        "Clients book after hours instead of calling",
        "Fewer empty chairs from forgotten appointments",
        "Front desk time spent on clients in the chair",
      ],
      stack: ["Web app", "TypeScript", "Google Calendar API", "SMS"],
      timeline: "About 5 weeks",
    },
  ],

  process: [
    { name: "Talk it through", detail: "A free call or coffee to hear how your business runs and what's slowing it down." },
    { name: "See it first", detail: "A clickable prototype in days, so you can try the idea before paying for the full build." },
    {
      name: "Build",
      detail:
        "I build with Claude Code, an AI coding tool, which gets you working software in weeks instead of months. Every line is reviewed and tested by me.",
    },
    { name: "Launch", detail: "I handle hosting, domains, and app store listings, and show your team how to use it." },
    { name: "Keep it running", detail: "Updates, fixes, and new features when you need them, from someone who answers the phone." },
  ],

  serviceArea: ["Oklahoma City", "Edmond", "Norman", "Moore", "Yukon", "Mustang", "Midwest City", "Del City", "Bethany", "Piedmont"],

  localPitch:
    "I live and work in the metro. We can meet at your shop, your office, or a coffee place in between — and when something needs fixing, you're calling someone local, not a ticket queue.",

  about: [
    "I'm a software developer based in Oklahoma City. I build for small and mid-sized businesses that need software shaped around how they actually work, not the other way around.",
    "I use Claude Code, an AI coding assistant, to move fast on the repetitive parts so more of your budget goes to the parts that matter: getting the details right, testing, and security.",
    "You'll always know what you're paying for, what's being built this week, and who to call.",
  ],

  howIWork: [
    "Plain English, no jargon",
    "Working software every week",
    "Security and testing built in",
    "Hosting and support handled",
  ],

  faqs: [
    {
      question: "How much does a project cost?",
      answer:
        "It depends on what you need, so I give you a fixed price after our first conversation — not an hourly meter. Small fixes and websites cost far less than a custom app, and I'll tell you if an off-the-shelf tool would serve you better.",
    },
    {
      question: "How long does it take?",
      answer:
        "Most websites launch in two to four weeks. Web and Android apps usually take four to ten weeks. You'll see working pieces every week along the way.",
    },
    {
      question: "What does building with AI mean for me?",
      answer:
        "Claude Code writes a lot of the routine code under my direction, which saves time and money. I design the system, review every change, and test it before it reaches you. You get the speed without giving up quality.",
    },
    {
      question: "Who owns the code and the app?",
      answer: "You do. When the project is paid for, the code, accounts, and domain are yours, and I'll hand everything over if you ever want to move on.",
    },
    {
      question: "Do you work with businesses outside Oklahoma City?",
      answer: "Yes. I work in person across the metro and remotely with businesses anywhere in Oklahoma and beyond.",
    },
    {
      question: "What happens after launch?",
      answer:
        "I offer a monthly care plan for hosting, updates, and small changes, or you can call me as needs come up. Either way, you're not left on your own.",
    },
  ],
};

export const findCaseStudy = (studies: readonly CaseStudy[], slug: string): CaseStudy | undefined =>
  studies.find((study) => study.slug === slug);
