import { Show } from "solid-js";
import type { BirdCode } from "../codes";
import { options } from "../optionStore";
import SearchMatch from "./SearchMatch";

function BirdListItem(bird: BirdCode) {
  const codeType = () => options.codeType;

  return (
    <li>
      <a href={`/bird/${bird.SPEC}`}>
        <strong>
          <SearchMatch string={bird.COMMONNAME} />
        </strong>{" "}
        -{" "}
        <Show when={codeType() === "4"}>
          <SearchMatch string={bird.SPEC} />
        </Show>
        <Show when={codeType() === "6"}>
          <SearchMatch string={bird.SPEC6} />
        </Show>
      </a>
    </li>
  );
}

export default BirdListItem;
