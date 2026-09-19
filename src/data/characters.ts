/**
 * The five playable classes. This file is the single source of truth for the
 * selector, the class pages, the transitions and the placeholder art.
 * Stats are presentation devices (archetypal attributes), not proficiency claims.
 */

export type ClassId = "paladin" | "archivist" | "oracle" | "courier" | "worldbuilder";

/** One entry per transition implementation in src/scripts/transitions.ts. */
export type TransitionKind = "slash" | "fracture" | "network" | "hud" | "construct";

export interface Stat {
  label: string;
  /** 1–10 segments filled. */
  value: number;
}

export interface ArsenalItem {
  name: string;
  /** Filename (without extension) in src/assets/skill-icons, if one exists. */
  icon?: string;
}

export interface Character {
  id: ClassId;
  /** Slot number on the select screen (1-based). */
  slot: number;
  /** "The Paladin" */
  name: string;
  /** "Paladin" */
  shortName: string;
  /** Discipline shown as the class title, e.g. "Full-Stack Engineer". */
  discipline: string;
  /** Visual archetype, e.g. "The Adventurer". */
  archetype: string;
  /** One-liner shown on the select screen. */
  tagline: string;
  /** Mission-profile paragraphs for the class page. */
  mission: string[];
  /** Four short tags for the select screen. */
  tags: string[];
  arsenal: ArsenalItem[];
  stats: Stat[];
  transition: TransitionKind;
  /** Human description of the signature transition (used in ART-ASSETS.md). */
  signature: string;
  /** Accessible description of the character art. */
  artAlt: string;
}

