import { createMemo, For } from "solid-js";
import { options } from "../optionStore";

function SearchMatch(props: { string: string }) {
  const partMatches = createMemo(() => {
    const searchTerm = options.search.toLowerCase();
    if (searchTerm.length < 2) return [{ part: props.string, match: false }];
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = props.string.split(regex);
    return parts.map((part) => ({
      part: part,
      match: regex.test(part),
    }));
  });

  return (
    <For each={partMatches()}>
      {(item) => <span classList={{ match: item.match }}>{item.part}</span>}
    </For>
  );
}
export default SearchMatch;
