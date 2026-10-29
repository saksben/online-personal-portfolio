// Shared geometry for normalizing raw AI character renders onto a common
// canvas. Used by prep-art.mjs (body) and extract-props.mjs (floating props),
// which must agree on the same transform so layers stack in register.
export const CANVAS_W = 1200;
export const CANVAS_H = 2000;
export const MAX_FIGURE_H = Math.round(CANVAS_H * 0.88);
export const MAX_FIGURE_W = Math.round(CANVAS_W * 0.9);
export const FOOT_Y = Math.round(CANVAS_H * 0.96);
export const OPAQUE_THRESHOLD = 100;
export const BBOX_PAD = 6;

/** Bounding box over every opaque pixel (ignores soft glow below the threshold). */
export function findOpaqueBBox(data, width, height, channels) {
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

/** The shared scale/placement for a raw image's union bbox onto the shared canvas. */
export function computeTransform(bbox) {
  const cropW = bbox.right - bbox.left;
  const cropH = bbox.bottom - bbox.top;
  const scale = Math.min(MAX_FIGURE_H / cropH, MAX_FIGURE_W / cropW);
  const resizedW = Math.round(cropW * scale);
  const resizedH = Math.round(cropH * scale);
  const left = Math.round((CANVAS_W - resizedW) / 2);
  const top = FOOT_Y - resizedH;
  return { bbox, cropW, cropH, scale, resizedW, resizedH, left, top };
}

/**
 * 8-connected component labeling over the opaque mask. Returns one entry per
 * component: pixel count, bbox, and centroid, all in raw-image pixel space.
 */
export function labelComponents(data, width, height, channels) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = data[i * channels + 3] > OPAQUE_THRESHOLD ? 1 : 0;
  }
  const labels = new Int32Array(width * height).fill(-1);
  const components = [];
  const stack = new Int32Array(width * height);

  for (let start = 0; start < width * height; start++) {
    if (mask[start] !== 1 || labels[start] !== -1) continue;
    const id = components.length;
    let sp = 0;
    stack[sp++] = start;
    labels[start] = id;
    let count = 0;
    let sumX = 0, sumY = 0;
    let minX = width, minY = height, maxX = -1, maxY = -1;

    while (sp > 0) {
      const idx = stack[--sp];
      const x = idx % width;
      const y = (idx / width) | 0;
      count++;
      sumX += x;
      sumY += y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const nidx = ny * width + nx;
          if (mask[nidx] === 1 && labels[nidx] === -1) {
            labels[nidx] = id;
            stack[sp++] = nidx;
          }
        }
      }
    }
    components.push({
      id,
      count,
      centroidX: sumX / count,
      centroidY: sumY / count,
      bbox: { left: minX, top: minY, right: maxX + 1, bottom: maxY + 1 },
    });
  }
  return { labels, components };
}
