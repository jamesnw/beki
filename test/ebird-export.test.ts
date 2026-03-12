import { readFileSync } from "fs";
import { join } from "path";
import { describe, test, expect } from "vitest";
import { processInput } from "../src/lib/processFile";
import {
  aggregateResults,
  orderSorted,
  formatBirdCsvRows,
  formatBirdCsvRowsAggregated,
} from "../src/lib/aggregateResults";

const fixtureDir = join(import.meta.dirname, "fixtures");

function readFixture(name: string): string {
  return readFileSync(join(fixtureDir, name), "utf-8");
}

// ─── processInput ──────────────────────────────────────────────────────────

describe("processInput", () => {
  test("Labels 0 - basic labels", () => {
    const results = processInput(readFixture("Labels 0.txt"), "Labels 0.txt");
    expect(results).toHaveLength(9);
    expect(results.every((r) => r.fileName === "Labels 0.txt")).toBe(true);
  });

  test("Labels 1 - count in label", () => {
    const results = processInput(readFixture("Labels 1.txt"), "Labels 1.txt");
    expect(results).toHaveLength(13);
    const counted = results.find(
      (r) => r.name === "whtspa" && r.count === 2,
    );
    expect(counted).toBeDefined();
  });

  test("Labels 2 - many entries", () => {
    const results = processInput(readFixture("Labels 2.txt"), "Labels 2.txt");
    expect(results).toHaveLength(19);
  });

  test("Labels 3 - minimal", () => {
    const results = processInput(readFixture("Labels 3.txt"), "Labels 3.txt");
    expect(results).toHaveLength(2);
  });

  test("Labels 4 - minimal", () => {
    const results = processInput(readFixture("Labels 4.txt"), "Labels 4.txt");
    expect(results).toHaveLength(3);
  });

  test("Labels 5 - minimal", () => {
    const results = processInput(readFixture("Labels 5.txt"), "Labels 5.txt");
    expect(results).toHaveLength(2);
  });
});

// ─── aggregateResults (single file, no combining) ─────────────────────────

describe("aggregateResults - single file", () => {
  test("Labels 0 counts per species", () => {
    const file = "Labels 0.txt";
    const results = processInput(readFixture(file), file);
    const display = aggregateResults(results, [file], false);

    const byName = Object.fromEntries(display.map((d) => [d.name, d]));

    expect(byName["whtspa"].count).toBe(4);
    expect(byName["whtspa"].fileCounts![file].count).toBe(4);

    expect(byName["w"].count).toBe(1);
    expect(byName["swathr"].count).toBe(1);
    expect(byName["savspa"].count).toBe(1);
    expect(byName["grhowl"].count).toBe(1);
    expect(byName["p"].count).toBe(1);
  });

  test("Labels 1 - whtspa count sums correctly", () => {
    const file = "Labels 1.txt";
    const results = processInput(readFixture(file), file);
    const display = aggregateResults(results, [file], false);
    const byName = Object.fromEntries(display.map((d) => [d.name, d]));

    // whtspa 2 + whtspa + whtspa = 4
    expect(byName["whtspa"].count).toBe(4);
    expect(byName["sp"].count).toBe(3);
    expect(byName["w"].count).toBe(3);
    expect(byName["savspa"].count).toBe(2);
  });

  test("Labels 2 - warbler counts", () => {
    const file = "Labels 2.txt";
    const results = processInput(readFixture(file), file);
    const display = aggregateResults(results, [file], false);
    const byName = Object.fromEntries(display.map((d) => [d.name, d]));

    expect(byName["w"].count).toBe(17);
    expect(byName["whtspa"].count).toBe(1);
    expect(byName["ovenbi"].count).toBe(1);
  });
});

// ─── aggregateResults - multiple files ─────────────────────────────────────

