/**
 * Class-select transitions. Each effect gets the selector stage plus the chosen
 * slot's rectangle, builds a temporary `.tx-root` overlay, plays for roughly
 * 0.9–1.1s, and resolves while the overlay is left showing the class backdrop
 * (the class page covers itself with the same backdrop and fades it out; see
 * Base.astro). Everything is Web Animations API + plain DOM: no video, no WebGL.
 */
import type { ClassId, TransitionKind } from "@/data/characters";

export interface TransitionContext {
  kind: TransitionKind;
  classId: ClassId;
  /** The selector root; snapshotted for effects that tear the screen apart. */
  stage: HTMLElement;
  /** Bounding box of the chosen slot, in viewport coordinates. */
  origin: DOMRect;
}

type Effect = (ctx: TransitionContext, root: HTMLElement, backdrop: HTMLElement) => Promise<void>;

const SVG_NS = "http://www.w3.org/2000/svg";

// ─── Helpers ──────────────────────────────────────────────────────────────

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, parent?: Element) => {
  const node = document.createElement(tag);
  node.className = cls;
  parent?.append(node);
  return node;
};

const svgEl = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element) => {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  parent?.append(node);
  return node;
};

const fx = (parent: Element) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const svg = svgEl("svg", { class: "tx-fx", viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none" }, parent);
  return { svg, w, h };
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Run a Web Animation and resolve when it ends (or is cancelled). */
const play = (target: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) =>
  target
    .animate(keyframes, { fill: "both", ...options })
    .finished.then(() => undefined)
    .catch(() => undefined);

/** Stroke-draw a path/line/polyline via dash offset. */
const draw = (target: SVGGeometryElement, duration: number, delay = 0, easing = "cubic-bezier(.3,.7,.2,1)") => {
  target.setAttribute("pathLength", "1");
  target.style.strokeDasharray = "1";
  return play(target, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration, delay, easing });
};

/** Deterministic PRNG so a given viewport always produces the same shapes. */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** A clipped copy of the stage, aligned with the live page. */
const half = (parent: Element, stage: HTMLElement, clipPath: string) => {
  const wrap = el("div", "tx-half", parent);
  wrap.style.clipPath = clipPath;
  const snap = el("div", "tx-snap", wrap);
  snap.style.top = `${-window.scrollY}px`;
  snap.style.height = `${stage.offsetHeight}px`;
  const clone = stage.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.setAttribute("inert", "");
  clone.style.minHeight = "100%";
  snap.append(clone);
  return wrap;
};

const polygon = (pts: Array<[number, number]>) => `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(",")})`;

// ─── Paladin: the sword cuts the screen in two ────────────────────────────

const slash: Effect = async (ctx, root, backdrop) => {
  const { w, h } = { w: window.innerWidth, h: window.innerHeight };
  const top: [number, number] = [w * 0.72, 0];
  const bottom: [number, number] = [w * 0.28, h];

  const leftHalf = half(root, ctx.stage, polygon([[0, 0], top, bottom, [0, h]]));
  const rightHalf = half(root, ctx.stage, polygon([top, [w, 0], [w, h], bottom]));

  const { svg } = fx(root);
  const dx = bottom[0] - top[0];
  const dy = bottom[1] - top[1];
  const path = `M ${top[0] - dx * 0.06} ${top[1] - dy * 0.06} L ${bottom[0] + dx * 0.06} ${bottom[1] + dy * 0.06}`;
  const glow = svgEl("path", { d: path, class: "tx-glow-line", stroke: "var(--c-glow)", "stroke-width": 26, opacity: 0.55 }, svg);
  const core = svgEl("path", { d: path, class: "tx-glow-line", stroke: "#fff", "stroke-width": 5 }, svg);
  glow.style.filter = "blur(6px)";
  const flash = el("div", "tx-flash", root);

  // Wind-up, then the cut.
  await wait(140);
  await Promise.all([draw(glow, 230), draw(core, 210)]);

  // The halves slide apart along the slash's normal; light spills through.
  const len = Math.hypot(dx, dy);
  const nx = dy / len;
  const ny = -dx / len;
  const distance = Math.hypot(w, h);
  const ease = "cubic-bezier(.55,0,.85,.35)";
  const move = (sign: number, rot: number) => [
    { transform: "translate(0,0) rotate(0deg)" },
    { transform: `translate(${sign * nx * distance}px, ${sign * ny * distance}px) rotate(${rot}deg)` },
  ];
  await Promise.all([
    play(flash, [{ opacity: 0 }, { opacity: 0.85 }, { opacity: 0 }], { duration: 200 }),
    play(leftHalf, move(-1, -4), { duration: 560, easing: ease }),
    play(rightHalf, move(1, 4), { duration: 560, easing: ease }),
    play(backdrop, [{ filter: "brightness(2.4)" }, { filter: "brightness(1)" }], { duration: 560 }),
    play(svg, [{ opacity: 1 }, { opacity: 0 }], { duration: 320, delay: 120 }),
  ]);
};

// ─── Archivist: the floor fractures, amber light below ────────────────────

const fracture: Effect = async (ctx, root, backdrop) => {
  const { w, h } = { w: window.innerWidth, h: window.innerHeight };
  const impactX = ctx.origin.left + ctx.origin.width * 0.78;
  const crackY = Math.min(h * 0.88, Math.max(h * 0.45, ctx.origin.bottom - 46));

  // Jagged crack line across the whole viewport.
  const rand = rng(w * 7 + h);
  const points: Array<[number, number]> = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * (w + 40) - 20;
    points.push([x, crackY + (i % 2 ? 1 : -1) * (6 + rand() * 16)]);
  }
  const topPoly = polygon([[0, 0], [w, 0], ...[...points].reverse()]);
  const bottomPoly = polygon([...points, [w, h], [0, h]]);

  const shake = el("div", "tx-shake", root);
  shake.style.cssText = "position:absolute;inset:0";
  const topHalf = half(shake, ctx.stage, topPoly);
  const bottomHalf = half(shake, ctx.stage, bottomPoly);

  const { svg } = fx(root);
  const nearest = points.reduce((best, p, i) => (Math.abs(p[0] - impactX) < Math.abs(points[best][0] - impactX) ? i : best), 0);
  const toAttr = (pts: Array<[number, number]>) => pts.map((p) => p.join(",")).join(" ");
  const seams = [points.slice(nearest), points.slice(0, nearest + 1).reverse()].map((pts) =>
    svgEl("polyline", { points: toAttr(pts), class: "tx-line", stroke: "var(--c-accent)", "stroke-width": 4 }, svg),
  );
  seams.forEach((s) => (s.style.filter = "drop-shadow(0 0 10px var(--c-glow))"));

  // Impact burst.
  const burst = el("div", "tx-burst", root);
  burst.style.cssText = `position:absolute;left:${impactX - 160}px;top:${crackY - 160}px;width:320px;height:320px;border-radius:50%;opacity:0;` +
    "background:radial-gradient(closest-side,#fff,var(--c-accent) 35%,transparent)";

  await wait(120);
  await Promise.all([
    play(burst, [{ opacity: 0.95, transform: "scale(.2)" }, { opacity: 0, transform: "scale(1.6)" }], { duration: 320 }),
    play(shake, [
      { transform: "translate(0,0)" },
      { transform: "translate(-6px,5px)" },
      { transform: "translate(5px,-4px)" },
      { transform: "translate(-3px,3px)" },
      { transform: "translate(0,0)" },
    ], { duration: 260 }),
    ...seams.map((s) => draw(s, 260, 60, "cubic-bezier(.2,.8,.2,1)")),
  ]);

  // The world splits and the visitor drops into the vault.
  const ease = "cubic-bezier(.6,0,.9,.4)";
  await Promise.all([
    play(topHalf, [{ transform: "translateY(0)" }, { transform: `translateY(${-h * 0.5}px)` }], { duration: 540, easing: ease }),
    play(bottomHalf, [{ transform: "translateY(0) rotate(0)" }, { transform: `translateY(${h}px) rotate(2deg)` }], { duration: 540, easing: ease }),
    play(backdrop, [{ filter: "brightness(2)" }, { filter: "brightness(1)" }], { duration: 600 }),
    play(svg, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 200 }),
  ]);
};

