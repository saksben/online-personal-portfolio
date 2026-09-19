# Deployment: GitHub Pages

The site is fully static (`astro build` → `dist/`). It's deployed by GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) on every push to `main`.

## One-time setup

1. **Switch the Pages source to GitHub Actions.** The previous site deployed straight from the branch. In the repo: *Settings → Pages → Build and deployment → Source: **GitHub Actions***. Until you do this, the workflow's deploy step will fail or the old branch-based site will keep being served.
2. **Custom domain.** `public/CNAME` contains `www.saksben.com` and is copied to the site root on every build, so the domain setting survives deploys. Under *Settings → Pages → Custom domain*, confirm `www.saksben.com` and tick *Enforce HTTPS*. DNS is unchanged from the previous site.
3. Push to `main`. The workflow runs three jobs: **lint** (`eslint`), **build** (`astro check` for types, then `astro build`) and **deploy**.

## Local commands

```sh
npm install
npm run dev       # http://localhost:4321 with hot reload
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
npm run lint
npm run og        # regenerate public/og.png (social share image)
```

Requires Node ≥ 20.19 (the workflow uses 22).

## Configuration that matters

`astro.config.mjs`:

```js
site: "https://www.saksben.com",   // canonical URLs, sitemap, og:url
trailingSlash: "always",           // /paladin/ matches GitHub Pages' folder-style serving
// no `base`: served from the domain root
```

### If you ever host without the custom domain

For `https://<user>.github.io/<repo>/`, set:

```js
site: "https://<user>.github.io",
base: "/<repo>",
```

and delete `public/CNAME`. Internal links are written as root-absolute paths (`/paladin/`, `/resume/`) in a handful of places (`src/pages/*.astro`, `src/scripts/select.ts`, `src/layouts/Base.astro`, `src/data/site.ts`); they'd need prefixing with `import.meta.env.BASE_URL`. This is not needed for the current custom-domain setup.

## What gets deployed

- 8 pages: `/`, `/paladin/`, `/archivist/`, `/oracle/`, `/courier/`, `/worldbuilder/`, `/resume/`, `/404.html`
- `sitemap-index.xml` + `robots.txt`, `og.png`, `favicon.svg`
- Optimized WebP images (Astro assets pipeline), self-hosted fonts (no third-party font requests)
- One ~16 KB JS bundle (selector + transitions, loaded only on `/`) plus a tiny inline page-enter snippet; class pages and the resume ship no framework JS

## Troubleshooting

- **Deploy job fails with a Pages permissions error:** step 1 above wasn't done.
- **404 on refresh of `/paladin`:** use the trailing slash; GitHub Pages serves `/paladin/index.html`.
- **Old site still showing:** hard-refresh; the old site set aggressive no-cache meta tags, but CDNs/browsers may still hold it briefly.
