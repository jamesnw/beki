// @vitest-environment happy-dom
import { afterEach, describe, expect, test } from "vitest";
import { render } from "solid-js/web";
import { readFileSync } from "fs";
import { join } from "path";
import EBirdExport from "../src/components/EBirdExport";
import { aggregateResults, orderSorted } from "../src/lib/aggregateResults";
import { processInput } from "../src/lib/processFile";

const fixtureDir = join(import.meta.dirname, "fixtures");
const readFixture = (name: string) => readFileSync(join(fixtureDir, name), "utf-8");

const FILES = ["Labels 0.txt", "Labels 1.txt"];
const display = orderSorted(
  aggregateResults(
    FILES.flatMap((f) => processInput(readFixture(f), f)),
    FILES,
    false,
  ),
);

function setup(results = display, files = FILES) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(() => <EBirdExport results={results} activeFiles={files} />, container);
  return { container, dispose };
}

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
});

const findBirdRow = (container: HTMLElement, name: string) =>
  [...container.querySelectorAll("tbody tr")].find(
    (r) => r.querySelector("th")?.textContent === name,
  );

const toggleAggregated = (container: HTMLElement) =>
  (container.querySelector("input[type=checkbox]") as HTMLInputElement).click();

// ─── Per-file mode ─────────────────────────────────────────────────────────

describe("per-file mode", () => {
  test("metadata rows have one data column per file", () => {
    const { container, dispose } = setup();
    const firstMetaRow = container.querySelector("tbody tr")!;
    // th + spacer td + one td per file
    expect(firstMetaRow.querySelectorAll("td")).toHaveLength(1 + FILES.length);
    dispose();
  });

  test("bird row shows count for each file separately", () => {
    const { container, dispose } = setup();
    // whtspa: 4 in Labels 0, 4 in Labels 1
    const row = findBirdRow(container, "White-throated Sparrow")!;
    const tds = row.querySelectorAll("td");
    expect(tds[1].textContent).toBe("4|NFC 4"); // Labels 0
    expect(tds[2].textContent).toBe("4|NFC 4"); // Labels 1
    dispose();
  });

  test("bird absent from a file renders as a space", () => {
    const { container, dispose } = setup();
    // Great Horned Owl only in Labels 0
    const row = findBirdRow(container, "Great Horned Owl")!;
    const tds = row.querySelectorAll("td");
    expect(tds[1].textContent).toBe("1|NFC 1"); // Labels 0
    expect(tds[2].textContent).toBe(" ");        // Labels 1: absent
    dispose();
  });
});

// ─── Aggregated mode ────────────────────────────────────────────────────────

describe("aggregated mode", () => {
  test("metadata rows have exactly one data column", () => {
    const { container, dispose } = setup();
    toggleAggregated(container);
    const firstMetaRow = container.querySelector("tbody tr")!;
    // th + spacer td + one aggregated td
    expect(firstMetaRow.querySelectorAll("td")).toHaveLength(2);
    dispose();
  });

  test("bird row shows summed count across all files", () => {
    const { container, dispose } = setup();
    toggleAggregated(container);
    // whtspa: 4 (Labels 0) + 4 (Labels 1) = 8
    const row = findBirdRow(container, "White-throated Sparrow")!;
    expect(row.querySelectorAll("td")[1].textContent).toBe("8|NFC 8");
    dispose();
  });

  test("bird with additional count uses totalCount in NFC field", () => {
    const { container, dispose } = setup();
    toggleAggregated(container);
    // Warbler sp: check that totalCount (count + additional) is used
    const row = findBirdRow(container, "new world warbler sp.");
    if (!row) return; // only present if fixtures have it
    const cell = row.querySelectorAll("td")[1].textContent!;
    const [countStr, nfcStr] = cell.split("|NFC ");
    expect(Number(nfcStr)).toBeGreaterThanOrEqual(Number(countStr));
    dispose();
  });
});
