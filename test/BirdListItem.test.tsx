// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { render } from "solid-js/web";
import BirdListItem from "../src/components/BirdListItem";
import type { BirdCode } from "../src/codes";
import { setOptions } from "../src/optionStore";

const mockBird: BirdCode = {
  SPEC: "whtspa",
  SPEC6: "ZOALBI",
  COMMONNAME: "White-throated Sparrow",
  SCINAME: "Zonotrichia albicollis",
  EBIRD: "whtspa",
  SCI4: "zonal",
  SORT_INDEX: 2035,
};

function setup(bird: BirdCode = mockBird) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(() => <BirdListItem {...bird} />, container);
  return { container, dispose };
}

beforeEach(() => setOptions("codeType", "4"));
afterEach(() => {
  document.body.innerHTML = "";
});

describe("BirdListItem", () => {
  test("displays the common name", () => {
    const { container, dispose } = setup();
    expect(container.textContent).toContain("White-throated Sparrow");
    dispose();
  });

  test("links to the bird detail page by SPEC", () => {
    const { container, dispose } = setup();
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/bird/whtspa");
    dispose();
  });

  test("shows 4-letter code when codeType is 4", () => {
    const { container, dispose } = setup();
    expect(container.textContent).toContain("whtspa");
    dispose();
  });

  test("shows 6-letter code when codeType is 6", () => {
    setOptions("codeType", "6");
    const { container, dispose } = setup();
    expect(container.textContent).toContain("ZOALBI");
    dispose();
  });

  test("shows eBird code when codeType is ebird", () => {
    setOptions("codeType", "ebird");
    const { container, dispose } = setup();
    expect(container.textContent).toContain("whtspa");
    dispose();
  });

  test("shows n/a when eBird code is absent", () => {
    setOptions("codeType", "ebird");
    const bird: BirdCode = { ...mockBird, EBIRD: undefined };
    const { container, dispose } = setup(bird);
    expect(container.textContent).toContain("n/a");
    dispose();
  });

  test("shows sci4 code when codeType is sci4", () => {
    setOptions("codeType", "sci4");
    const { container, dispose } = setup();
    expect(container.textContent).toContain("zonal");
    dispose();
  });

  test("shows n/a when sci4 code is absent", () => {
    setOptions("codeType", "sci4");
    const bird: BirdCode = { ...mockBird, SCI4: undefined };
    const { container, dispose } = setup(bird);
    expect(container.textContent).toContain("n/a");
    dispose();
  });
});