// ─── Oracle: the shard bursts into a neural network ───────────────────────

const network: Effect = async (ctx, root, backdrop) => {
  const { svg, w, h } = fx(root);
  const ox = ctx.origin.left + ctx.origin.width * 0.8;
  const oy = ctx.origin.top + ctx.origin.height * 0.28;
  const reach = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy)) + 40;

  backdrop.style.clipPath = `circle(0px at ${ox}px ${oy}px)`;

  // Jittered grid of nodes.
  const rand = rng(w + h * 3);
  const cols = w < 640 ? 5 : 9;
  const rows = w < 640 ? 8 : 5;
  const nodes: Array<[number, number]> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push([((c + 0.5 + (rand() - 0.5) * 0.7) / cols) * w, ((r + 0.5 + (rand() - 0.5) * 0.7) / rows) * h]);
    }
  }

  // Connect each node to its two nearest neighbours.
  const edges = new Set<string>();
  const edgeList: Array<[number, number]> = [];
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: Math.hypot(n[0] - m[0], n[1] - m[1]) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!edges.has(key)) {
          edges.add(key);
          edgeList.push([i, j]);
        }
      });
  });

  const lines = edgeList.map(([a, b], i) => {
    const line = svgEl("line", { x1: nodes[a][0], y1: nodes[a][1], x2: nodes[b][0], y2: nodes[b][1], class: "tx-line", stroke: i % 2 ? "var(--c-glow)" : "var(--c-accent)", "stroke-width": 1.5, opacity: 0.8 }, svg);
    return line;
  });
  const dots = nodes.map(([x, y], i) => {
    const dot = svgEl("circle", { cx: x, cy: y, r: 3 + (i % 3), class: "tx-node" }, svg);
    return dot;
  });
  const spark = svgEl("circle", { cx: ox, cy: oy, r: 10, class: "tx-node" }, svg);

  await Promise.all([
    play(spark, [{ opacity: 0, transform: "scale(.2)" }, { opacity: 1, transform: "scale(1.4)" }, { opacity: 0, transform: "scale(3)" }], { duration: 260 }),
    ...dots.map((dot, i) =>
      play(dot, [{ opacity: 0, transform: `translate(${ox - nodes[i][0]}px, ${oy - nodes[i][1]}px)` }, { opacity: 1, transform: "translate(0,0)" }], {
        duration: 420,
        delay: 120 + (i % 9) * 8,
        easing: "cubic-bezier(.15,.8,.25,1)",
      }),
    ),
    ...lines.map((line, i) => draw(line, 320, 340 + (i % 12) * 14)),
    play(backdrop, [{ clipPath: `circle(0px at ${ox}px ${oy}px)` }, { clipPath: `circle(${reach}px at ${ox}px ${oy}px)` }], {
      duration: 560,
      delay: 380,
      easing: "cubic-bezier(.6,0,.2,1)",
    }),
  ]);
  await play(svg, [{ opacity: 1 }, { opacity: 0.25 }], { duration: 120 });
};

