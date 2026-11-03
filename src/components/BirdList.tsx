import { For, createEffect , createMemo } from "solid-js";
import birds from "../codes.ts";
import BirdListItem from "./BirdListItem.tsx";
import { options } from "../optionStore.ts";
import rangeMatches from "../lib/rangeMatches.ts";

function BirdList() {
  const filteredBirds = createMemo(() => {
    const searchTerm = options.search.toLowerCase();
    return birds.filter((bird) => {
      if (options.species && bird.SP) return false;
      return (
        bird.COMMONNAME.toLowerCase().includes(searchTerm) ||
        (options.codeType === "4" &&
          bird.SPEC.toLowerCase().includes(searchTerm)) ||
        (options.codeType === "6" &&
          bird.SPEC6.toLowerCase().includes(searchTerm)) ||
        (options.codeType === "ebird" &&
          (bird.EBIRD || "").toLowerCase().includes(searchTerm)) ||
        (options.codeType === "sci4" &&
          (bird.SCI4 || "").toLowerCase().includes(searchTerm))
      );
    });
  });
  let list: HTMLUListElement;

  // This runs when search changes, not when filtered birds change. Is it a race condition?
  createEffect(() => {
    if (!CSS.highlights) return;
    CSS.highlights.delete("search-results");

    const ranges = list ? rangeMatches(options.search, list) : [];
    if (ranges.length === 0) return;

    // Create a Highlight object for the ranges.
    const searchResultsHighlight = new Highlight(...ranges);

    // Register the Highlight object in the registry.
    CSS.highlights.set("search-results", searchResultsHighlight);
  });

  return (
    <>
      {filteredBirds().length === 0 && (
        <div class="callout warning">No matching birds found.</div>
      )}
      <ul class="list-unstyled" ref={el => list = el}>
        <For each={filteredBirds()}>{(bird) => <BirdListItem {...bird} />}</For>
      </ul>
    </>
  );
}
export default BirdList;
