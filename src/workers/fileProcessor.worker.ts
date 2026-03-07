import { processInput, type Result } from "../lib/processFile";

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
