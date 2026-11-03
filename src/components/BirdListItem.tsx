import type { BirdCode } from "../codes";
import { options, type Options } from "../optionStore";
import BirdItemPopper from "./BirdItemPopper";

const codeField = {
  "4": "SPEC",
  "6": "SPEC6",
  ebird: "EBIRD",
  sci4: "SCI4",
} as const satisfies Record<Options["codeType"], keyof BirdCode>;

function BirdListItem(bird: BirdCode) {
  return (
    <BirdItemPopper
      bird={bird}
      linkText={
        <strong>
          {bird.COMMONNAME}
        </strong>
      }
      postText={bird[codeField[options.codeType]] || "n/a"}
    />
  );
}

export default BirdListItem;
