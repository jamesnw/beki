import { createMemo, createSignal } from "solid-js";
import { ZeepDetails } from "../data/nfc";
const canvasWidth = 1000;
const canvasHeight = 500;

export default function Zeeper({
  measured,
}: {
  measured: () => Record<string, number>;
}) {
  const [focusedBird, setFocusedBird] = createSignal(null as string | null);
  const matches = createMemo(() => {
    return Object.entries(ZeepDetails).filter(([, details]) => {
      const tests = [
        details["Low duration"] <= measured().duration,
        details["High Duration"] >= measured().duration,
        details["Frequency Low"] <= measured().frequency_low ||
          measured().frequency_low === 5,
        details["Frequency High"] >= measured().frequency_high ||
          measured().frequency_high === 10,
        details["Low Humps"] <= measured().humps || measured().humps === 0,
        details["High Humps"] >= measured().humps || measured().humps === 0,
        // details["Hump Depth High"] >= measured().frequency_high - measured().frequency_low,

        // details["Hump spacing"] >= settings().hump_spacing &&
        // details["Hump depth"] >= settings().hump_depth
      ];
      return tests.every((t) => t);
    });
  }, [measured]);

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
          ></rect>
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
          ></path>
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
  }, [measured, matches]);

  return (
    <div class="grid-xl">
      <ul class="cluster align-start list-unstyled item-fourth">
        {matches().map(([bird]) => (
          <li>
            <button
              class=""
              type="button"
              onmouseover={() => setFocusedBird(bird)}
              onmouseout={() => setFocusedBird(null)}
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
        ))}
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
          {[
            [0, 10],
            [100, 9],
            [200, 8],
            [300, 7],
            [400, 6],
            [500, 5],
          ].map(([y, k]) => (
            <g
            //key={y}
            >
              <line x1="0" y1={y} x2={canvasWidth} y2={y} stroke-width="2" />
              <text x={10} y={y - 5} font-size="30">
                {k}kHz
              </text>
            </g>
          ))}
        </g>
        {birdBoxes()}
        <g id="measuredBox">
          <rect
            x={canvasWidth / 2 - (measured().duration * 10) / 2}
            y={(10 - measured().frequency_high) * 100}
            width={measured().duration * 10}
            height={
              (measured().frequency_high - measured().frequency_low) * 100
            }
            fill-opacity="0.3"
            stroke-width="3"
          />
        </g>
      </svg>
    </div>
  );
}
