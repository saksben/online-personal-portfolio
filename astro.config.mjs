// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Custom domain (public/CNAME) means the site is served from the domain root, so no `base`.
// If you ever deploy to https://<user>.github.io/<repo>/ instead, see DEPLOYMENT.md.
export default defineConfig({
  site: "https://www.saksben.com",
  trailingSlash: "always",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
