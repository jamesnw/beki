export interface Result {
  start: string;
  end: string;
  name: string;
  strength?: string;
  count: number;
  additional: number;
  audio: boolean;
  fileName?: string;
}

export interface ProcessResult {
  results: Result[];
  warnings: string[];
}

export const processLine = (line: string): ProcessResult | undefined => {
  const parts = line.split("\t");
  const warnings = [];
  if (parts.length < 3) {
    return;
  }
  // eslint-disable-next-line
  let [start, end, label] = parts;
  start = parseFloat(start).toFixed(3);
  end = parseFloat(end).toFixed(3);
  // Nighthawk output
  const res = label.match(/(.*) \((.*)\)/);
  if (res) {
    // eslint-disable-next-line
    let [_, name, strength] = res;
    strength = parseFloat(strength).toFixed(2);
    return {
      start,
      end,
      name,
      strength,
      count: 1,
      additional: 0,
      audio: false,
    };
  }
  // My format
  const labelParts = label.split(" ");
  const output: Result = {
    start,
    end,
    name: "",
    count: 1,
    additional: 0,
    audio: false,
  };
  for (let i = 0; i < labelParts.length; i++) {
    if (i === 0) output.name = labelParts[i];
    else if (labelParts[i].match(/^\d+$/))
      output.count = parseInt(labelParts[i]);
    else if (labelParts[i].match(/^\+\d+$/))
      output.additional = parseInt(labelParts[i].substring(1));
    else if (labelParts[i] === "audio") output.audio = true;
    else warnings?.push(`Unknown label part: "${labelParts[i]}" in line: "${line}"`);
  }
  return { results: [output], warnings };
};

export const processInput = (input: string, fileName: string): ProcessResult => {
  const results = input.split("\n").map((line) => processLine(line)) as ProcessResult[];
  let lines = results.flatMap((r) => r?.results || []);
  const warnings = results.flatMap((r) => r?.warnings || []);
  lines = lines.filter((l) => l?.name !== undefined);
  lines = lines.filter((l) => l !== undefined);
  lines = lines.map((l) => ({ ...l, fileName }));
  return { results: lines, warnings };
};
