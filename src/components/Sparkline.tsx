import { createMemo } from "solid-js";

const SVG_WIDTH = 100;
const SVG_HEIGHT = 30;
export default function Sparkline(props: {
  data: Record<string, number>;
  maxBucketCount: number;
}) {
  const points = createMemo(() =>
    Object.values(props.data)
      .map((count, index, arr) => {
        const x = (index / (arr.length - 1)) * SVG_WIDTH;
        const y = SVG_HEIGHT - (count / (props.maxBucketCount || 1)) * SVG_HEIGHT;
        return `${x},${y}`;
      })
      .join(" "),
  );

  return (
    <svg
      width={SVG_WIDTH}
      height={SVG_HEIGHT}
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline
        fill="none"
        stroke="var(--color-primary-fill-vivid)"
        stroke-width="2"
        points={points()}
      />
    </svg>
  );
}
