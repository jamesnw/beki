import { createSignal } from "solid-js";
import nfcGroups from "../data/nfc";
import groups from "../data/nfc";

const processLine = (line: string) => {
  const parts = line.split("\t");
  if (parts.length < 3) {
    return;
  }
  let [start, end, label] = parts;
  start = parseFloat(start).toFixed(3);
  end = parseFloat(end).toFixed(3);
  // Nighthawk output
  const res = label.match(/(.*) \((.*)\)/);
  if (res) {
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
  const [results, setResults] = createSignal([]);
  const [processedFiles, setProcessedFiles] = createSignal<string[]>([]);
  const [combine, setCombine] = createSignal(true);

  const grouped = () => {
    if (!combine()) return Object.groupBy(results(), (l) => l?.name);
    return Object.groupBy(
      results(),
      (l) => groups.get(l?.name)?.parent || l?.name,
    );
  };

  const display = () => {
    let res = Object.entries(grouped())
      .map(([name, items]) => ({
        name,
        totalCount: items.reduce(
          (acc, item) => acc + item.count + item.additional,
          0,
        ),
        additional: items.reduce((acc, item) => acc + item.additional, 0),
        count: items.reduce((acc, item) => acc + item.count, 0),
        audio: items.some((item) => item.audio),
      }))
      .sort((a, b) => b.count - a.count);
    return res;
  };

  const processInput = (input: string, file) => {
    let lines = input.split("\n").map(processLine);

    lines = lines.filter((l) => l?.name !== undefined);
    setResults((res) => [...res, ...lines]);
    setProcessedFiles((files) => [...files, file]);
  };

  const filesChanged = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      Array.from(target.files).forEach((file) => {
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
            {combine() ? "Merging NFC groups with parents" : "Not merging NFC groups with parents"}{" "}
          </label>
        </div>
      </div>
      <ul>
        {processedFiles().map((f) => (
          <li>{f}</li>
        ))}
      </ul>

      <hr />
      {display().length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Count</th>
              <th>NFC Total</th>
              <th>Audio</th>
            </tr>
          </thead>
          {display().map((r) => (
            <tr>
              <td>{r.name}</td>
              <td>{r.count}</td>
              <td>{r.totalCount}</td>
              <td>{r.audio ? "Yes" : "No"}</td>
            </tr>
          ))}
        </table>
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
      </section>
    </div>
  );
}

export default Merge;