describe("aggregateResults - multiple files", () => {
  const files = [
    "Labels 0.txt",
    "Labels 1.txt",
    "Labels 2.txt",
    "Labels 3.txt",
    "Labels 4.txt",
    "Labels 5.txt",
  ];

  const allResults = files.flatMap((f) =>
    processInput(readFixture(f), f),
  );

  test("fileCounts are isolated per file", () => {
    const display = aggregateResults(allResults, files, false);
    const byName = Object.fromEntries(display.map((d) => [d.name, d]));

    // whtspa appears in Labels 0, 1, 2 only
    expect(byName["whtspa"].fileCounts!["Labels 0.txt"].count).toBe(4);
    expect(byName["whtspa"].fileCounts!["Labels 1.txt"].count).toBe(4);
    expect(byName["whtspa"].fileCounts!["Labels 2.txt"].count).toBe(1);
    expect(byName["whtspa"].fileCounts!["Labels 3.txt"].count).toBe(0);
    expect(byName["whtspa"].fileCounts!["Labels 4.txt"].count).toBe(0);
    expect(byName["whtspa"].fileCounts!["Labels 5.txt"].count).toBe(0);
  });

  test("aggregate totals across files", () => {
    const display = aggregateResults(allResults, files, false);
    const byName = Object.fromEntries(display.map((d) => [d.name, d]));

    // w: 1 (L0) + 3 (L1) + 17 (L2) + 1 (L3) + 1 (L4) = 23
    expect(byName["w"].count).toBe(23);
    // savspa: 1 (L0) + 2 (L1) + 1 (L5) = 4
    expect(byName["savspa"].count).toBe(4);
  });
});

// ─── formatBirdCsvRowsAggregated ───────────────────────────────────────────

describe("formatBirdCsvRowsAggregated", () => {
  test("sums counts across all files into one column", () => {
    const files = ["Labels 0.txt", "Labels 1.txt"];
    const allResults = files.flatMap((f) => processInput(readFixture(f), f));
    const display = aggregateResults(allResults, files, false);
    const ordered = orderSorted(display);
    const rows = formatBirdCsvRowsAggregated(ordered);

    // whtspa: 4 (L0) + 4 (L1) = 8 count, no additional
    const whtspaRow = rows.find((r) => r.startsWith("White-throated Sparrow"));
    expect(whtspaRow).toBe("White-throated Sparrow, ,8|NFC 8");

    // w: 1 (L0) + 3 (L1) = 4 count, no additional
    const wRow = rows.find((r) => r.startsWith("new world warbler sp."));
    expect(wRow).toBe("new world warbler sp., ,4|NFC 4");
  });

  test("species with zero total count renders as space", () => {
    // Labels 3 has no grhowl; Labels 0 has 1 grhowl
    const files = ["Labels 3.txt"];
    const allResults = files.flatMap((f) => processInput(readFixture(f), f));
    const display = aggregateResults(allResults, files, false);
    const ordered = orderSorted(display);
    const rows = formatBirdCsvRowsAggregated(ordered);

    // no grhowl in Labels 3 — should not appear at all
    expect(rows.find((r) => r.startsWith("Great Horned Owl"))).toBeUndefined();
  });

  test("all six fixtures snapshot", () => {
    const files = [
      "Labels 0.txt",
      "Labels 1.txt",
      "Labels 2.txt",
      "Labels 3.txt",
      "Labels 4.txt",
      "Labels 5.txt",
    ];
    const allResults = files.flatMap((f) => processInput(readFixture(f), f));
    const display = aggregateResults(allResults, files, false);
    const ordered = orderSorted(display);
    const rows = formatBirdCsvRowsAggregated(ordered);
    expect(rows).toMatchSnapshot();
  });
});

// ─── formatBirdCsvRows ─────────────────────────────────────────────────────

describe("formatBirdCsvRows", () => {
  test("single file - species with zero count renders as space", () => {
    const files = ["Labels 0.txt", "Labels 3.txt"];
    const allResults = files.flatMap((f) => processInput(readFixture(f), f));
    const display = aggregateResults(allResults, files, false);
    const ordered = orderSorted(display);
    const rows = formatBirdCsvRows(ordered, files);

    // grhowl only appears in Labels 0; Labels 3 should be a space
    const grhowlRow = rows.find((r) => r.startsWith("Great Horned Owl"));
    expect(grhowlRow).toBeDefined();
    expect(grhowlRow).toBe("Great Horned Owl, ,1|NFC 1, ");

    // w appears in both files
    const wRow = rows.find((r) => r.startsWith("new world warbler sp."));
    expect(wRow).toBeDefined();
    expect(wRow).toBe("new world warbler sp., ,1|NFC 1,1|NFC 1");
  });

  test("field-guide order - all six fixtures snapshot", () => {
    const files = [
      "Labels 0.txt",
      "Labels 1.txt",
      "Labels 2.txt",
      "Labels 3.txt",
      "Labels 4.txt",
      "Labels 5.txt",
    ];
    const allResults = files.flatMap((f) => processInput(readFixture(f), f));
    const display = aggregateResults(allResults, files, false);
    const ordered = orderSorted(display);
    const rows = formatBirdCsvRows(ordered, files);
    expect(rows).toMatchSnapshot();
  });
});
