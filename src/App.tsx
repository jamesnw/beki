import { lazy } from "solid-js";
import { Route, Router, StaticRouter } from "@solidjs/router";
import Main from "./layouts/main";
import About from "./routes/about";
import Bird from "./routes/bird";
import NfcGroups from "./routes/nfc-groups";

// Browser-only / heavy routes are lazy so they are never imported during
// server-side prerendering. Only the prerendered routes (/about, /bird/:spec)
// are imported eagerly.
const CodeSearch = lazy(() => import("./routes/CodeSearch"));
const NfcZeep = lazy(() => import("./routes/nfc-zeep"));
const Merge = lazy(() => import("./routes/merge"));

export default function App(props: { url?: string }) {
  // StaticRouter (server) accepts a `url`; the browser Router reads location.
  const RouterComp =
    props.url !== undefined ? StaticRouter : (Router as typeof StaticRouter);
  return (
    <RouterComp url={props.url} root={Main}>
      <Route path="/" component={CodeSearch} />
      <Route path="/about" component={About} />
      <Route path="/nfc" component={NfcGroups} />
      <Route path="/nfc/zeep" component={NfcZeep} />
      <Route path="/nfc/merge" component={Merge} />
      <Route path="/bird/:spec" component={Bird} />
    </RouterComp>
  );
}
