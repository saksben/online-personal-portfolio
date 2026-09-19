# Benjamin Saks: portfolio

A character-select-screen portfolio. Pick a class (Full-Stack, Database, AI, Mobile, Game) to open a dossier of projects, each linking to its GitHub repo and a StackBlitz demo.

Live at **https://www.saksben.com**

**Stack:** Astro · TypeScript · Tailwind CSS v4 · a little client JS · GitHub Pages. No server.

## Layout

```
src/
  data/         characters.ts · projects.ts · resume.ts · site.ts   ← all content lives here
  pages/        index (selector) · [slug] (class dossier) · resume · 404
  components/   CharacterArt · PlaceholderFigure · ProjectCard · StatBars · Section
  scripts/      select.ts (selector behavior) · transitions.ts (the five class transitions)
  styles/       global.css (palettes, shared UI) · select.css · transitions.css
  assets/       art/<class>/ (final character art) · projects/ · skill-icons/
```

## Docs

- [ART-ASSETS.md](ART-ASSETS.md): exact files needed to replace the placeholder art
- [PROJECTS.md](PROJECTS.md): project/demo links still to supply, and copy to review
- [DEPLOYMENT.md](DEPLOYMENT.md): GitHub Pages setup and commands

## Develop

```sh
npm install
npm run dev
npm run build   # astro check + build
npm run lint
```

## How the transitions work

Choosing a class runs `runTransition()` in `src/scripts/transitions.ts`: a `.tx-root` overlay built with plain DOM + the Web Animations API (no video/WebGL), ~1s. Paladin's is a diagonal slash that splits a snapshot of the screen into two clipped halves that slide apart. Then the page navigates and the class page covers itself with the same backdrop and fades it out, so the handoff is seamless. `prefers-reduced-motion` skips straight to navigation, and every slot is a real link, so it all works without JavaScript.

Project repositories stay independent; this repo only points at them.
