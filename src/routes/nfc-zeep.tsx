import { createSignal } from "solid-js";
import Zeeper from "../components/Zeeper";

const inputs = [
  {
    name: "duration",
    label: "Duration",
    unit: "ms",
    min: 0,
    max: 100,
    default: 50,
  },
  {
    name: "frequency_low",
    label: "Frequency Low",
    unit: "k",
    min: 5,
    max: 10,
    default: 5,
    step: 0.1,
  },
  {
    name: "frequency_high",
    label: "Frequency High",
    unit: "k",
    min: 5,
    max: 10,
    default: 10,
    step: 0.1,
  },
  { name: "humps", label: "Humps", min: 0, max: 10, default: 3 },
  // {
  //   name: "hump_spacing",
  //   label: "Hump Spacing", unit: "ms",
  //   min: 0,
  //   max: 20,
  //   default: 10,
  // },
  // { name: "hump_depth", label: "Hump Depth", unit: "k", min: 0, max: 10, default: 5 },
];

export default function NfcZeep() {
  const [measured, setMeasured] = createSignal(
    inputs.reduce(
      (acc, cur) => {
        acc[cur.name] = cur.default;
        return acc;
      },
      {} as Record<string, number>,
    ),
  );

  return (
    <div>
      <h1>Zeeps</h1>
      {inputs.map((input) => (
        <div>
          <label for={input.name}>
            {input.label} {measured()[input.name]}
            {input.unit}
          </label>
          <input
            type="range"
            id={input.name}
            name={input.name}
            min={input.min}
            max={input.max}
            step={input.step ?? 1}
            value={measured()[input.name]}
            onInput={(e) =>
              setMeasured({
                ...measured(),
                [input.name]: parseFloat(e.currentTarget.value),
              })
            }
          />
        </div>
      ))}
      <Zeeper measured={measured} />
      <p class="margin-start-l">
        This tool uses the ranges from OldBird's{" "}
        <a href="http://oldbird.org/pubs/fcmb/pages/zeep.htm">Zeep calls</a>{" "}
        measurements to find matching zeeps. You can disable the Low and Hump
        sliders by setting them to their minimum value, and the High Frequency
        by setting it to its maximum. Hover a bird in the list to see its range
        highlighted in the graph.
      </p>
    </div>
  );
}
