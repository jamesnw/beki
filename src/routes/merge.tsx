import { createSignal } from "solid-js";
import groups, { type NFCGroup } from "../data/nfc";
import { ebirdToBirdMap, type BirdCode } from "../codes";

interface Result {
  start: string;
  end: string;
  name: string;
  strength?: string;
  count: number;
  additional: number;
  audio: boolean;
  fileName?: string;
  fullBird?: BirdCode;
  nfcGroup?: NFCGroup;
}

const processLine = (line: string) => {
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
  const output = {
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

function Merge() {
  const [results, setResults] = createSignal<Result[]>([]);
  const [processedFiles, setProcessedFiles] = createSignal<string[]>([]);
  const [combine, setCombine] = createSignal(true);
  const [sortBy, setSortBy] = createSignal<"count" | "name" | "order">("count");

  const grouped = () => {
    if (!combine()) return Object.groupBy(results(), (l) => l.name);
    return Object.groupBy(
      results(),
      (l) => groups.get(l.name)?.parent || l.name,
    );
  };

  const display = () => {
    const res = Object.entries(grouped())
      .map(([name, items]) => ({
        name,
        totalCount: items?.reduce(
          (acc, item) => acc + item.count + item.additional,
          0,
        ),
        additional: items?.reduce((acc, item) => acc + item.additional, 0),
        count: items?.reduce((acc, item) => acc + item.count, 0),
        audio: items?.some((item) => item.audio),
        times: items?.map((item) => ({
          start: item.start,
          end: item.end,
          file: item.fileName,
        })),
        fullBird: ebirdToBirdMap.get(name),
        nfcGroup: groups.get(name),
      }))
      .sort((a, b) => (b?.count ?? 1) - (a?.count ?? 1));
    return res;
  };
  const sortedDisplay = () => {
    switch (sortBy()) {
      case "count":
        return display().sort((a, b) => (b?.count ?? 1) - (a?.count ?? 1));
      case "name":
        return display().sort((a, b) => a.name.localeCompare(b.name));
      case "order":
        return display().sort(
          (a, b) =>
            (a.fullBird?.SORT_INDEX ?? 99999) -
            (b.fullBird?.SORT_INDEX ?? 99999),
        );
    }
  };

  const totalBirds = () => {
    return display().reduce((acc, item) => acc + (item.totalCount ?? 0), 0);
  };

  const processInput = (input: string, file: string) => {
    let lines = input.split("\n").map(processLine) as Result[];

    lines = lines.filter((l) => l?.name !== undefined);
    lines = lines.filter((l) => l !== undefined);
    lines = lines.map((l) => ({ ...l, fileName: file }));

    // Remove old results from the same file, then add new results
    setResults((res) => [...res.filter((r) => r.fileName !== file), ...lines]);

    // Update processed files (remove duplicate if exists, then add)
    setProcessedFiles((files) => {
      const filtered = files.filter((f) => f !== file);
      return [...filtered, file];
    });
  };

  const filesChanged = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      Array.from(target.files).forEach((file) => {
        if (!file.name.endsWith(".txt")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === "string") {
            processInput(text, file.name);
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
      <ul>
        {processedFiles()
          .sort()
          .map((f) => (
            <li>{f}</li>
          ))}
      </ul>

      <hr />
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
            {sortedDisplay().map((r) => (
              <tr>
                <td>
                  <details>
                    <summary>{r.name}</summary>
                    {r.times?.sort().map((t) => (
                      <div>
                        {t.file}:{t.start}-{t.end}
                      </div>
                    ))}
                  </details>
                </td>
                <td>{r.count}</td>
                <td>{r.totalCount}</td>
                <td>{r.audio ? "Yes" : "No"}</td>
                <td>
                  {r.fullBird && (
                    <a target="_blank" href={`/bird/${r.fullBird.SPEC}`}>
                      {r.fullBird.COMMONNAME}
                    </a>
                  )}
                  {r.nfcGroup && (
                    <a target="_blank" href={`/nfc#${r.name}`}>
                      {r.nfcGroup.description}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </table>
        </>
      )}
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
          then add an additional label track. I have "Typing Creates New Labels"
          enabled, and add a new label for each verified call. I then export the
          label track (you may need to delete the Nighthawk track first) and
          upload it here.
        </p>
        <h3>Custom label format</h3>
        <p>
          The species of the call must come first. It doesn't matter if you use
          4 or 6 letter (or other) shortcodes for a species, it just has to be
          consistent across labels. I use <code>w</code> for warbler sp.'s, and{" "}
          <code>th</code> for thrush sp.'s.
        </p>
        <p>
          After the species, add a space, and then the estimated number of
          birds. If there are more NFCs then birds, add <code>+</code> and then
          the number of additional calls.
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
            <code>w 3 +2</code> - three warblers, plus two additional calls, no
            audio
          </li>
        </ul>
        <p>
          If you upload a file with the same name as a file already it
          processed, it will replace the previous file. If it has a different
          file name, it will be combined with the existing counts.
        </p>
        <p>
          Note: All processing is done on your computer, and is never uploaded.
          I have enough of my own NFCs to comb through... I don't want yours.
        </p>
      </section>
    </div>
  );
}

export default Merge;
