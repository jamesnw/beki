import type { RouteSectionProps } from "@solidjs/router";
import Header from "../components/header";

const Main = (props: RouteSectionProps) => {
  return (
    <div class="container-2xl">
      <Header />
      <main>{props.children}</main>
      <footer class="margin-start-6xl">
        By <a href="https://jamessw.com">James</a>.
      </footer>
    </div>
  );
};
export default Main;
