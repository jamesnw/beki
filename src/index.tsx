/* @refresh reload */
import { hydrate, render } from "solid-js/web";
import "./index.css";
import "kelpui/js/dark-mode-auto.js";
import "kelpui/js/kelp.js";
import "interestfor";
import App from "./App";

const root = document.getElementById("root")!;

// Prerendered pages ship server markup + a hydration script, so hydrate them.
// SPA-fallback pages (served from index.html) have an empty root, so render.
if (root.firstChild) {
  hydrate(() => <App />, root);
} else {
  render(() => <App />, root);
}
