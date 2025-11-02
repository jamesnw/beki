interface Result {
  start: string;
  end: string;
  name: string;
  strength?: string;
  count: number;
  additional: number;
  audio: boolean;
  fileName?: string;
}

interface ProcessFileMessage {
  type: "PROCESS_FILE";
  content: string;
  fileName: string;
}

export interface ProcessFileResponse {
  type: "FILE_PROCESSED";
  results: Result[];
  bucketCounts: Record<string, number>;
  fileName: string;
}

const processLine = (line: string): Result | undefined => {
  const parts = line.split("\t");
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
    let [_, name, strength] = res || [null, label, "0"];
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
    else console.warn("Unknown label part:", labelParts[i]);
  }
  return output;
};

const processInput = (input: string, fileName: string): Result[] => {
  let lines = input.split("\n").map(processLine) as Result[];

  lines = lines.filter((l) => l?.name !== undefined);
  lines = lines.filter((l) => l !== undefined);
  lines = lines.map((l) => ({ ...l, fileName }));

  return lines;
};

const NUMBER_OF_BUCKETS = 20;
const getBucketCounts = (results: Result[]): Record<string, number> => {
  const lastTime = results[results.length - 1]?.end || "3600.000";
  const maxTime = parseFloat(lastTime);
  const bucketSize = maxTime / NUMBER_OF_BUCKETS;
  const bucketCounts: Record<string, number> = {};

  for (let i = 0; i < NUMBER_OF_BUCKETS; i++) {
    const bucketStart = (i * bucketSize).toFixed(3);
    const bucketEnd = ((i + 1) * bucketSize).toFixed(3);
    const bucketKey = `${bucketStart}-${bucketEnd}`;
    bucketCounts[bucketKey] = 0;
  }

  results.forEach((result) => {
    const resultEnd = parseFloat(result.end);
    const bucketIndex = Math.min(
      Math.floor(resultEnd / bucketSize),
      NUMBER_OF_BUCKETS - 1,
    );
    const bucketStart = (bucketIndex * bucketSize).toFixed(3);
    const bucketEnd = ((bucketIndex + 1) * bucketSize).toFixed(3);
    const bucketKey = `${bucketStart}-${bucketEnd}`;
    bucketCounts[bucketKey] += result.count;
  });

  return bucketCounts;
};

// Listen for messages from the main thread
self.addEventListener("message", (event: MessageEvent<ProcessFileMessage>) => {
  const { type, content, fileName } = event.data;

  if (type === "PROCESS_FILE") {
    const results = processInput(content, fileName);
    const bucketCounts = getBucketCounts(results);

    const response: ProcessFileResponse = {
      type: "FILE_PROCESSED",
      results,
      bucketCounts,
      fileName,
    };

    self.postMessage(response);
  }
});

export {};
