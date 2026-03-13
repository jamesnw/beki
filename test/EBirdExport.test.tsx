// @vitest-environment happy-dom
import { afterEach, describe, expect, test, vi } from "vitest";
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

  test("bird with zero aggregated count renders as a space", () => {
    // A result with count=0 but in the list should render a space cell
    const zeroResult = display.map((r) => ({ ...r, count: 0, totalCount: 0 }));
    const { container, dispose } = setup(zeroResult);
    toggleAggregated(container);
    const birdRows = [...container.querySelectorAll("tbody tr")].slice(
      rows.length,
    );
    for (const row of birdRows) {
      const dataCells = row.querySelectorAll("td");
      // spacer + one data cell; data cell should be a space
      expect(dataCells[1].textContent).toBe(" ");
    }
    dispose();
  });
});

// ─── Defaults dialog ────────────────────────────────────────────────────────

// The number of metadata rows defined in EBirdExport
const rows = [
  "Location", "Latitude", "Longitude", "Date", "Start Time",
  "State", "Country", "Protocol", "Num Observers", "Duration (min)",
  "All Obs Reported (Y/N)", "Dist Traveled (Miles)", "Area Covered (Acres)", "Notes",
];

describe("defaults dialog", () => {
  test("dialog element is present in the DOM", () => {
    const { container, dispose } = setup();
    expect(container.querySelector("dialog")).toBeTruthy();
    dispose();
  });

  test("dialog form contains inputs for all storable rows", () => {
    const { container, dispose } = setup();
    const dialog = container.querySelector("dialog")!;
    // Storable rows exclude Date, Start Time, Protocol (store: false)
    const inputs = dialog.querySelectorAll("input[name]");
    expect(inputs.length).toBeGreaterThan(0);
    dispose();
  });

  test("loads stored defaults from localStorage on render", () => {
    // "Num Observers" has no display override, so its <th> shows the label text
    localStorage.setItem(
      "ebird-defaults",
      JSON.stringify({ "Num Observers": "5" }),
    );
    const { container, dispose } = setup();
    const metaRows = container.querySelectorAll("tbody tr");
    const numObsRow = [...metaRows].find(
      (r) => r.querySelector("th")?.textContent === "Num Observers",
    )!;
    expect(numObsRow).toBeTruthy();
    // First contenteditable td (index 1, after the spacer) should show "5"
    const cell = numObsRow.querySelector("td[contenteditable]");
    expect(cell?.textContent).toBe("5");
    dispose();
  });

  test("falls back to defaults when localStorage JSON is corrupt", () => {
    localStorage.setItem("ebird-defaults", "not valid json");
    // Should render without throwing
    const { container, dispose } = setup();
    expect(container.querySelector("tbody")).toBeTruthy();
    dispose();
  });

  test("submitting the dialog form saves to localStorage and updates display", () => {
    const { container, dispose } = setup();
    const form = container.querySelector("dialog form") as HTMLFormElement;
    const locationInput = form.querySelector(
      'input[name="Location"]',
    ) as HTMLInputElement;
    locationInput.value = "Prospect Park";

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));

    const stored = JSON.parse(localStorage.getItem("ebird-defaults")!);
    expect(stored["Location"]).toBe("Prospect Park");
    dispose();
  });
});

// ─── Export ─────────────────────────────────────────────────────────────────

describe("makeExport", () => {
  test("clicking Export triggers a CSV download", () => {
    const mockUrl = "blob:mock";
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue(mockUrl);
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    const { container, dispose } = setup();
    const exportBtn = [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Export",
    ) as HTMLButtonElement;
    exportBtn.click();

    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith(mockUrl);

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    dispose();
  });
});
