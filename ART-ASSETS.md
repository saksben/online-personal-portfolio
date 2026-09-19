# Art assets

The site ships with designed placeholder silhouettes (`src/components/PlaceholderFigure.astro`). Final art replaces them **by dropping files into a folder — no code changes**. `src/lib/assets.ts` looks for the files below at build time; any that exist are used, any that don't fall back to the placeholder.

## File layout

```
src/assets/art/
  paladin/      idle.png   hover.png   selected.png   bg.jpg
  archivist/    idle.png   hover.png   selected.png   bg.jpg
  oracle/       idle.png   hover.png   selected.png   bg.jpg
  courier/      idle.png   hover.png   selected.png   bg.jpg
  worldbuilder/ idle.png   hover.png   selected.png   bg.jpg
```

Extensions `png`, `webp`, `jpg`, `jpeg` and `avif` all work. Astro optimizes them at build time.

| File | Required | Used for | Spec |
| --- | --- | --- | --- |
| `idle` | **yes** (nothing else is used without it) | Select-screen slot when not hovered; class page hero | Transparent PNG/WebP, full body head-to-feet, 3:5 portrait canvas (e.g. 1200×2000), character centered, feet ~4% above the bottom edge, ~5% side margin so props/effects don't clip |
| `hover` | optional | Slot while hovered/focused (replaces `idle`) | Same canvas and **same foot position** as `idle`. Ready pose, weapon/prop raised, effect lit |
| `selected` | optional | Slot while the transition plays (replaces `hover`) | Same canvas. Peak-action pose (the sword swing, drill strike, etc.) |
| `bg` | optional | Class page hero background (behind the character, under a color wash) | 16:9, ≥1920×1080, JPG/WebP. Environment for the class. Keep the left third calmer, since the character sits there |

If `hover`/`selected` don't exist, `idle` is used for every state.

**Consistency rules (all 15 character files):** same canvas ratio, same baseline, same scale relative to the canvas (a visual height of roughly 88% of the canvas), transparent background, no baked-in shadow (the site draws the pedestal/glow).

## Per-class briefs

The design source of truth is the character bible. Below is what each class's art must communicate; `src/data/characters.ts` holds the matching alt text.

| Class id | Discipline | Palette | Signature elements | Signature transition (already built in code) |
| --- | --- | --- | --- | --- |
| `paladin` | Full-stack | steel blue, navy, silver, muted gold, dark leather | Sword + compact shield, pouches/rope/tools; practical adventurer armor. Not Link/Zelda | `slash`: sword cuts the screen diagonally; halves slide apart |
| `archivist` | Database | deep amber, brass, copper, iron, slate | Mechanical drill arm, query lantern, goggles on forehead, glowing amber schema runes | `fracture`: floor cracks, amber light, drops into the vault |
| `oracle` | AI | black, gunmetal, cyan, violet | Visor + cybernetic armor; **AI shard** hovering beside him (should be its own layer if possible, see below) | `network`: shard bursts into a neural network that expands over the screen |
| `courier` | Mobile | charcoal, black, emerald, silver, white | Spy watch, tactical handheld, apple-shaped gadgets, small robot companions | `hud`: watch boots a HUD that expands to become the page |
| `worldbuilder` | Game | violet, cyan, magenta, gold, deep blue, white | Architect's compass, floating world fragments, geometric portals | `construct`: lines draw a structure, camera flies through |

The placeholder silhouettes show the intended prop placement for each class (e.g. sword on the right, shield on the left; shard upper-right of the Oracle; compass on the right for the Worldbuilder). Match those positions where practical so the transitions' origin points still line up:

- `slash`, `construct` and `fracture` originate from the chosen slot's rectangle; `network` fires from ~80% across / 28% down the slot (the shard), `hud` from ~30% across / 52% down (the watch), `construct` from ~78% / 55% (the compass), `fracture` from the bottom of the slot at ~78% across (the drill). If the real art puts those props elsewhere, adjust the ratios at the top of the matching effect in `src/scripts/transitions.ts`.

## Not yet wired (future layers)

The plan calls for layered assets (base + weapon + effect, animated with transforms). The current build uses one image per state. If you generate separate layers later, the natural extension points are:

- **Oracle AI shard** as its own transparent PNG, so it can orbit and react to the cursor.
- **Props / effects** (2–4 props, 1–3 effects per character) as overlays on the slot.
- **Transition art** (e.g. a slash streak sprite) as optional inputs to the existing effects.

None of these are required for launch; the code-driven transitions already work without them.

## Generation workflow

1. Generate design sheets first (full-body, three-quarter, silhouette, equipment close-ups, environment, effect) using the master prompt + per-class brief.
2. Pick one definitive design per class, then generate the transparent `idle`/`hover`/`selected` renders from it.
3. Generate `bg` from the design sheet's environment concept.
4. Drop files in `src/assets/art/<class>/`, run `npm run build`, check the selector and class page.
