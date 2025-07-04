import BirdList from "../components/BirdList.tsx";
import Options from "../components/Options.tsx";

function CodeSearch() {
  return (
    <div class="stack gap-4">
      <h1>Bird Code Search</h1>
      <Options />
      <BirdList />
    </div>
  );
}

export default CodeSearch;