// ─── Courier: the watch boots a HUD that becomes the page ─────────────────

const hud: Effect = async (ctx, root, backdrop) => {
  const { svg, w, h } = fx(root);
  const ox = ctx.origin.left + ctx.origin.width * 0.3;
  const oy = ctx.origin.top + ctx.origin.height * 0.52;
  const r = 26;

  backdrop.style.clipPath = `inset(${oy - r}px ${w - ox - r}px ${h - oy - r}px ${ox - r}px round 8px)`;
  const scan = el("div", "tx-scan", root);
  scan.style.opacity = "0";

  // Watch ping.
  const rings = [0, 1].map(() => svgEl("circle", { cx: ox, cy: oy, r: 8, fill: "none", stroke: "var(--c-accent)", "stroke-width": 2, class: "tx-line" }, svg));
  // Concentric HUD frames that unfold from the wrist.
  const frames = [0, 1, 2, 3].map((i) => {
    const f = el("div", "tx-hud-frame", root);
    f.style.cssText += `left:${2 + i * 4.5}vw;right:${2 + i * 4.5}vw;top:${3 + i * 6}vh;bottom:${3 + i * 6}vh;transform-origin:${ox}px ${oy}px;`;
    return f;
  });
  const label = el("div", "tx-hud-text", root);
  label.textContent = "MOBILE UNIT ONLINE";
  label.style.cssText += "left:50%;top:50%;translate:-50% -50%;white-space:nowrap";

  await Promise.all([
    ...rings.map((ring, i) => play(ring, [{ r: 8, opacity: 1 }, { r: 60, opacity: 0 }], { duration: 380, delay: i * 120 })),
    ...frames.map((f, i) =>
      play(f, [{ opacity: 0, transform: "scale(.02)" }, { opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.2)" }], {
        duration: 620,
        delay: 140 + i * 70,
        easing: "cubic-bezier(.2,.8,.2,1)",
      }),
    ),
    play(label, [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: 560, delay: 260 }),
    play(backdrop, [{ clipPath: backdrop.style.clipPath }, { clipPath: `inset(0px 0px 0px 0px round 0px)` }], {
      duration: 520,
      delay: 300,
      easing: "cubic-bezier(.7,0,.2,1)",
    }),
    play(scan, [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 520, delay: 300 }),
  ]);
};

