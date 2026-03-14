import { createMemo, createSignal, For } from "solid-js";
import { ZeepDetails } from "../data/nfc";
const canvasWidth = 1000;
const canvasHeight = 500;

export default function Zeeper(props: {
  measured: () => Record<string, number>;
}) {
  const [focusedBird, setFocusedBird] = createSignal(null as string | null);
  const matches = createMemo(() => {
    return Object.entries(ZeepDetails).filter(([, details]) => {
      const tests = [
        details["Low duration"] <= props.measured().duration,
        details["High Duration"] >= props.measured().duration,
        details["Frequency Low"] <= props.measured().frequency_low ||
          props.measured().frequency_low === 5,
        details["Frequency High"] >= props.measured().frequency_high ||
          props.measured().frequency_high === 10,
        details["Low Humps"] <= props.measured().humps ||
          props.measured().humps === 0,
        details["High Humps"] >= props.measured().humps ||
          props.measured().humps === 0,
        // details["Hump Depth High"] >= props.measured().frequency_high - props.measured().frequency_low,

        // details["Hump spacing"] >= settings().hump_spacing &&
        // details["Hump depth"] >= settings().hump_depth
      ];
      return tests.every((t) => t);
    });
  });

  const birdBoxes = createMemo(() => {
    return matches().map(([bird, details]) => {
      return (
        <g
          // key={bird}
          class="zeeperBird"
          data-focused={
            focusedBird()
              ? focusedBird() === bird
                ? "focused"
                : "other"
              : "none"
          }
        >
          <rect
            x={canvasWidth / 2 - (details["Average Duration"] * 10) / 2}
            y={(10 - details["Frequency High Average"]) * 100}
            width={details["Average Duration"] * 10}
            height={
              (details["Frequency High Average"] -
                details["Frequency Low Average"]) *
              100
            }
            fill="transparent"
            stroke="blue"
            stroke-width="2"
          />
          <path
            fill-rule="evenodd"
            d={`
            M ${canvasWidth / 2 - (details["High Duration"] * 10) / 2} ${(10 - details["Frequency Low"]) * 100}
            L ${canvasWidth / 2 + (details["High Duration"] * 10) / 2} ${(10 - details["Frequency Low"]) * 100}
            L ${canvasWidth / 2 + (details["High Duration"] * 10) / 2} ${(10 - details["Frequency High"]) * 100}
            L ${canvasWidth / 2 - (details["High Duration"] * 10) / 2} ${(10 - details["Frequency High"]) * 100}
            Z
            M ${canvasWidth / 2 - (details["Low duration"] * 10) / 2} ${(10 - details["Frequency Low"]) * 100}
            L ${canvasWidth / 2 + (details["Low duration"] * 10) / 2} ${(10 - details["Frequency Low"]) * 100}
            L ${canvasWidth / 2 + (details["Low duration"] * 10) / 2} ${(10 - details["Frequency High"]) * 100}
            L ${canvasWidth / 2 - (details["Low duration"] * 10) / 2} ${(10 - details["Frequency High"]) * 100}
            Z
          `}
            fill-opacity={0.3}
            fill="lightblue"
            stroke="lightblue"
            stroke-width="2"
          />
          <text
            x={canvasWidth / 2 - (details["Average Duration"] * 10) / 2 + 5}
            y={(10 - details["Frequency High Average"]) * 100 + 20}
            font-size="20"
            fill="blue"
          >
            {bird}
          </text>
        </g>
      );
    });
  });

  return (
    <div class="grid-xl">
      <ul class="cluster align-start list-unstyled item-fourth">
        <For each={matches()}>
          {([bird]) => (
            <li>
              <button
                class=""
                type="button"
                onMouseOver={() => setFocusedBird(bird)}
                onMouseOut={() => setFocusedBird(null)}
              >
                <strong>{bird}</strong>
                {/* :{' '}
              {[
                `${details["Low duration"]}-${details["High Duration"]}ms`,
                `${parseFloat(details["Frequency Low"])}-
                  ${parseFloat(details["Frequency High"])}kHz`,
                `${details["Low Humps"]}-${details["High Humps"]} humps`,
              ].join(", ")} */}
              </button>
            </li>
          )}
        </For>
        <li>
          (And remember there's no shame in <em>New world warbler sp.</em>)
        </li>
      </ul>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="100%"
        height="100%"
        viewBox={`0 -50 ${canvasWidth} ${canvasHeight + 50}`}
        preserveAspectRatio="xMidYMid meet"
        class="zeeper item-three-fourths"
      >
        <g id="hzAxis">
          <For
            each={[
              [0, 10],
              [100, 9],
              [200, 8],
              [300, 7],
              [400, 6],
              [500, 5],
            ]}
          >
            {([y, k]) => (
              <g>
                <line x1="0" y1={y} x2={canvasWidth} y2={y} stroke-width="2" />
                <text x={10} y={y - 5} font-size="30">
                  {k}kHz
                </text>
              </g>
            )}
          </For>
        </g>
        {birdBoxes()}
        <g id="measuredBox">
          <rect
            x={canvasWidth / 2 - (props.measured().duration * 10) / 2}
            y={(10 - props.measured().frequency_high) * 100}
            width={props.measured().duration * 10}
            height={
              (props.measured().frequency_high -
                props.measured().frequency_low) *
              100
            }
            fill-opacity="0.3"
            stroke-width="3"
          />
        </g>
      </svg>
    </div>
  );
}
