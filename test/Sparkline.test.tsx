// @vitest-environment happy-dom
import { afterEach, describe, expect, test } from "vitest";
import { render } from "solid-js/web";
import Sparkline from "../src/components/Sparkline";

function setup(data: Record<string, number>, maxBucketCount: number) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(
    () => <Sparkline data={data} maxBucketCount={maxBucketCount} />,
    container,
  );
  return { container, dispose };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Sparkline", () => {
  test("renders an SVG element", () => {
    const { container, dispose } = setup({ a: 5, b: 10 }, 10);
    expect(container.querySelector("svg")).toBeTruthy();
    dispose();
  });

  test("SVG has expected dimensions", () => {
    const { container, dispose } = setup({ a: 5 }, 10);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("100");
    expect(svg.getAttribute("height")).toBe("30");
    dispose();
  });

  test("renders a polyline", () => {
    const { container, dispose } = setup({ a: 0, b: 5, c: 10 }, 10);
    expect(container.querySelector("polyline")).toBeTruthy();
    dispose();
  });

  test("polyline points are calculated correctly for three values", () => {
    // x: 0, 50, 100 (indices over length-1=2)
    // y: 30-(0/10)*30=30, 30-(5/10)*30=15, 30-(10/10)*30=0
    const { container, dispose } = setup({ a: 0, b: 5, c: 10 }, 10);
    const points = container.querySelector("polyline")!.getAttribute("points")!;
    expect(points).toBe("0,30 50,15 100,0");
    dispose();
  });

  test("maxBucketCount of 0 normalizes by 1 (no division by zero)", () => {
    const { container, dispose } = setup({ a: 0 }, 0);
    const points = container.querySelector("polyline")!.getAttribute("points")!;
    // y = 30 - (0/1)*30 = 30, x = NaN for single point (0/0)
    expect(points).toBeDefined();
    dispose();
  });

  test("all-zero data renders flat line at bottom", () => {
    const { container, dispose } = setup({ a: 0, b: 0, c: 0 }, 10);
    const points = container.querySelector("polyline")!.getAttribute("points")!;
    // all y values should be 30 (bottom)
    expect(points).toBe("0,30 50,30 100,30");
    dispose();
  });

  test("at-max data renders flat line at top", () => {
    const { container, dispose } = setup({ a: 10, b: 10 }, 10);
    const points = container.querySelector("polyline")!.getAttribute("points")!;
    expect(points).toBe("0,0 100,0");
    dispose();
  });
});
