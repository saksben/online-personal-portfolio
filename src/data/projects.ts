import type { ClassId } from "./characters";
import { site } from "./site";

export type ProjectStatus = "concept" | "in-development" | "prototype" | "complete";

export interface Project {
  /** Also the expected GitHub repo name unless `repo` overrides it. */
  slug: string;
  classId: ClassId;
  title: string;
  /** The capability this project demonstrates. */
  capability: string;
  summary: string;
  status: ProjectStatus;
  tech: string[];
  /** GitHub repo URL. Leave undefined until the repo exists. */
  repo?: string;
  /** StackBlitz demo URL (a purpose-built, self-contained demo, not necessarily the whole production repo). */
  stackblitz?: string;
  /** Optional hosted live demo. */
  live?: string;
  /** Screenshot filename (no extension) in src/assets/projects. */
  image?: string;
  /** Short caveat shown on the card. */
  note?: string;
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  complete: "Complete",
  prototype: "Prototype",
  "in-development": "In development",
  concept: "Concept",
};

/** The GitHub URL a project's repo is expected to live at. */
export const expectedRepoUrl = (p: Project) => `${site.github}/${p.slug}`;

export const projects: Project[] = [
  // ─── Paladin · Full stack ───────────────────────────────────────────────
  {
    slug: "finance-tracker",
    classId: "paladin",
    title: "Finance Tracker",
    capability: "Complex product UI",
    summary:
      "A personal tool to keep track of expenses and obligations when budgeting, with alerts, data-visualization charts and exportable reports.",
    status: "complete",
    tech: ["Next.js", "JavaScript", "Tailwind CSS", "Redux", "Chart.js"],
    repo: `${site.github}/finance-tracker`,
    stackblitz: "https://stackblitz.com/edit/stackblitz-starters-gk312c",
    image: "financial-tracker",
    note: "Add transactions, users and budgets; the dashboard summarizes everything.",
  },
  {
    slug: "moon-design-system",
    classId: "paladin",
    title: "Moon.io Component Design System",
    capability: "Design-to-code handoff",
    summary:
      "The passing of the baton from the UX design team to the software team: React components built from a Figma design system and documented in Storybook.",
    status: "complete",
    tech: ["React", "Storybook", "Tailwind CSS", "Vite"],
    repo: `${site.github}/moon-design-system`,
    live: "https://663c2588302bd8a99f19c4bd-jwbhyqceek.chromatic.com/",
    image: "moon-design-system",
  },
  {
    slug: "interactive-world-map",
    classId: "paladin",
    title: "Interactive World Map",
    capability: "API-driven frontend",
    summary: "A map of the world that retrieves country data from an API as the mouse hovers over each country.",
    status: "complete",
    tech: ["Angular", "TypeScript", "World Bank API"],
    repo: `${site.github}/d280-javascript-programming/tree/master`,
    stackblitz: "https://stackblitz.com/edit/stackblitz-starters-neegxb",
    image: "interactive-world-map",
    note: "Hover a country to fetch its data.",
  },
  {
    slug: "d287-java-frameworks",
    classId: "paladin",
    title: "Web Inventory System",
    capability: "Server-rendered backend",
    summary: "A customizable inventory system that can be adapted to different industries.",
    status: "complete",
    tech: ["Java", "Spring Boot", "Thymeleaf", "JUnit"],
    repo: `${site.github}/d287-java-frameworks`,
    image: "web-inventory-system",
    note: "No browser demo: Spring Boot can't run in StackBlitz. Run it locally; instructions are in the README.",
  },
  {
    slug: "saas-template",
    classId: "paladin",
    title: "SaaS Template",
    capability: "Full-stack architecture",
    summary: "A production-shaped full-stack starter showing how frontend, API, data layer and deployment fit together.",
    status: "concept",
    tech: ["TypeScript", "React", "Node", "SQL"],
  },
  {
    slug: "skill-tree-of-you",
    classId: "paladin",
    title: "Skill Tree of You",
    capability: "Complex product / UI",
    summary: "An interactive, RPG-style skill tree for exploring a person's abilities, and a stress test for a rich product interface.",
    status: "concept",
    tech: ["TypeScript", "React"],
  },
  {
    slug: "aura-compiler",
    classId: "paladin",
    title: "Aura Compiler",
    capability: "Recommendation / product system",
    summary: "A recommendation-driven product that compiles a person's preferences into personalized suggestions.",
    status: "concept",
    tech: ["TypeScript", "React", "Node"],
  },

  // ─── Archivist · Database ───────────────────────────────────────────────
  {
    slug: "data-warehouse",
    classId: "archivist",
    title: "Data Warehouse",
    capability: "Data engineering",
    summary: "Ingestion, ETL/ELT, normalization, dimensional modeling, transformations, analytics and reporting, end to end.",
    status: "concept",
    tech: ["SQL", "PostgreSQL", "Python"],
  },
  {
    slug: "constellation-of-a-life",
    classId: "archivist",
    title: "Constellation of a Life",
    capability: "Graph data",
    summary:
      "A life modeled as a graph: nodes, relationships, traversals, shortest paths and graph queries, with an actual human purpose behind them.",
    status: "concept",
    tech: ["Graph modeling", "PostgreSQL", "Next.js"],
    note: "The StackBlitz demo will use a self-contained in-memory graph rather than the production Postgres stack.",
  },
  {
    slug: "storytelling-engine",
    classId: "archivist",
    title: "Storytelling Engine",
    capability: "Complex domain modeling",
    summary:
      "A database that models the story itself: characters, factions, locations, events, goals and causality, all queryable along the timeline.",
    status: "concept",
    tech: ["Relational modeling", "SQL"],
  },

  // ─── Oracle · AI ────────────────────────────────────────────────────────
  {
    slug: "rag-system",
    classId: "oracle",
    title: "RAG Knowledge System",
    capability: "Retrieval architecture",
    summary:
      "Turns a corpus into an interrogable knowledge system: ingestion, parsing, chunking, embeddings, vector storage, retrieval, context assembly, generation and citations.",
    status: "concept",
    tech: ["Embeddings", "Vector search", "LLM APIs"],
  },
  {
    slug: "ai-instance-generator",
    classId: "oracle",
    title: "AI Instance Generator",
    capability: "AI knowledge & personality systems",
    summary:
      "Give it a subject and it discovers sources, builds a corpus and a RAG system, writes a behavioral system prompt, and produces an AI instance you can talk to.",
    status: "concept",
    tech: ["RAG", "LLM APIs", "Prompt design"],
  },
  {
    slug: "ai-command-center",
    classId: "oracle",
    title: "AI Command Center",
    capability: "Agent orchestration",
    summary:
      "A command center that analyzes a task, decomposes and routes it to specialized agents, then synthesizes their results, with tool use, state and memory.",
    status: "concept",
    tech: ["Agents", "Tool use", "Orchestration"],
  },

  // ─── Courier · Mobile ───────────────────────────────────────────────────
  {
    slug: "native-app-template",
    classId: "courier",
    title: "Native App Template",
    capability: "Mobile architecture",
    summary: "A starter that shows how a native mobile app is structured, so the next one starts running instead of from scratch.",
    status: "concept",
    tech: ["Native mobile", "TypeScript"],
  },
  {
    slug: "todoist-clone",
    classId: "courier",
    title: "Todoist-style App",
    capability: "Native product implementation",
    summary: "A full native task-management app: the everyday product, done properly on a phone.",
    status: "concept",
    tech: ["Native mobile"],
  },
  {
    slug: "pwa-template",
    classId: "courier",
    title: "PWA Template",
    capability: "Progressive web architecture",
    summary: "An installable, offline-capable progressive web app foundation.",
    status: "concept",
    tech: ["PWA", "Service workers", "TypeScript"],
  },
  {
    slug: "weight-form-app",
    classId: "courier",
    title: "Weight / Form App",
    capability: "Camera / computer vision",
    summary: "A mobile app that uses the device camera and computer vision to check form.",
    status: "concept",
    tech: ["Camera", "Computer vision"],
  },

  // ─── Worldbuilder · Game ────────────────────────────────────────────────
  {
    slug: "dracula-visual-novel",
    classId: "worldbuilder",
    title: "Dracula Visual Novel",
    capability: "Interactive narrative",
    summary: "An interactive visual-novel take on Dracula, built around branching choices.",
    status: "concept",
    tech: ["Interactive narrative"],
  },
  {
    slug: "strategy-game",
    classId: "worldbuilder",
    title: "Strategy / Builder Game",
    capability: "Game systems",
    summary: "A strategy and city-builder-style game that leans on interlocking systems and simulation.",
    status: "concept",
    tech: ["Game systems", "Simulation"],
  },
  {
    slug: "multiplayer-game",
    classId: "worldbuilder",
    title: "Multiplayer Game",
    capability: "Real-time networking",
    summary: "A real-time multiplayer game covering state synchronization and networking.",
    status: "concept",
    tech: ["WebSockets", "Real-time networking"],
  },
];

export const projectsFor = (classId: ClassId) => projects.filter((p) => p.classId === classId);
