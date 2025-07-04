import { options, setOptions } from "../optionStore.ts";

function Options() {
  return (
    <div class="callout primary">
      <div class="grid">
        <label class="item-half sidecar">
          <span>Code type</span>
          <select
            onChange={(e) =>
              setOptions("codeType", e.currentTarget.value as "4")
            }
          >
            <option value="4" selected={options.codeType === "4"}>
              4-letter
            </option>
            <option value="6" selected={options.codeType === "6"}>
              6-letter
            </option>
            <option value="ebird" selected={options.codeType === "ebird"}>
              eBird
            </option>
          </select>
        </label>
        <div class="item-half">
          <label>
            <input
              type="checkbox"
              checked={options.species}
              onChange={(e) => setOptions("species", e.currentTarget.checked)}
            />
            Only show species
          </label>
        </div>
      </div>
      <label>
        Search:
        <input
          type="text"
          value={options.search}
          onInput={(e) => setOptions("search", e.currentTarget.value)}
        />
      </label>
    </div>
  );
}

export default Options;
