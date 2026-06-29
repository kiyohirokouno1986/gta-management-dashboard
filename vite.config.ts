import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// SINGLE=1 build mode: emit one self-contained index.html (CSS + JS inlined,
// IIFE format) so it opens directly from the file system — no server, no
// external requests. Used for sharing a local preview of internal data
// without publishing it anywhere.
const single = process.env.SINGLE === "1";

function inlineSingleFile(): Plugin {
  return {
    name: "single-file-inline",
    enforce: "post",
    generateBundle(_options, bundle) {
      let css = "";
      let js = "";
      const remove: string[] = [];
      for (const [name, file] of Object.entries(bundle)) {
        if (file.type === "asset" && name.endsWith(".css")) {
          css += String(file.source);
          remove.push(name);
        } else if (file.type === "chunk" && file.isEntry) {
          js += file.code;
          remove.push(name);
        }
      }
      const html = bundle["index.html"];
      if (html && html.type === "asset") {
        let s = String(html.source);
        s = s.replace(/<link[^>]+rel="stylesheet"[^>]*>\s*/g, "");
        s = s.replace(/<script[^>]+src="[^"]+"[^>]*><\/script>\s*/g, "");
        s = s.replace("</head>", `<style>${css}</style></head>`);
        s = s.replace("</body>", `<script>${js}</script></body>`);
        html.source = s;
      }
      for (const n of remove) delete bundle[n];
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), ...(single ? [inlineSingleFile()] : [])],
  build: single
    ? {
        outDir: "dist-single",
        cssCodeSplit: false,
        assetsInlineLimit: 100_000_000,
        rollupOptions: {
          output: { format: "iife", inlineDynamicImports: true },
        },
      }
    : {},
  test: {
    globals: true,
    environment: "node",
  },
});
