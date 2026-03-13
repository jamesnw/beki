// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { render } from "solid-js/web";
import SearchMatch from "../src/components/SearchMatch";
import { setOptions } from "../src/optionStore";

function setup(string: string) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(() => <SearchMatch string={string} />, container);
  return { container, dispose };
}

beforeEach(() => setOptions("search", ""));
afterEach(() => {
  document.body.innerHTML = "";
});

describe("SearchMatch", () => {
  test("renders full text with no search active", () => {
    const { container, dispose } = setup("White-throated Sparrow");
    expect(container.textContent).toBe("White-throated Sparrow");
    expect(container.querySelectorAll("span.match")).toHaveLength(0);
    dispose();
  });

  test("single-character search does not highlight", () => {
    setOptions("search", "w");
    const { container, dispose } = setup("White-throated Sparrow");
    expect(container.textContent).toBe("White-throated Sparrow");
    expect(container.querySelectorAll("span.match")).toHaveLength(0);
    dispose();
  });

  test("highlights case-insensitive match", () => {
    setOptions("search", "spar");
    const { container, dispose } = setup("White-throated Sparrow");
    const matchSpans = container.querySelectorAll("span.match");
    expect(matchSpans.length).toBeGreaterThan(0);
    expect(matchSpans[0].textContent?.toLowerCase()).toBe("spar");
    dispose();
  });

  test("non-matching search produces no highlights", () => {
    setOptions("search", "eagle");
    const { container, dispose } = setup("White-throated Sparrow");
    expect(container.querySelectorAll("span.match")).toHaveLength(0);
    expect(container.textContent).toBe("White-throated Sparrow");
    dispose();
  });

  test("match in middle splits text into multiple spans", () => {
    setOptions("search", "thr");
    const { container, dispose } = setup("White-throated Sparrow");
    const allSpans = container.querySelectorAll("span");
    // "White-", "thr", "oated Sparrow" → at least 3 spans
    expect(allSpans.length).toBeGreaterThanOrEqual(3);
    const matchSpans = container.querySelectorAll("span.match");
    expect(matchSpans[0].textContent?.toLowerCase()).toBe("thr");
    dispose();
  });

  test("match at start of string", () => {
    setOptions("search", "white");
    const { container, dispose } = setup("White-throated Sparrow");
    const matchSpans = container.querySelectorAll("span.match");
    expect(matchSpans.length).toBeGreaterThan(0);
    dispose();
  });
});
