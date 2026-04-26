import { Show } from "solid-js";
import type { BirdCode } from "../codes";

interface NFCBirdListItemProps {
  bird: BirdCode;
  linkText: string | Element;
  postText: string | Element;
}

export default function BirdItemPopper(props: NFCBirdListItemProps) {
  const { bird, linkText, postText } = props;
  return (
    <li data-birdlink>
      <a href={`/bird/${bird.SPEC}`} interestfor={bird.SPEC}>
        {linkText}
      </a>{" "}
      ({postText})
      <Show when={bird.EBIRD || bird.OLDBIRD}>
      <div popover="hint" id={bird.SPEC} class="callout vivid">
        <div>
          {bird.EBIRD && (
            <div>
              <a
                href={`https://ebird.org/species/${bird.EBIRD}`}
                target="_blank"
              >
                eBird
              </a>{" "}
              <a
                href={`https://media.ebird.org/catalog?birdOnly=true&taxonCode=${bird.EBIRD}&mediaType=audio&tag=flight_call`}
                target="_blank"
                aria-label="Flight calls"
                class="size-3xl"
              >
                ♪
              </a>
            </div>
          )}
          {bird.OLDBIRD && (
            <a href={bird.OLDBIRD} target="_blank">
              OldBird reference
            </a>
          )}
        </div>
      </div>
      </Show>
    </li>
  );
}
