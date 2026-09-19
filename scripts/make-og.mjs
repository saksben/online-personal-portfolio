// Renders public/og.png (1200x630) from an inline SVG using sharp (bundled with Astro).
// Re-run with `npm run og` after changing the design or names below.
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const classes = [
  { name: "PALADIN", role: "FULL STACK", color: "#d9b45f" },
  { name: "ARCHIVIST", role: "DATABASE", color: "#ffb020" },
  { name: "ORACLE", role: "AI", color: "#22d3ee" },
  { name: "COURIER", role: "MOBILE", color: "#10e08a" },
  { name: "WORLDBUILDER", role: "GAME", color: "#f0abfc" },
];

const slots = classes
  .map((c, i) => {
    const x = 120 + i * 240;
    return `
    <rect x="${x - 90}" y="330" width="180" height="170" rx="6" fill="${c.color}" fill-opacity="0.08" stroke="${c.color}" stroke-opacity="0.7" stroke-width="2"/>
    <circle cx="${x}" cy="385" r="26" fill="none" stroke="${c.color}" stroke-width="3"/>
    <path d="M${x - 22} 455 q22 -46 44 0" fill="none" stroke="${c.color}" stroke-width="3"/>
    <text x="${x}" y="484" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="17" letter-spacing="2" fill="${c.color}">${c.name}</text>
    <text x="${x}" y="316" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" letter-spacing="3" fill="#a3adc2">${c.role}</text>`;
  })
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b2a4a"/><stop offset="0.6" stop-color="#0a0c18"/><stop offset="1" stop-color="#05060a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" letter-spacing="8" fill="#d9b45f">BENJAMIN SAKS · PLAYER SELECT</text>
  <text x="600" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="78" letter-spacing="8" fill="#e8ecf4">CHOOSE YOUR CLASS</text>
  ${slots}
</svg>`;

await writeFile(new URL("../public/og.svg", import.meta.url), svg);
await sharp(Buffer.from(svg)).png().toFile(new URL("../public/og.png", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
console.log("wrote public/og.png");