// ─── Worldbuilder: lines draw a structure, the camera flies through ───────

const construct: Effect = async (ctx, root, backdrop) => {
  const { svg, w, h } = fx(root);
  const cx = w / 2;
  const cy = h / 2;
  backdrop.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;

  const g = svgEl("g", {}, svg);
  g.style.transformOrigin = `${cx}px ${cy}px`;

  // The first stroke: the compass draws a line from the character toward the horizon.
  const ox = ctx.origin.left + ctx.origin.width * 0.78;
  const oy = ctx.origin.top + ctx.origin.height * 0.55;
  const first = svgEl("path", { d: `M ${ox} ${oy} L ${cx} ${cy}`, class: "tx-line", stroke: "#f5c542", "stroke-width": 3 }, g);

  // Nested rectangles: a corridor receding to the vanishing point.
  const rects: SVGGeometryElement[] = [];
  const corners: Array<[number, number]> = [];
  const ratio = 0.6;
  for (let i = 0; i < 6; i++) {
    const rw = w * 0.46 * Math.pow(ratio, i);
    const rh = h * 0.42 * Math.pow(ratio, i);
    rects.push(
      svgEl("rect", { x: cx - rw, y: cy - rh, width: rw * 2, height: rh * 2, class: "tx-line", stroke: i % 2 ? "var(--c-accent)" : "var(--c-glow)", "stroke-width": 2 }, g),
    );
    if (i === 0) corners.push([cx - rw, cy - rh], [cx + rw, cy - rh], [cx + rw, cy + rh], [cx - rw, cy + rh]);
  }
  const diagonals = corners.map(([x, y]) => svgEl("path", { d: `M ${x} ${y} L ${cx} ${cy}`, class: "tx-line", stroke: "var(--c-glow)", "stroke-width": 1.5, opacity: 0.8 }, g));

  await Promise.all([
    draw(first, 220),
    ...rects.map((rc, i) => draw(rc, 200, 160 + i * 70)),
    ...diagonals.map((d) => draw(d, 260, 420)),
  ]);

  // Camera fly-through: the structure rushes past while the class world opens up.
  await Promise.all([
    play(g, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(9)", opacity: 0 }], { duration: 420, easing: "cubic-bezier(.6,0,.9,.5)" }),
    play(backdrop, [{ clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${Math.hypot(w, h)}px at ${cx}px ${cy}px)` }], {
      duration: 420,
      easing: "cubic-bezier(.5,0,.4,1)",
    }),
  ]);
};

// ─── Public API ───────────────────────────────────────────────────────────

const effects: Record<TransitionKind, Effect> = { slash, fracture, network, hud, construct };

/** Play the class's signature transition. Leaves the overlay in place until navigation. */
export async function runTransition(ctx: TransitionContext): Promise<void> {
  const root = el("div", "tx-root");
  root.dataset.class = ctx.classId;
  root.setAttribute("aria-hidden", "true");
  const backdrop = el("div", "tx-backdrop", root);
  // Effects set their own initial state synchronously, before the first paint.
  document.body.append(root);
  await effects[ctx.kind](ctx, root, backdrop);
}

/** Remove any overlay (used when the page is restored from the back/forward cache). */
export function cleanupTransition() {
  document.querySelectorAll(".tx-root").forEach((node) => node.remove());
}
