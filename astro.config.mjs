import { defineConfig } from "astro/config";

// Static output. Pages are written as /now.html and served at /now by Cloudflare's
// asset handling, so there are no trailing slashes in the addresses.
export default defineConfig({
  output: "static",
  build: { format: "file" },
  trailingSlash: "never",
  compressHTML: true,
  // Code in essays, coloured for the paper (the notebook has no dark mode).
  markdown: { shikiConfig: { theme: "github-light-high-contrast" } },
});
