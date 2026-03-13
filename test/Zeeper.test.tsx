// @vitest-environment happy-dom
import { afterEach, describe, expect, test } from "vitest";
import { render } from "solid-js/web";
import Zeeper from "../src/components/Zeeper";

// N. Waterthrush reference values from ZeepDetails:
//   Low duration: 61.7, High Duration: 93.6
//   Frequency Low: 6.2, Frequency High: 9.4
//   Low Humps: 3, High Humps: 9
const matchingMeasured = () => ({
  duration: 75,
  frequency_low: 7,
  frequency_high: 9,
  humps: 5,
});

// Measurement that won't match any bird (duration out of range)
const noMatchMeasured = () => ({
  duration: 1,
  frequency_low: 7,
  frequency_high: 9,
  humps: 5,
});

function setup(measured = matchingMeasured) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(() => <Zeeper measured={measured} />, container);
  return { container, dispose };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Zeeper", () => {
  test("renders an SVG canvas", () => {
    const { container, dispose } = setup();
    expect(container.querySelector("svg")).toBeTruthy();
    dispose();
  });

  test("renders frequency axis lines", () => {
    const { container, dispose } = setup();
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBeGreaterThan(0);
    dispose();
  });

  test("renders matching bird buttons", () => {
    const { container, dispose } = setup(matchingMeasured);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    dispose();
  });

  test("renders no bird buttons when nothing matches", () => {
    const { container, dispose } = setup(noMatchMeasured);
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(0);
    dispose();
  });

  test("includes N. Waterthrush in matching results", () => {
    const { container, dispose } = setup(matchingMeasured);
    const buttons = [...container.querySelectorAll("button")].map(
      (b) => b.textContent,
    );
    expect(buttons).toContain("N. Waterthrush");
    dispose();
  });

  test("hovering a bird button sets it as focused", () => {
    const { container, dispose } = setup(matchingMeasured);
    const button = container.querySelector("button")!;
    button.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    // The focused bird's group should have data-focused="focused"
    const focusedGroups = container.querySelectorAll(
      'g[data-focused="focused"]',
    );
    expect(focusedGroups.length).toBeGreaterThan(0);
    dispose();
  });

  test("mousing out clears focused bird", () => {
    const { container, dispose } = setup(matchingMeasured);
    const button = container.querySelector("button")!;
    button.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    button.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
    const focusedGroups = container.querySelectorAll(
      'g[data-focused="focused"]',
    );
    expect(focusedGroups).toHaveLength(0);
    dispose();
  });

  test("humps=0 special case matches all birds on hump criteria", () => {
    const anyHumpsMeasured = () => ({
      duration: 75,
      frequency_low: 7,
      frequency_high: 9,
      humps: 0,
    });
    const { container, dispose } = setup(anyHumpsMeasured);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    dispose();
  });

  test("renders the warbler fallback reminder text", () => {
    const { container, dispose } = setup();
    expect(container.textContent).toContain("New world warbler sp.");
    dispose();
  });

  test("frequency_low=5 special case bypasses frequency-low check", () => {
    // frequency_low=5 triggers the OR short-circuit: any bird matches freq-low criterion
    // N. Waterthrush: FreqLow=6.2, but 6.2 <= 5 is false → falls to frequency_low===5 branch
    const measured = () => ({
      duration: 75,
      frequency_low: 5,
      frequency_high: 9,
      humps: 5,
    });
    const { container, dispose } = setup(measured);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    dispose();
  });

  test("frequency_high=10 special case bypasses frequency-high check", () => {
    // frequency_high=10 triggers the OR: any bird matches freq-high criterion
    // N. Waterthrush: FreqHigh=9.4, but 9.4 >= 10 is false → falls to frequency_high===10
    const measured = () => ({
      duration: 75,
      frequency_low: 7,
      frequency_high: 10,
      humps: 5,
    });
    const { container, dispose } = setup(measured);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    dispose();
  });

  test("non-focused birds get data-focused='other' when another bird is focused", () => {
    // duration=65 matches both N. Waterthrush (61.7–93.6) and L. Waterthrush (51.9–74.8)
    // Special values for frequency/humps ensure both pass those checks
    const twoMatchMeasured = () => ({
      duration: 65,
      frequency_low: 5,
      frequency_high: 10,
      humps: 0,
    });
    const { container, dispose } = setup(twoMatchMeasured);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    buttons[0].dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    const otherGroups = container.querySelectorAll('g[data-focused="other"]');
    expect(otherGroups.length).toBeGreaterThan(0);
    dispose();
  });
});
