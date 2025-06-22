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
        bird.SPEC.toLowerCase().includes(searchTerm) ||
        bird.SPEC6.toLowerCase().includes(searchTerm)
      );
    });
  };

  return (
    <ul class="list-unstyled">
      {filteredBirds().map((bird) => (
        <BirdListItem {...bird} />
      ))}
    </ul>
  );
}
export default BirdList;
