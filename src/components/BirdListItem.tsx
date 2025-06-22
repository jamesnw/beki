import type { BirdCode } from "../codes";
import { options } from "../optionStore";

function BirdListItem(bird: BirdCode) {
  return (
    <li>
      <a href={`/bird/${bird.SPEC}`}>
        <strong>{bird.COMMONNAME}</strong> -{" "}
        {options.codeType === "4" ? bird.SPEC : bird.SPEC6}
      </a>
    </li>
  );
}

export default BirdListItem;
