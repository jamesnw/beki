import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  // ssr: true makes the plugin emit hydratable DOM code for the client build
  // and SSR code for the `--ssr` build (used by prerendering).
  plugins: [solid({ ssr: true })],
});
