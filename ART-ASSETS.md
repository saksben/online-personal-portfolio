# Art assets

The site ships with designed placeholder silhouettes (`src/components/PlaceholderFigure.astro`). Final art replaces them **by dropping files into a folder — no code changes**. `src/lib/assets.ts` looks for the files below at build time; any that exist are used, any that don't fall back to the placeholder.

**Current status:** all 5 `idle` renders are in (AI-generated, normalized with `scripts/prep-art.mjs`, see below). `hover`/`selected` aren't made yet, so `idle` is used for every state on all 5 characters.

## Normalizing raw AI renders

Raw ChatGPT exports land as `src/assets/art/<class>/<class>.png` and typically aren't ready to drop in directly: inconsistent canvas use, no shared scale/baseline across characters, and (for two of the five, historically) a baked-in backdrop instead of real alpha transparency. Before using one, confirm it actually has alpha (`sharp` metadata, `hasAlpha: true`, corner pixels at alpha 0) — if ChatGPT baked in a checkerboard or solid background instead, re-prompt it for "isolated character on a fully transparent PNG background, no backdrop, no checkerboard pattern."

Once a raw render has real transparency, run:

```sh
node scripts/prep-art.mjs
```

This reads every `src/assets/art/<class>/<class>.png`, finds the opaque bounding box (ignoring soft glow halos below the alpha threshold), scales it to a shared visual size, and centers it on a common 1200×2000 canvas with a fixed foot baseline — the same treatment for every character regardless of pose, so a kneeling or floating pose doesn't need to change, only its placement on the canvas. Output goes to `scripts/.art-staging/<class>/idle.png` (gitignored) for review before copying into `src/assets/art/<class>/idle.png`.

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

- `slash`, `construct` and `fracture` originate from the chosen slot's rectangle; `network` fires from ~85% across / 16% down the slot (the shard), `hud` from ~60% across / 30% down (the watch), `construct` from ~18% / 35% (the compass), `fracture` from the bottom of the slot at ~8% across (the drill). These were measured against the current AI-generated art (see ART-ASSETS.md's "normalizing raw AI renders" above); if new art moves a prop, re-measure and adjust the ratios at the top of the matching effect in `src/scripts/transitions.ts`.

## Floating props (independent layers)

`scripts/prep-art.mjs` also separates free-floating elements (Oracle's shard, Worldbuilder's fragments, Courier's robot and HUD cards, Archivist's hologram and spare lantern) from the body, using connected-component labeling on the alpha mask: the largest opaque blob is "the body" (plus anything it's physically holding, which stays attached), and any other blob above ~3000px is exported as its own `props/prop-<n>.png` on the same 1200×2000 canvas as `idle.png`, with `props.json` recording each one's centroid (`originPct`, used as the CSS `transform-origin` so rotation pivots on the prop, not the canvas corner).

`src/lib/assets.ts`'s `characterProps()` reads this automatically — no wiring needed per character. `CharacterArt.astro` renders each as an always-visible layer with a looping bob/drift/orbit animation (`prefers-reduced-motion` already freezes all animation durations site-wide, see `global.css`). Paladin has no floating props (everything is worn/held gear), which is expected — the `fracture`/`network`/`hud`/`construct` transitions' origin points still come from the slot rectangle, not from a specific prop file.

A prop that's a candidate (above the size floor) but not in the top `MAX_PROPS` is left alone — it stays baked into `idle.png` rather than being half-erased, so nothing visibly disappears from the character.

**Not yet done:** `hover`/`selected` art, and body-tweened motion between states (see the repo's commit history / conversation notes for why a crossfade was chosen over interpolated poses — in short, independently-generated AI art doesn't share rigging, so tweening would warp rather than animate). Props are currently positioned against the `idle` pose only; if `hover`/`selected` art arrives with a different pose, re-run `prep-art.mjs` against whichever render should carry the props, or accept the slight misalignment during the hover/selected crossfade.

## Generation workflow

1. Generate design sheets first (full-body, three-quarter, silhouette, equipment close-ups, environment, effect) using the master prompt + per-class brief.
2. Pick one definitive design per class, then generate the transparent `idle`/`hover`/`selected` renders from it.
3. Generate `bg` from the design sheet's environment concept.
4. Drop files in `src/assets/art/<class>/`, run `npm run build`, check the selector and class page.
