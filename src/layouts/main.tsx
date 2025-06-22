import type { RouteSectionProps } from "@solidjs/router";
import Header from "../components/header";

const Main = ({ children }: RouteSectionProps) => {
  return (
    <div class="container-2xl">
      <Header />
      <main>{children}</main>
      <footer class="margin-start-6xl">By James</footer>
    </div>
  );
};
export default Main;
