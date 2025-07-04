import birds from "../codes.ts";
import BirdListItem from "./BirdListItem.tsx";
import { options } from "../optionStore.ts";
function BirdList() {
  const filteredBirds = () => {
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
          (bird.EBIRD || "").toLowerCase().includes(searchTerm))
      );
    });
  };

  return (
    <>
      {filteredBirds().length === 0 && (
        <div class="callout warning">No matching birds found.</div>
      )}
      <ul class="list-unstyled">
        {filteredBirds().map((bird) => (
          <BirdListItem {...bird} />
        ))}
      </ul>
    </>
  );
}
export default BirdList;
