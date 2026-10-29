// Normalizes raw character renders onto a shared canvas: trims to the opaque
// bounding box (ignoring soft background glow), scales to a consistent visual
// height, and centers with a fixed foot baseline. Matches the spec in ART-ASSETS.md.
//
// Usage: node scripts/prep-art.mjs [--out <dir>]
// Reads  src/assets/art/<class>/<class>.png
// Writes <outDir>/<class>/idle.png (defaults to scripts/.art-staging, NOT the live asset folder)
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const CLASSES = ["paladin", "archivist", "oracle", "courier", "worldbuilder"];

const CANVAS_W = 1200;
const CANVAS_H = 2000;
const MAX_FIGURE_H = Math.round(CANVAS_H * 0.88); // visual height target
const MAX_FIGURE_W = Math.round(CANVAS_W * 0.9); // 5% side margin each side
const FOOT_Y = Math.round(CANVAS_H * 0.96); // feet ~4% above the bottom edge
const OPAQUE_THRESHOLD = 100; // alpha above this counts as "solid content" for the bbox; excludes soft glow halos
const BBOX_PAD = 6; // px of raw-image padding kept around the detected bbox, so AA edges don't get cut

const outArg = process.argv.indexOf("--out");
const outDir = outArg !== -1 ? path.resolve(process.argv[outArg + 1]) : path.join(ROOT, "scripts", ".art-staging");

function findOpaqueBBox(data, width, height, channels) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + 3];
      if (a > OPAQUE_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("no opaque pixels found");
  return {
    left: Math.max(0, minX - BBOX_PAD),
    top: Math.max(0, minY - BBOX_PAD),
    right: Math.min(width, maxX + BBOX_PAD),
    bottom: Math.min(height, maxY + BBOX_PAD),
  };
}

async function prepOne(id) {
  const srcPath = path.join(ROOT, "src", "assets", "art", id, `${id}.png`);
  const img = sharp(srcPath);
  const meta = await img.metadata();
  if (!meta.hasAlpha) throw new Error(`${id}: source has no alpha channel`);

  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bbox = findOpaqueBBox(data, info.width, info.height, info.channels);
  const cropW = bbox.right - bbox.left;
  const cropH = bbox.bottom - bbox.top;

  const scale = Math.min(MAX_FIGURE_H / cropH, MAX_FIGURE_W / cropW);
  const resizedW = Math.round(cropW * scale);
  const resizedH = Math.round(cropH * scale);

  const cropped = await sharp(srcPath)
    .extract({ left: bbox.left, top: bbox.top, width: cropW, height: cropH })
    .resize(resizedW, resizedH, { kernel: "lanczos3" })
    .toBuffer();

  const left = Math.round((CANVAS_W - resizedW) / 2);
  const top = FOOT_Y - resizedH;

  const destDir = path.join(outDir, id);
  await mkdir(destDir, { recursive: true });
  const destPath = path.join(destDir, "idle.png");

  await sharp({
    create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: cropped, left, top }])
    .png()
    .toFile(destPath);

  console.log(
    `${id}: raw bbox ${cropW}x${cropH} -> placed ${resizedW}x${resizedH} at (${left}, ${top}) -> ${path.relative(ROOT, destPath)}`,
  );
}

for (const id of CLASSES) {
  await prepOne(id);
}
