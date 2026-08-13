// Renders selected routes to static HTML after the client + server builds.
// Output goes into dist/<route>/index.html, which static hosts (Netlify,
// Cloudflare Pages) serve directly; everything else falls back to index.html.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(root, "dist");

const template = readFileSync(resolve(distDir, "index.html"), "utf-8");
const { render, prerenderRoutes } = await import(
  pathToFileURL(resolve(root, "dist-ssr/entry-server.js")).href
);

console.log(`Prerendering ${prerenderRoutes.length} routes...`);
for (const url of prerenderRoutes) {
  const { body, head } = await render(url);
  const html = template
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace("</head>", `${head}</head>`);
  const outDir = resolve(distDir, `.${url}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "index.html"), html);
}
console.log("Prerender complete.");
