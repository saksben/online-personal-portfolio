import type { ClassId } from "./characters";

export interface Experience {
  role: string;
  org: string;
  location?: string;
  /** e.g. "Jan 2022" */
  start: string;
  /** Omit for a current role. */
  end?: string;
  bullets: string[];
  /** Class pages this entry appears on (it always appears on /resume). */
  classes: ClassId[];
}

export interface Education {
  credential: string;
  institution?: string;
  year?: string;
}

export const resume = {
  headline: "Software Engineer",
  summary:
    "I was born and raised in the forests of Oregon, lived in the deserts of Arizona, and now make my home in the bustling city of Los Angeles. I earned a bachelor's in Global Business and an MBA, then wanted more, so I also earned a bachelor's in Software Engineering. I started as a front-end developer with JavaScript and React / Next.js and have since widened into full-stack, data, AI, mobile and game development.",

  /**
   * TODO(ben): add real employment history. Nothing is invented here; the
   * "Field Experience" section on the class pages and /resume renders only
   * when this array has entries.
   */
  experience: [
    // {
    //   role: "Full Stack Software Engineer",
    //   org: "",
    //   location: "",
    //   start: "",
    //   end: "",
    //   bullets: [],
    //   classes: [],
    // },
    {
      role: "Full Stack Software Engineer",
      org: "Klick Foundry",
      location: "Remote",
      start: "Jan 2025",
      end: "Present",
      bullets: [
        "•  Architected a client's document-approval workflow from a two-paragraph email request to production: scoped it with their  office manager, modeled it in Postgres, built the API and UI, and shipped it through GitHub pipeline to RDS/EC2",
        "•  Constructed a self-serve invoice portal (Next.js, Stripe API, RDS-hosted Postgres) for a client with ~2,000 monthly active  customers; support tickets about billing dropped by about a third in the first two months",
        "•  Authored tests alongside every feature: ~1500 backend backend tests + ~800 frontend tests, Stripe and the client's ERP  mocked at service boundary; caught date-rounding regression before a release that would have misbilled invoices",
        "•  Migrated deploys from a manual SSH-and-restart process to a GitHub Actions pipeline building Docker images to EC2;  deploys went from a 30-minute, one-person ritual to a 6-minute automated step that anyone on the team can trigger",
        "•  Diagnosed a dashboard page that timed out for client's account: an N+1 query was firing 3,000+ individual lookups per load.  Rewrote it as a single joined query with pagination, cutting load time from 30+ seconds to under one; added slow-query  logging to Postgres so regressions surface in review",
        "•  Utilized AI tools as part of normal daily workflow (Copilot inline, ChatGPT for discussing preliminary architectural plans,  Claude Code for multi-file refactors). Treated output as a junior's PR: used it to migrate 30 components to a new form library  in a day, but rejected its suggested auth middleware after spotting it skipped token expiry checks",
        "•  Became sole developer on a NetSuite billing customization for client: scoped requirements directly with their finance lead,  built SuiteScript automations that generate consolidated monthly invoices across subsidiaries and documented the system",
      ],
      classes: [],
    },
    {
      role: "Full Stack Software Engineer",
      org: "Genie AI",
      location: "Remote",
      start: "Jul 2024",
      end: "Dec 2024",
      bullets: [
        "•  Owned the integrations layer of an early-stage SaaS solo: designed and built the REST API surface for secure OAuth social media integrations (15 endpoints), implemented authorized posting capability, and shipped it to AWS",
        "•  Refactored the platform's five-step onboarding as a single progressive React form with inline validation; signup completion  rose from 61% to 74% over the following month per PostHog funnel",
        "•  Introduced testing to some of the team's untested backend services: stood up testing suite with a seeded test database, covered the billing module (~50 tests), and added the suite as a CI gate so it ran on every merge request",
        "•  Built a RAG-based document Q&A feature: chunked and embedded client compliance docs into pgvector, wired a retrieval layer into the OpenAI API, and used prompt engineering to keep answers grounded in retrieved context so users get  cited answers instead of digging through a 200-page manual",
        "•  Reviewed frontend PRs on the junior-level team, documented API contracts in Notion with request/response examples;  frontend-backend integration bugs nearly disappeared once both sides worked from the same doc",
      ],
      classes: [],
    },
  ] as Experience[],

  /** TODO(ben): add institutions / graduation years if you want them shown. */
  education: [
    {
      credential: "Bachelor's in Software Engineering ",
      institution: " | Western Governors University",
      year: "2023",
    },
    {
      credential: "Master of Business Administration (MBA) ",
      institution: " | George Fox University",
      year: "2018",
    },
    {
      credential: "Bachelor's in Global Business",
      institution: " | George Fox University",
      year: "2017",
    },
  ] as Education[],
};
