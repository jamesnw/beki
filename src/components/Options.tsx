import { options, setOptions } from '../optionStore.ts';

function Options() {
  return <div class="callout">
      <label>
        <input
          type="checkbox"
          checked={options.species}
          onChange={(e) => setOptions('species', e.currentTarget.checked)}
        />
        Only show species
      </label>
        <label>
        <input
          type="radio"
          name="codeType"
          value="4"
          checked={options.codeType === '4'}
          onChange={(e) => setOptions('codeType', e.currentTarget.value as "4")}
        /> 4-letter
        </label>
      <label>
        <input
          type="radio"
          name="codeType"
          value="6"
          checked={options.codeType === '6'}
          onChange={(e) => setOptions('codeType', e.currentTarget.value as "6")}
        /> 6-letter
      </label>
      <label>
        Search:
        <input
          type="text"
          value={options.search}
          onInput={(e) => setOptions('search', e.currentTarget.value)}
        />
      </label>
    </div>
  ;
}

export default Options;