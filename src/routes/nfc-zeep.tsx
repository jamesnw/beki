import { createMemo, createSignal } from "solid-js";
import { ZeepDetails } from "../data/nfc";
import Zeeper from "../components/Zeeper";

const inputs = [
  { name: "duration", label: "Duration", unit: "ms", min: 0, max: 100, default: 50 },
  {
    name: "frequency_low",
    label: "Frequency Low", unit:"k",
    min: 0,
    max: 10,
    default: 0,
    step: 0.1
  },
  {
    name: "frequency_high",
    label: "Frequency High", unit:"k",
    min: 0,
    max: 10,
    default: 10,
    step: 0.1
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

  const matches = createMemo(() => {
    return Object.entries(ZeepDetails).filter(([bird, details]) => {
      const tests = [
        details["Low duration"] <= measured().duration,
        details["High Duration"] >= measured().duration,
        details["Frequency Low Average"] <= measured().frequency_low || measured().frequency_low === 0,
        details["Frequency High Average"] >= measured().frequency_high || measured().frequency_high === 10,
        details["Low Humps"] <= measured().humps || measured().humps === 0,
        details["High Humps"] >= measured().humps || measured().humps === 0,
        // details["Hump spacing"] >= settings().hump_spacing &&
        // details["Hump depth"] >= settings().hump_depth
      ];
      console.log(bird, details, tests);
      return tests.every((t) => t);
    });
  }, [measured]);

  return (
    <div>
      <h1>Zeeps</h1>
      {inputs.map((input) => (
        <div>
          <label for={input.name}>
            {input.label} {measured()[input.name]}{input.unit}
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
      <h2>Matches</h2>
      <div>
        {matches().length === 0 && <p>No matches</p>}
        {matches().length > 0 && (
          <ul>
            {matches().map(([bird, details]) => (
              <li>
                <strong>{bird}</strong>: {details["Low duration"]}-
                {details["High Duration"]}ms,{" "}
                {parseFloat(details["Frequency Low"])}-
                {parseFloat(details["Frequency High"])}kHz,{" "}
                {details["Low Humps"]}-{details["High Humps"]} humps,
                {details["Rising"] ? " rising" : ""},
                {details["Flat"] ? " flat" : ""}
               
              </li>
            ))}
          </ul>
        )}
      </div>
      <Zeeper measured={measured} />
    </div>
  );
}
