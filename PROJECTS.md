# Projects and demo links

All project data lives in one file: [`src/data/projects.ts`](src/data/projects.ts). To make a card link out, fill in the field. No component changes needed. Empty fields render as a disabled "Source · soon" / "Demo · soon" button, so nothing links to a repo that doesn't exist yet.

```ts
{
  slug: "rag-system",
  status: "prototype",                       // concept | in-development | prototype | complete
  repo: "https://github.com/saksben/rag-system",
  stackblitz: "https://stackblitz.com/edit/…", // a purpose-built demo, not necessarily the full repo
  live: "https://…",                          // optional hosted demo
  image: "rag-system",                        // optional; file src/assets/projects/rag-system.png
}
```

Cards are grouped on each class page into **Completed missions** (`status: "complete"`) and **Quest board** (everything else).

## Already linked (carried over from the previous site)

| Project | Class | Source | Demo |
| --- | --- | --- | --- |
| Finance Tracker | Paladin | `saksben/finance-tracker` | StackBlitz `stackblitz-starters-gk312c` |
| Moon.io Component Design System | Paladin | `saksben/moon-design-system` | Chromatic (live) |
| Interactive World Map | Paladin | `saksben/d280-javascript-programming` | StackBlitz `stackblitz-starters-neegxb` |
| Web Inventory System | Paladin | `saksben/d287-java-frameworks` | none (Spring Boot can't run in a browser; card says so) |

The old site's "Online Portfolio" entry was dropped because this site replaces it.

Worth checking: the previous site pointed at `stackblitz-starters-…` starter URLs; confirm they still open.

## Still to supply

Expected repo names come from the project plan. Repos are **not linked until you add the URL**.

| Class | Project | `slug` (expected repo) | Repo | StackBlitz | Notes for the demo |
| --- | --- | --- | --- | --- | --- |
| Paladin | SaaS Template | `saas-template` | ☐ | ☐ | |
| Paladin | Skill Tree of You | `skill-tree-of-you` | ☐ | ☐ | |
| Paladin | Aura Compiler | `aura-compiler` | ☐ | ☐ | |
| Archivist | Data Warehouse | `data-warehouse` | ☐ | ☐ | Needs a self-contained sample dataset that runs in-browser |
| Archivist | Constellation of a Life | `constellation-of-a-life` | ☐ | ☐ | Demo variant: same UI, in-memory graph instead of Postgres |
| Archivist | Storytelling Engine | `storytelling-engine` | ☐ | ☐ | |
| Oracle | RAG Knowledge System | `rag-system` | ☐ | ☐ | Demo needs a small bundled corpus and either canned responses or bring-your-own-key |
| Oracle | AI Instance Generator | `ai-instance-generator` | ☐ | ☐ | Same API-key consideration |
| Oracle | AI Command Center | `ai-command-center` | ☐ | ☐ | Same API-key consideration |
| Courier | Native App Template | `native-app-template` | ☐ | ☐ | Native apps can't run in StackBlitz; use a web preview, Expo Snack, or screenshots |
| Courier | Todoist-style App | `todoist-clone` | ☐ | ☐ | As above |
| Courier | PWA Template | `pwa-template` | ☐ | ☐ | Good StackBlitz fit |
| Courier | Weight / Form App | `weight-form-app` | ☐ | ☐ | Camera access needs a live-hosted demo |
| Worldbuilder | Dracula Visual Novel | `dracula-visual-novel` | ☐ | ☐ | |
| Worldbuilder | Strategy / Builder Game | `strategy-game` | ☐ | ☐ | |
| Worldbuilder | Multiplayer Game | `multiplayer-game` | ☐ | ☐ | Real-time networking needs a hosted server for a true demo |

## Placeholder copy to review

The one-line summaries and tech tags for the **16 planned projects** were written from the project matrix (capability column and the chatgpt plan's descriptions), not from the actual repos. Please read each and correct anything that doesn't match what you built. The same goes for the class **mission-profile** text, **arsenal** lists (only Paladin's are drawn from your previous site) and **stat** values in `src/data/characters.ts`.

## Screenshots

Put `<name>.png` in `src/assets/projects/` and set `image: "<name>"`. Cards without one show a generated placeholder (initials on the class backdrop). Existing: `financial-tracker`, `moon-design-system`, `interactive-world-map`, `web-inventory-system`, `online-portfolio` (unused).

## Other things only you can supply

- **Employment history:** `experience: []` in `src/data/resume.ts`. The "Field experience" sections appear automatically once entries exist (with a `classes` list controlling which class pages show each entry). Nothing was invented.
- **Education institutions / years** (optional): same file.
- **Contact:** the form on `/resume/#contact` posts to your existing Formspree endpoint (`src/data/site.ts`).
