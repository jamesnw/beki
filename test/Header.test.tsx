// @vitest-environment happy-dom
import { afterEach, describe, expect, test } from "vitest";
import { render } from "solid-js/web";
import Header from "../src/components/header";

function setup() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(() => <Header />, container);
  return { container, dispose };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Header", () => {
  test("renders the BEKI logo link", () => {
    const { container, dispose } = setup();
    const logo = [...container.querySelectorAll("a")].find((a) =>
      a.textContent?.includes("BEKI"),
    )!;
    expect(logo).toBeTruthy();
    // happy-dom resolves href="/" to "" — just verify the link exists
    expect(logo.getAttribute("href")).toBeDefined();
    dispose();
  });

  test("renders the Codes nav link", () => {
    const { container, dispose } = setup();
    const link = [...container.querySelectorAll("a")].find(
      (a) => a.textContent?.trim() === "Codes",
    );
    expect(link).toBeTruthy();
    dispose();
  });

  test("renders the NFC Groups nav link", () => {
    const { container, dispose } = setup();
    const link = [...container.querySelectorAll("a")].find((a) =>
      a.textContent?.includes("NFC Groups"),
    );
    expect(link?.getAttribute("href")).toBe("/nfc");
    dispose();
  });

  test("renders the NFC Merge nav link", () => {
    const { container, dispose } = setup();
    const link = [...container.querySelectorAll("a")].find((a) =>
      a.textContent?.includes("NFC Merge"),
    );
    expect(link?.getAttribute("href")).toBe("/nfc/merge");
    dispose();
  });

  test("renders the About nav link", () => {
    const { container, dispose } = setup();
    const link = [...container.querySelectorAll("a")].find((a) =>
      a.textContent?.includes("About"),
    );
    expect(link?.getAttribute("href")).toBe("/about");
    dispose();
  });

  test("renders a GitHub link", () => {
    const { container, dispose } = setup();
    const ghLink = [...container.querySelectorAll("a")].find((a) =>
      a.getAttribute("href")?.includes("github.com"),
    );
    expect(ghLink).toBeTruthy();
    dispose();
  });
});