export const characters: Character[] = [
  {
    id: "paladin",
    slot: 1,
    name: "The Paladin",
    shortName: "Paladin",
    discipline: "Full-Stack Engineer",
    archetype: "The Adventurer",
    tagline: "Adaptable. Resourceful. Equipped for any terrain.",
    mission: [
      "Full-stack engineering across the whole product: interface, API and data. My weapons of choice are JavaScript and React / Next.js, backed by TypeScript, Angular, Node and SQL, with Java and Spring Boot in the pack for when the job calls for it.",
      "The Paladin is built for problems that don't fit in one layer. That means shipping a design system, wiring a dashboard to real data, or choosing the right tool and moving on.",
    ],
    tags: ["React", "TypeScript", "Node", "SQL"],
    arsenal: [
      { name: "HTML / CSS", icon: "html-css" },
      { name: "JavaScript", icon: "javascript-icon" },
      { name: "TypeScript", icon: "typescript-icon" },
      { name: "React", icon: "react-icon" },
      { name: "Next.js", icon: "next-icon" },
      { name: "Angular", icon: "angular-icon" },
      { name: "Tailwind CSS", icon: "tailwind-icon" },
      { name: "Redux", icon: "redux-icon" },
      { name: "Storybook", icon: "storybook-icon" },
      { name: "Node.js" },
      { name: "SQL" },
      { name: "Java / Spring Boot" },
    ],
    stats: [
      { label: "Versatility", value: 9 },
      { label: "Architecture", value: 8 },
      { label: "Frontend", value: 9 },
      { label: "Backend", value: 7 },
      { label: "Product Sense", value: 8 },
    ],
    transition: "slash",
    signature: "A sword slash cuts the screen in two along a diagonal; the halves slide apart to reveal the class page.",
    artAlt: "The Paladin: an adventurer in steel-blue armor with a sword, shield and utility gear.",
  },
  {
    id: "archivist",
    slot: 2,
    name: "The Archivist",
    shortName: "Archivist",
    discipline: "Database Engineer",
    archetype: "The Vault-Keeper",
    tagline: "Models the domain. Guards the vault. Answers the query.",
    mission: [
      "Data modeling, warehousing and graph data. The Archivist treats a database as the computational model of a domain, not just somewhere to keep rows: schemas that mean something, relationships that can be traversed, queries that answer real questions.",
      "The vault holds a data warehouse, a graph of a human life, and an engine that models an entire story: three different ways to teach a database how the world fits together.",
    ],
    tags: ["PostgreSQL", "SQL", "Data Warehousing", "Graph Modeling"],
    arsenal: [
      { name: "PostgreSQL" },
      { name: "SQL" },
      { name: "Python" },
      { name: "Data Warehousing" },
      { name: "ETL / ELT" },
      { name: "Dimensional Modeling" },
      { name: "Graph Queries" },
      { name: "Schema Design" },
    ],
    stats: [
      { label: "Data Modeling", value: 9 },
      { label: "Querying", value: 8 },
      { label: "Architecture", value: 8 },
      { label: "Analytics", value: 7 },
      { label: "Systems Thinking", value: 9 },
    ],
    transition: "fracture",
    signature: "The drill hits the ground, the floor fractures and amber light pours through; the visitor drops into the data vault.",
    artAlt: "The Archivist: a steampunk vault engineer with a mechanical drill arm, query lantern and goggles.",
  },
  {
    id: "oracle",
    slot: 3,
    name: "The Oracle",
    shortName: "Oracle",
    discipline: "AI Engineer",
    archetype: "The Cybernetic Seer",
    tagline: "Retrieval, reasoning and a shard that thinks for itself.",
    mission: [
      "AI systems engineering: retrieval pipelines, knowledge and personality systems, and multi-agent orchestration. The Oracle is about building the system around the model, not just prompting one.",
      "The portfolio here follows an arc: a RAG system that turns a corpus into an interrogable knowledge base, an instance generator that builds an AI around a subject, and a command center that routes work between specialized agents.",
    ],
    tags: ["RAG", "Embeddings", "Agents", "Orchestration"],
    arsenal: [
      { name: "Retrieval-Augmented Generation" },
      { name: "Embeddings & Vector Search" },
      { name: "LLM APIs" },
      { name: "Agent Orchestration" },
      { name: "Tool Use" },
      { name: "Prompt & Persona Design" },
      { name: "Python" },
      { name: "TypeScript" },
    ],
    stats: [
      { label: "Retrieval", value: 8 },
      { label: "Reasoning", value: 7 },
      { label: "Agents", value: 8 },
      { label: "Orchestration", value: 7 },
      { label: "AI Systems", value: 8 },
    ],
    transition: "network",
    signature: "The AI shard splits into fragments that form a neural network expanding across the screen; the class page materializes inside it.",
    artAlt: "The Oracle: a gunmetal-armored cybernetic operative with a visor and a floating crystalline AI shard.",
  },
  {
    id: "courier",
    slot: 4,
    name: "The Courier",
    shortName: "Courier",
    discipline: "Mobile Engineer",
    archetype: "The Field Operative",
    tagline: "Fast, portable and always in your pocket.",
    mission: [
      "Mobile engineering across native, cross-platform and progressive web apps, including device features like the camera. The Courier is about software that travels: small, quick to launch and comfortable offline.",
      "Four missions cover the ground: a native app template, a full native product, a PWA template, and a camera-driven form-analysis app.",
    ],
    tags: ["Native", "PWA", "Camera / Vision", "Offline-first"],
    arsenal: [
      { name: "Native Mobile" },
      { name: "Progressive Web Apps" },
      { name: "Camera & Computer Vision" },
      { name: "Offline-first Design" },
      { name: "Responsive UX" },
      { name: "TypeScript" },
    ],
    stats: [
      { label: "UX", value: 8 },
      { label: "Performance", value: 7 },
      { label: "Portability", value: 9 },
      { label: "Device Integration", value: 7 },
      { label: "Rapid Iteration", value: 8 },
    ],
    transition: "hud",
    signature: "The spy watch activates, a HUD unfolds and gadgets deploy; the HUD expands until it becomes the mobile portfolio.",
    artAlt: "The Courier: a lean tactical field operative with a spy watch, apple-shaped gadgets and a small robot companion.",
  },
  {
    id: "worldbuilder",
    slot: 5,
    name: "The Worldbuilder",
    shortName: "Worldbuilder",
    discipline: "Game Developer",
    archetype: "The World Architect",
    tagline: "Draws a line, and a world assembles around it.",
    mission: [
      "Game development: interactive narrative, game systems and real-time networking. The Worldbuilder designs the rules and structures a world runs on, then builds the thing you can actually play.",
      "Current work spans a visual novel, a strategy / builder game and a multiplayer game, one project each for story, systems and networking.",
    ],
    tags: ["Game Systems", "Narrative", "Simulation", "Networking"],
    arsenal: [
      { name: "Game Systems Design" },
      { name: "Interactive Narrative" },
      { name: "Simulation" },
      { name: "Real-time Networking" },
      { name: "TypeScript" },
    ],
    stats: [
      { label: "Systems Design", value: 8 },
      { label: "Gameplay", value: 7 },
      { label: "Narrative", value: 8 },
      { label: "Simulation", value: 6 },
      { label: "Networking", value: 6 },
    ],
    transition: "construct",
    signature: "The architect draws a line; a structure appears, then another. The environment constructs itself and the camera flies through it.",
    artAlt: "The Worldbuilder: a cosmic architect holding a compass, surrounded by floating world fragments.",
  },
];

export const characterById = Object.fromEntries(characters.map((c) => [c.id, c])) as Record<ClassId, Character>;
