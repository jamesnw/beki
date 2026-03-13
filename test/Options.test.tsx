// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { render } from "solid-js/web";
import Options from "../src/components/Options";
import { options, setOptions } from "../src/optionStore";

function setup() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(() => <Options />, container);
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

describe("Options", () => {
  test("renders a code type select with four options", () => {
    const { container, dispose } = setup();
    const select = container.querySelector("select")!;
    expect(select).toBeTruthy();
    expect(select.querySelectorAll("option")).toHaveLength(4);
    dispose();
  });

  test("renders the species-only checkbox", () => {
    const { container, dispose } = setup();
    const checkbox = container.querySelector(
      "input[type=checkbox]",
    ) as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);
    dispose();
  });

  test("renders the search text input", () => {
    const { container, dispose } = setup();
    const input = container.querySelector(
      "input[type=text]",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("");
    dispose();
  });

  test("changing code type select updates the store", () => {
    const { container, dispose } = setup();
    const select = container.querySelector("select") as HTMLSelectElement;
    select.value = "6";
    select.dispatchEvent(new Event("change"));
    expect(options.codeType).toBe("6");
    dispose();
  });

  test("toggling species checkbox updates the store", () => {
    const { container, dispose } = setup();
    const checkbox = container.querySelector(
      "input[type=checkbox]",
    ) as HTMLInputElement;
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change"));
    expect(options.species).toBe(false);
    dispose();
  });

  test("typing in search input updates the store", () => {
    const { container, dispose } = setup();
    const input = container.querySelector(
      "input[type=text]",
    ) as HTMLInputElement;
    input.value = "sparrow";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    expect(options.search).toBe("sparrow");
    dispose();
  });

  test("codeType options cover all four modes", () => {
    const { container, dispose } = setup();
    const options = [...container.querySelectorAll("option")].map(
      (o) => o.getAttribute("value"),
    );
    expect(options).toContain("4");
    expect(options).toContain("6");
    expect(options).toContain("ebird");
    expect(options).toContain("sci4");
    dispose();
  });
});
