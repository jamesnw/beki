import { describe, expect, test, vi } from "vitest";
import { processLine, processInput } from "../src/lib/processFile";

describe("processLine", () => {
  test("returns undefined for lines with fewer than 3 tab-separated parts", () => {
    expect(processLine("0.0\t1.0")).toBeUndefined();
    expect(processLine("alone")).toBeUndefined();
    expect(processLine("")).toBeUndefined();
  });

  test("parses a basic label line", () => {
    const result = processLine("0.000\t1.000\twhtspa");
    expect(result).toBeDefined();
    expect(result?.name).toBe("whtspa");
    expect(result?.count).toBe(1);
    expect(result?.additional).toBe(0);
    expect(result?.audio).toBe(false);
    expect(result?.start).toBe("0.000");
    expect(result?.end).toBe("1.000");
  });

  test("parses a label with explicit count", () => {
    const result = processLine("0.0\t0.0\twhtspa 3");
    expect(result?.name).toBe("whtspa");
    expect(result?.count).toBe(3);
  });

  test("parses a label with +additional count", () => {
    const result = processLine("0.0\t0.0\twhtspa 2 +5");
    expect(result?.name).toBe("whtspa");
    expect(result?.count).toBe(2);
    expect(result?.additional).toBe(5);
  });

  test("parses a label with audio flag", () => {
    const result = processLine("0.0\t0.0\twhtspa audio");
    expect(result?.audio).toBe(true);
    expect(result?.name).toBe("whtspa");
  });

  test("parses a label with count, additional, and audio", () => {
    const result = processLine("0.0\t0.0\twhtspa 2 +3 audio");
    expect(result?.name).toBe("whtspa");
    expect(result?.count).toBe(2);
    expect(result?.additional).toBe(3);
    expect(result?.audio).toBe(true);
  });

  test("parses Nighthawk format (species with confidence)", () => {
    const result = processLine("1.500\t1.600\tAmerican Robin (0.87)");
    expect(result?.name).toBe("American Robin");
    expect(result?.strength).toBe("0.87");
    expect(result?.count).toBe(1);
    expect(result?.additional).toBe(0);
    expect(result?.audio).toBe(false);
  });

  test("Nighthawk format parses confidence with more decimals", () => {
    const result = processLine("0.0\t0.0\tSong Sparrow (0.9)");
    expect(result?.name).toBe("Song Sparrow");
    expect(result?.strength).toBe("0.90");
  });

  test("rounds start and end times to 3 decimal places", () => {
    const result = processLine("888.7379590\t888.7379590\twhtspa");
    expect(result?.start).toBe("888.738");
    expect(result?.end).toBe("888.738");
  });

  test("warns on unknown label part", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    processLine("0.0\t0.0\twhtspa unknown_part");
    expect(warnSpy).toHaveBeenCalledWith(
      "Unknown label part:",
      "unknown_part",
    );
    warnSpy.mockRestore();
  });
});

describe("processInput", () => {
  test("processes multiple lines and attaches fileName", () => {
    const input = "0.0\t1.0\twhtspa\n1.0\t2.0\tsonspa 2";
    const results = processInput(input, "test.txt");
    expect(results).toHaveLength(2);
    expect(results[0].fileName).toBe("test.txt");
    expect(results[1].fileName).toBe("test.txt");
    expect(results[1].count).toBe(2);
  });

  test("filters out lines with fewer than 3 parts", () => {
    const input = "0.0\t1.0\twhtspa\nbad line\n2.0\t3.0\tsonspa";
    const results = processInput(input, "f.txt");
    expect(results).toHaveLength(2);
  });

  test("returns empty array for empty input", () => {
    expect(processInput("", "f.txt")).toHaveLength(0);
  });
});
