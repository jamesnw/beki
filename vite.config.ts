import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import netlify from "@netlify/vite-plugin";

export default defineConfig({
  // Edge functions aren't used; skipping them avoids requiring a local Deno.
  plugins: [solid(), netlify({ edgeFunctions: { enabled: false } })],
});
