/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import "./index.css";
import Main from "./layouts/main";
import App from "./routes/CodeSearch";
import About from "./routes/about";
import Bird from "./routes/bird";
import NfcGroups from "./routes/nfc-groups";

const root = document.getElementById("root");

render(
  () => (
    <Router root={Main}>
      <Route path="/" component={App}></Route>
      <Route path="/about" component={About}></Route>
      <Route path="/nfc" component={NfcGroups}></Route>
      <Route path="/bird/:spec" component={Bird}></Route>
    </Router>
  ),
  root!,
);
