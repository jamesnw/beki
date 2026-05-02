import { describe, expect, test } from "vitest";
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
    expect(result?.results?.[0]?.name).toBe("whtspa");
    expect(result?.results?.[0]?.count).toBe(1);
    expect(result?.results?.[0]?.additional).toBe(0);
    expect(result?.results?.[0]?.audio).toBe(false);
    expect(result?.results?.[0]?.start).toBe("0.000");
    expect(result?.results?.[0]?.end).toBe("1.000");
  });

  test("parses a label with explicit count", () => {
    const result = processLine("0.0\t0.0\twhtspa 3");
    expect(result?.results?.[0]?.name).toBe("whtspa");
    expect(result?.results?.[0]?.count).toBe(3);
  });

  test("parses a label with +additional count", () => {
    const result = processLine("0.0\t0.0\twhtspa 2 +5");
    expect(result?.results?.[0]?.name).toBe("whtspa");
    expect(result?.results?.[0]?.count).toBe(2);
    expect(result?.results?.[0]?.additional).toBe(5);
  });

  test("parses a label with audio flag", () => {
    const result = processLine("0.0\t0.0\twhtspa audio");
    expect(result?.results?.[0]?.audio).toBe(true);
    expect(result?.results?.[0]?.name).toBe("whtspa");
  });

  test("parses a label with count, additional, and audio", () => {
    const result = processLine("0.0\t0.0\twhtspa 2 +3 audio");
    expect(result?.results?.[0]?.name).toBe("whtspa");
    expect(result?.results?.[0]?.count).toBe(2);
    expect(result?.results?.[0]?.additional).toBe(3);
    expect(result?.results?.[0]?.audio).toBe(true);
  });

  test("parses Nighthawk format (species with confidence)", () => {
    const result = processLine("1.500\t1.600\tAmerican Robin (0.87)");
    expect(result?.results?.[0]?.name).toBe("American Robin");
    expect(result?.results?.[0]?.strength).toBe("0.87");
    expect(result?.results?.[0]?.count).toBe(1);
    expect(result?.results?.[0]?.additional).toBe(0);
    expect(result?.results?.[0]?.audio).toBe(false);
  });

  test("Nighthawk format parses confidence with more decimals", () => {
    const result = processLine("0.0\t0.0\tSong Sparrow (0.9)");
    expect(result?.results?.[0]?.name).toBe("Song Sparrow");
    expect(result?.results?.[0]?.strength).toBe("0.90");
  });

  test("rounds start and end times to 3 decimal places", () => {
    const result = processLine("888.7379590\t888.7379590\twhtspa");
    expect(result?.results?.[0]?.start).toBe("888.738");
    expect(result?.results?.[0]?.end).toBe("888.738");
  });

  test("warns on unknown label part", () => {
    const result = processLine("0.0\t0.0\twhtspa unknown_part");
    expect(result?.warnings?.[0]).toMatch(/Unknown label part.*unknown_part/);
  });
});

describe("processInput", () => {
  test("processes multiple lines and attaches fileName", () => {
    const input = "0.0\t1.0\twhtspa\n1.0\t2.0\tsonspa 2";
    const output = processInput(input, "test.txt");
    expect(output.results).toHaveLength(2);
    expect(output.results[0].fileName).toBe("test.txt");
    expect(output.results[1].fileName).toBe("test.txt");
    expect(output.results[1].count).toBe(2);
  });

  test("filters out lines with fewer than 3 parts", () => {
    const input = "0.0\t1.0\twhtspa\nbad line\n2.0\t3.0\tsonspa";
    const output = processInput(input, "f.txt");
    expect(output.results).toHaveLength(2);
  });

  test("returns empty array for empty input", () => {
    const output = processInput("", "f.txt");
    expect(output.results).toHaveLength(0);
  });
});
