import { options } from "../optionStore";

function SearchMatch(props: { string: string }) {
  const partMatches = (haystack: string) => {
    const searchTerm = options.search.toLowerCase();
    if (searchTerm.length < 2) return [{ part: haystack, match: false }];
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = haystack.split(regex);
    return parts.map((part) => ({
      part: part,
      match: regex.test(part),
    }));
  };

  return partMatches(props.string).map(({ match, part }) => (
    <span classList={{ match: match }}>{part}</span>
  ));
}
export default SearchMatch;
