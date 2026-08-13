import { generateHydrationScript, renderToStringAsync } from "solid-js/web";
import App from "./App";
import codes from "./codes";

// Routes prerendered to static HTML at build time (see prerender.js).
export const prerenderRoutes = [
  "/about",
  "/nfc",
  ...codes.map((c) => `/bird/${c.SPEC}`),
];

export async function render(url: string) {
  const body = await renderToStringAsync(() => <App url={url} />);
  const head = generateHydrationScript();
  return { body, head };
}
