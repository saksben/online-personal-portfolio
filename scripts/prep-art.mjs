// Normalizes raw character renders onto a shared canvas and separates
// free-floating props (shard, fragments, robot, etc.) from the body so they
// can be animated as independent layers.
//
// For each class, this:
//   1. Finds the union bbox of every opaque pixel and derives one shared
//      scale/placement transform (same canvas size, scale and baseline for
//      every character, regardless of pose).
//   2. Labels connected components of opaque pixels. The largest is "the
//      body" (plus anything it's physically holding/wearing); any other
//      sufficiently large component is a free-floating prop.
//   3. Writes idle.png with the prop pixels erased (so nothing is drawn
//      twice), plus one prop-<n>.png per floating element, all on identical
//      1200x2000 canvases so they stack in perfect register as CSS layers.
//      Each prop also gets a transform-origin (% of canvas) for CSS
//      rotate/orbit animations, in props.json.
//
// Usage: node scripts/prep-art.mjs [--out <dir>]
// Reads  src/assets/art/<class>/<class>.png
// Writes <outDir>/<class>/idle.png, <outDir>/<class>/props/prop-<n>.png,
//        <outDir>/<class>/props.json
// Defaults to scripts/.art-staging, NOT the live asset folder.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CANVAS_W, CANVAS_H, findOpaqueBBox, computeTransform, labelComponents } from "./art-lib.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CLASSES = ["paladin", "archivist", "oracle", "courier", "worldbuilder"];
const MIN_PROP_AREA = 1000; // raw px; filters antialiasing specks and tiny details
const MAX_PROPS = 8;

const outArg = process.argv.indexOf("--out");
const outDir = outArg !== -1 ? path.resolve(process.argv[outArg + 1]) : path.join(ROOT, "scripts", ".art-staging");

async function prepOne(id) {
  const srcPath = path.join(ROOT, "src", "assets", "art", id, `${id}.png`);
  const img = sharp(srcPath);
  const meta = await img.metadata();
  if (!meta.hasAlpha) throw new Error(`${id}: source has no alpha channel`);

  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const bbox = findOpaqueBBox(data, width, height, channels);
  const t = computeTransform(bbox);

  const { labels, components } = labelComponents(data, width, height, channels);
  components.sort((a, b) => b.count - a.count);
  const body = components[0];
  const propCandidates = components.slice(1).filter((c) => c.count >= MIN_PROP_AREA).slice(0, MAX_PROPS);

  // Raw-space -> shared-canvas-space, matching computeTransform's crop+scale+placement.
  const toCanvas = (x, y) => ({
    x: t.left + (x - t.bbox.left) * t.scale,
    y: t.top + (y - t.bbox.top) * t.scale,
  });

  const destDir = path.join(outDir, id);
  const propsDir = path.join(destDir, "props");
  await mkdir(propsDir, { recursive: true });

  // Erase only the components that are being kept as their own layer below; every
  // other component (body, and any candidate too small/plentiful to keep) stays in
  // idle.png so nothing visibly vanishes from the character.
  const keptIds = new Set(propCandidates.map((c) => c.id));
  const bodyOnly = Buffer.from(data);
  for (let i = 0; i < width * height; i++) {
    if (keptIds.has(labels[i])) bodyOnly[i * channels + 3] = 0;
  }
  const bodyCrop = await sharp(bodyOnly, { raw: { width, height, channels } })
    .extract({ left: t.bbox.left, top: t.bbox.top, width: t.cropW, height: t.cropH })
    .resize(t.resizedW, t.resizedH, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  await sharp({ create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: bodyCrop, left: t.left, top: t.top }])
    .png()
    .toFile(path.join(destDir, "idle.png"));

  const manifest = [];
  for (let i = 0; i < propCandidates.length; i++) {
    const c = propCandidates[i];
    const propOnly = Buffer.from(data);
    for (let p = 0; p < width * height; p++) {
      if (labels[p] !== c.id) propOnly[p * channels + 3] = 0;
    }
    const propCrop = await sharp(propOnly, { raw: { width, height, channels } })
      .extract({ left: t.bbox.left, top: t.bbox.top, width: t.cropW, height: t.cropH })
      .resize(t.resizedW, t.resizedH, { kernel: "lanczos3" })
      .png()
      .toBuffer();
    const file = `prop-${i}.png`;
    await sharp({ create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: propCrop, left: t.left, top: t.top }])
      .png()
      .toFile(path.join(propsDir, file));

    const centroid = toCanvas(c.centroidX, c.centroidY);
    const bb = {
      left: toCanvas(c.bbox.left, c.bbox.top).x,
      top: toCanvas(c.bbox.left, c.bbox.top).y,
      right: toCanvas(c.bbox.right, c.bbox.bottom).x,
      bottom: toCanvas(c.bbox.right, c.bbox.bottom).y,
    };
    manifest.push({
      file,
      originPct: { x: +((centroid.x / CANVAS_W) * 100).toFixed(1), y: +((centroid.y / CANVAS_H) * 100).toFixed(1) },
      boxPct: {
        left: +((bb.left / CANVAS_W) * 100).toFixed(1),
        top: +((bb.top / CANVAS_H) * 100).toFixed(1),
        width: +(((bb.right - bb.left) / CANVAS_W) * 100).toFixed(1),
        height: +(((bb.bottom - bb.top) / CANVAS_H) * 100).toFixed(1),
      },
      rawArea: c.count,
    });
  }
  await writeFile(path.join(destDir, "props.json"), JSON.stringify(manifest, null, 2));

  console.log(
    `${id}: body ${body.count}px, ${propCandidates.length} prop(s) kept of ${components.length - 1} candidate component(s) -> ${path.relative(ROOT, destDir)}`,
  );
}

for (const id of CLASSES) {
  await prepOne(id);
}
