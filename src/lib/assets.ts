import type { ImageMetadata } from "astro";
import type { ClassId } from "@/data/characters";

type ImageModule = { default: ImageMetadata };

const projectModules = import.meta.glob<ImageModule>("/src/assets/projects/*.{png,jpg,jpeg,webp,avif}", { eager: true });
const artModules = import.meta.glob<ImageModule>("/src/assets/art/*/*.{png,jpg,jpeg,webp,avif}", { eager: true });
const propModules = import.meta.glob<ImageModule>("/src/assets/art/*/props/*.{png,jpg,jpeg,webp,avif}", { eager: true });
const propManifests = import.meta.glob<{ default: PropManifestEntry[] }>("/src/assets/art/*/props.json", { eager: true });
const iconModules = import.meta.glob<ImageModule>("/src/assets/skill-icons/*.{png,jpg,webp,svg}", { eager: true });

/** Map "dir/name.ext" (relative to the glob root) to its image, keyed without the extension. */
const index = (modules: Record<string, ImageModule>, root: string) => {
  const out = new Map<string, ImageMetadata>();
  for (const [path, mod] of Object.entries(modules)) {
    out.set(path.slice(root.length).replace(/\.[^.]+$/, ""), mod.default);
  }
  return out;
};

const projectImages = index(projectModules, "/src/assets/projects/");
const artImages = index(artModules, "/src/assets/art/");
const iconImages = index(iconModules, "/src/assets/skill-icons/");

export const projectImage = (name?: string) => (name ? projectImages.get(name) : undefined);

export const skillIcon = (name?: string) => (name ? iconImages.get(name) : undefined);

/**
 * Final character art lives at src/assets/art/<class>/<kind>.(png|webp|jpg).
 * See ART-ASSETS.md. Returns undefined until the file exists, in which case
 * components fall back to the built-in placeholder silhouette.
 */
export type ArtKind = "idle" | "hover" | "selected" | "bg";
export const characterArt = (id: ClassId, kind: ArtKind) => artImages.get(`${id}/${kind}`);

/**
 * Free-floating props (shard, fragments, robot, ...) separated from a
 * character's idle render by scripts/prep-art.mjs. Each is its own image on
 * the same canvas as idle.png, so it stacks in register with no extra
 * positioning; originPct is where to anchor transform-origin for CSS
 * rotate/orbit animation. Positioned against the idle pose only.
 */
export interface PropManifestEntry {
  file: string;
  originPct: { x: number; y: number };
  boxPct: { left: number; top: number; width: number; height: number };
  rawArea: number;
}
export interface CharacterProp {
  image: ImageMetadata;
  originPct: { x: number; y: number };
}
const propImages = index(propModules, "/src/assets/art/");
export const characterProps = (id: ClassId): CharacterProp[] => {
  const manifest = propManifests[`/src/assets/art/${id}/props.json`]?.default ?? [];
  return manifest
    .map((entry) => {
      const image = propImages.get(`${id}/props/${entry.file.replace(/\.[^.]+$/, "")}`);
      return image ? { image, originPct: entry.originPct } : undefined;
    })
    .filter((p): p is CharacterProp => p !== undefined);
};
