/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import "./index.css";
import "kelpui/js/dark-mode-auto.js";
import "kelpui/js/kelp.js";
import Main from "./layouts/main";
import App from "./routes/CodeSearch";
import About from "./routes/about";
import Bird from "./routes/bird";
import NfcGroups from "./routes/nfc-groups";
import NfcZeep from "./routes/nfc-zeep";
import Merge from "./routes/merge";

const root = document.getElementById("root");

render(
  () => (
    <Router root={Main}>
      <Route path="/" component={App} />
      <Route path="/about" component={About} />
      <Route path="/nfc" component={NfcGroups} />
      <Route path="/nfc/zeep" component={NfcZeep} />
      <Route path="/nfc/merge" component={Merge} />
      <Route path="/bird/:spec" component={Bird} />
    </Router>
  ),
  root!,
);
