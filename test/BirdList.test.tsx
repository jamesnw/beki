// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { render } from "solid-js/web";
import BirdList from "../src/components/BirdList";
import { setOptions } from "../src/optionStore";

function setup() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(() => <BirdList />, container);
  return { container, dispose };
}

beforeEach(() => {
  setOptions("search", "");
  setOptions("species", true);
  setOptions("codeType", "4");
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("BirdList", () => {
  test("renders a list of birds", () => {
    const { container, dispose } = setup();
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThan(0);
    dispose();
  });

  test("shows 'No matching birds' message when search has no results", () => {
    setOptions("search", "xyznotabird");
    const { container, dispose } = setup();
    expect(container.textContent).toContain("No matching birds found.");
    dispose();
  });

  test("filters birds by common name search", () => {
    setOptions("search", "Bald Eagle");
    const { container, dispose } = setup();
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.textContent?.toLowerCase()).toContain("bald eagle");
    }
    dispose();
  });

  test("filters birds by 4-letter code search", () => {
    setOptions("codeType", "4");
    setOptions("search", "baea");
    const { container, dispose } = setup();
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThan(0);
    dispose();
  });

  test("filters birds by 6-letter code search", () => {
    // HITI (Highland Tinamou) has SPEC6="NOTBON" — known from codes.ts
    setOptions("codeType", "6");
    setOptions("search", "notbon");
    const { container, dispose } = setup();
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThan(0);
    expect(container.textContent).toContain("Highland Tinamou");
    dispose();
  });

  test("hides subspecies when species filter is on", () => {
    setOptions("species", true);
    setOptions("search", "");
    const { container, dispose } = setup();
    const withSpeciesFilter = container.querySelectorAll("li").length;

    setOptions("species", false);
    const withoutSpeciesFilter = container.querySelectorAll("li").length;
    expect(withoutSpeciesFilter).toBeGreaterThanOrEqual(withSpeciesFilter);
    dispose();
  });

  test("eBird code type is active and common name search still works", () => {
    // Exercises the eBird code path; common name search always applies
    setOptions("codeType", "ebird");
    setOptions("search", "tinamou");
    const { container, dispose } = setup();
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThan(0);
    dispose();
  });

  test("sci4 code type is active and common name search still works", () => {
    // Exercises the sci4 code path; common name search always applies
    setOptions("codeType", "sci4");
    setOptions("search", "tinamou");
    const { container, dispose } = setup();
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThan(0);
    dispose();
  });
});
