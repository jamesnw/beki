import { createSignal, onCleanup, For, Show } from "solid-js";
import FileProcessorWorker from "../workers/fileProcessor.worker.ts?worker";
import type { ProcessFileResponse } from "../workers/fileProcessor.worker";
import type { Result } from "../lib/processFile";
import {
  aggregateResults,
  orderSorted,
  shortBirdCodes,
} from "../lib/aggregateResults";
import type { DisplayResult } from "../lib/aggregateResults";
import Sparkline from "../components/Sparkline";
import EBirdExport from "../components/EBirdExport";

export type { DisplayResult };

function Merge() {
  const [results, setResults] = createSignal<Result[]>([]);
  const [processedFiles, setProcessedFiles] = createSignal<string[]>([]);
  const [excludedFiles, setExcludedFiles] = createSignal<Set<string>>(
    new Set(),
  );
  const [fileBucketCounts, setFileBucketCounts] = createSignal<
    Record<string, Record<string, number>>
  >({});
  const [combine, setCombine] = createSignal(true);
  const [sortBy, setSortBy] = createSignal<"count" | "name" | "order">("count");
  const [processingFiles, setProcessingFiles] = createSignal<Set<string>>(
    new Set(),
  );
  const [fileTexts, setFileTexts] = createSignal<Record<string, string>>({});
  const [editingName, setEditingName] = createSignal<string | null>(null);
  const [editValue, setEditValue] = createSignal("");
  const [activeTab, setActiveTab] = createSignal<"results" | "ebird">(
    "results",
  );
  const [fileWarnings, setFileWarnings] = createSignal<Record<string, string[]>>({});

  // Initialize the worker
  const worker = new FileProcessorWorker();

  // Handle messages from the worker
  worker.onmessage = (event: MessageEvent<ProcessFileResponse>) => {
    if (event.data.type === "FILE_PROCESSED") {
      const { results: newResults, fileName, bucketCounts, warnings } = event.data;
      setFileBucketCounts((prev) => ({
        ...prev,
        [fileName]: bucketCounts,
      }));

      // Remove old results from the same file, then add new results
      setResults((res) => [
        ...res.filter((r) => r.fileName !== fileName),
        ...newResults,
      ]);

      // Update processed files (remove duplicate if exists, then add)
      setProcessedFiles((files) => {
        const filtered = files.filter((f) => f !== fileName);
        return [...filtered, fileName];
      });

      // Store warnings for this file
      setFileWarnings((prev: Record<string, string[]>) => ({ ...prev, [fileName]: warnings }));

      // Remove from processing set
      setProcessingFiles((files) => {
        const next = new Set(files);
        next.delete(fileName);
        return next;
      });
    }
  };

  // Clean up worker when component unmounts
  onCleanup(() => {
    worker.terminate();
  });

  const activeResults = () => {
    return results().filter((r) => !excludedFiles().has(r.fileName || ""));
  };

  const maxBucketCount = () => {
    const allCounts = Object.values(fileBucketCounts()).flatMap((bc) =>
      Object.values(bc),
    );
    return Math.max(...allCounts, 0);
  };

  const activeFilesList = () =>
    processedFiles()
      .filter((f) => !excludedFiles().has(f))
      .sort();

  const activeWarnings = () => {
    const entries = Object.entries(fileWarnings()) as [string, string[]][];
    return entries
      .filter(([f]) => !excludedFiles().has(f))
      .filter(([, w]) => w.length > 0);
  };

  const display = () =>
    aggregateResults(activeResults(), activeFilesList(), combine());

  const orderSortedDisplay = () => orderSorted(display());

  const sortedDisplay = () => {
    switch (sortBy()) {
      case "count":
        return [...display()].sort((a, b) => (b?.count ?? 1) - (a?.count ?? 1));
      case "name":
        return [...display()].sort((a, b) => a.name.localeCompare(b.name));
      case "order":
        return orderSortedDisplay();
    }
  };

  const totalBirds = () => {
    return display().reduce((acc, item) => acc + (item.totalCount ?? 0), 0);
  };

  const renameSpecies = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingName(null);
      return;
    }
    const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`^(\\S+\\t\\S+\\t)${escaped}(\\s|$)`, "gm");
    const texts = fileTexts();
    Object.entries(texts).forEach(([fileName, text]) => {
      if (!re.test(text)) return;
      re.lastIndex = 0;
      const newText = text.replace(re, `$1${trimmed}$2`);
      setFileTexts((prev) => ({ ...prev, [fileName]: newText }));
      setProcessingFiles((prev) => new Set([...prev, fileName]));
      worker.postMessage({ type: "PROCESS_FILE", content: newText, fileName });
    });
    setEditingName(null);
  };

  const toggleFileExclusion = (fileName: string) => {
    setExcludedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileName)) {
        next.delete(fileName);
      } else {
        next.add(fileName);
      }
      return next;
    });
  };

  const filesChanged = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      Array.from(target.files).forEach((file) => {
        if (!file.name.endsWith(".txt")) return;

        // Add to processing set
        setProcessingFiles((files) => {
          const next = new Set(files);
          next.add(file.name);
          return next;
        });

        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === "string") {
            setFileTexts((prev) => ({ ...prev, [file.name]: text }));
            worker.postMessage({
              type: "PROCESS_FILE",
              content: text,
              fileName: file.name,
            });
          }
        };
        reader.readAsText(file);
      });
    }
  };

  window.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  window.addEventListener("drop", (e) => {
    if ((e.target as HTMLElement)?.id === "files") return;
    e.preventDefault();
  });

  return (
    <div class="container-m">
      <h1>Merge Page</h1>
      <div class="callout secondary">
        Merge NFC results in the Audacity Label format.
        <div class="sidecar-end">
          <input type="file" id="files" onChange={filesChanged} multiple />
          <div>
            <button
              onClick={() => {
                setResults([]);
                setProcessedFiles([]);
                setExcludedFiles(new Set<string>());
                setProcessingFiles(new Set<string>());
                setFileTexts({});
                setFileWarnings({});
                setEditingName(null);
              }}
            >
              Clear
            </button>
          </div>
          <label>
            <input
              type="checkbox"
              checked={combine()}
              onChange={(e) => setCombine(e.currentTarget.checked)}
            />
            {combine()
              ? "Merging NFC groups with parents"
              : "Not merging NFC groups with parents"}{" "}
          </label>
          <label>
            Sort by:{" "}
            <select
              value={sortBy()}
              onChange={(e) =>
                setSortBy(e.currentTarget.value as "count" | "name" | "order")
              }
            >
              <option value="count">Count</option>
              <option value="name">Name</option>
              <option value="order">Field Guide Order</option>
            </select>
          </label>
        </div>
      </div>
      {processingFiles().size > 0 && (
        <div class="callout">
          Processing {processingFiles().size} file
          {processingFiles().size > 1 ? "s" : ""}...
        </div>
      )}
      <Show when={activeWarnings().length > 0}>
        <div class="callout warning">
          <strong>Unknown label parts found:</strong>
          <ul>
            <For each={activeWarnings()}>
              {([fileName, warns]: [string, string[]]) => (
                <li>
                  <em>{fileName}</em>: {warns.join(", ")}
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
      <ul class="list-inline">
        <For each={processedFiles().sort()}>
          {(f) => (
            <li
              style={{
                opacity: excludedFiles().has(f) ? 0.5 : 1,
                "text-decoration": excludedFiles().has(f)
                  ? "line-through"
                  : "none",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={!excludedFiles().has(f)}
                  onChange={() => toggleFileExclusion(f)}
                />
                <div class="flex direction-column">
                  <Sparkline
                    data={fileBucketCounts()[f]}
                    maxBucketCount={maxBucketCount()}
                  />
                  <small>{f}</small>
                </div>
              </label>
            </li>
          )}
        </For>
      </ul>

      <hr />
      <div class="cluster" role="tablist">
        <button
          role="tab"
          class={activeTab() === "results" ? "primary" : "plain"}
          onClick={() => setActiveTab("results")}
        >
          Results
        </button>
        <button
          role="tab"
          class={activeTab() === "ebird" ? "primary" : "plain"}
          onClick={() => setActiveTab("ebird")}
        >
          eBird Export
        </button>
      </div>

      <Show when={activeTab() === "results"}>
        <section>
          <h2>Aggregated results</h2>
          {sortedDisplay().length > 0 && (
            <>
              <p>
                {totalBirds()} total birds in {display().length} groups
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Count</th>
                    <th>NFC Total</th>
                    <th>Audio</th>
                    <th>Info</th>
                  </tr>
                </thead>
                <For each={sortedDisplay()}>
                  {(r) => (
                    <tr>
                      <td>
                        <Show
                          when={editingName() === r.name}
                          fallback={
                            <details>
                              <summary>
                                {r.name}{" "}
                                <button
                                  class="size-xs plain"
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setEditingName(r.name);
                                    setEditValue(r.name);
                                  }}
                                >
                                  ✎
                                </button>
                              </summary>
                              <For each={r.times?.sort() ?? []}>
                                {(t) => (
                                  <div>
                                    {t.file}:{t.start}-{t.end}
                                  </div>
                                )}
                              </For>
                            </details>
                          }
                        >
                          <input
                            value={editValue()}
                            onInput={(e) => setEditValue(e.currentTarget.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                renameSpecies(r.name, editValue());
                              if (e.key === "Escape") setEditingName(null);
                            }}
                            autofocus
                          />
                          <button
                            class="size-xs primary"
                            onClick={() => renameSpecies(r.name, editValue())}
                          >
                            Save
                          </button>
                          <button
                            class="size-xs plain"
                            onClick={() => setEditingName(null)}
                          >
                            Cancel
                          </button>
                        </Show>
                      </td>
                      <td>{r.count}</td>
                      <td>{r.totalCount}</td>
                      <td>{r.audio ? "Yes" : "No"}</td>
                      <td>
                        {r.fullBird &&
                          (shortBirdCodes.find(
                            (sb) => sb.SPEC === r.fullBird?.SPEC,
                          ) ? (
                            <span>{r.fullBird.COMMONNAME}</span>
                          ) : (
                            <a
                              target="_blank"
                              href={`/bird/${r.fullBird.SPEC}`}
                            >
                              {r.fullBird.COMMONNAME}
                            </a>
                          ))}
                        {r.nfcGroup && (
                          <a target="_blank" href={`/nfc#${r.name}`}>
                            {r.nfcGroup.description}
                          </a>
                        )}
                      </td>
                    </tr>
                  )}
                </For>
              </table>
            </>
          )}
        </section>
        <hr />
        <section class="callout">
          <h2>Accepted formats</h2>
          <p>
            This tool takes one or more files in the Audacity Label format, and
            aggregates the calls. It can either be the output format from
            Nighthawk, or a label track from Audacity with the labels in a
            specific format.
          </p>
          <p>
            When checking NFCs, I import the Nighthawk labels into Audacity, and
            then add an additional label track. I have "Typing Creates New
            Labels" enabled, and add a new label for each verified call. I then
            export the label track (you may need to delete the Nighthawk track
            first) and upload it here.
          </p>
          <h3>Custom label format</h3>
          <p>
            The species of the call must come first. It doesn't matter if you
            use 4 or 6 letter (or other) shortcodes for a species, it just has
            to be consistent across labels. I use <code>w</code> for warbler
            sp.'s, and <code>th</code> for thrush sp.'s. Supported shortcodes
            include:
          </p>

          <ul>
            <For each={shortBirdCodes}>
              {(sb) => (
                <li>
                  <code>{sb.SPEC}</code> - {sb.COMMONNAME}
                </li>
              )}
            </For>
          </ul>

          <p>
            After the species, add a space, and then the estimated number of
            birds. If there are more NFCs then birds, add <code>+</code> and
            then the number of additional calls.
          </p>
          <p>
            Finally, if you have audio of the call, add the word{" "}
            <code>audio</code> at the end.
          </p>
          <p>Example labels:</p>
          <ul>
            <li>
              <code>amered</code> - single American Redstart
            </li>
            <li>
              <code>swathr 2 +1 audio</code> - two Swainson's Thrushes, plus one
              additional call, with audio
            </li>
            <li>
              <code>w 3 +2</code> - three warblers, plus two additional calls,
              no audio
            </li>
          </ul>
          <p>
            If you upload a file with the same name as a file already it
            processed, it will replace the previous file. If it has a different
            file name, it will be combined with the existing counts.
          </p>
          <p>
            Note: All processing is done on your computer, and is never
            uploaded. I have enough of my own NFCs to comb through... I don't
            want yours.
          </p>
        </section>
      </Show>

      <Show when={activeTab() === "ebird"}>
        <Show
          when={orderSortedDisplay().length > 0}
          fallback={<p>No results yet.</p>}
        >
          <EBirdExport
            results={orderSortedDisplay()}
            activeFiles={activeFilesList()}
          />
        </Show>
      </Show>
    </div>
  );
}

export default Merge;
