import "invokers-polyfill";
import { createSignal, For, Index } from "solid-js";
import type { DisplayResult } from "../lib/aggregateResults";

const STORAGE_KEY = "ebird-defaults";

const rows: { label: string; display?: string; default?: string; store?: false }[] = [
  { label: "Location", display: "" },
  { label: "Latitude" },
  { label: "Longitude" },
  { label: "Date", store: false },
  { label: "Start Time", store: false },
  { label: "State" },
  { label: "Country" },
  { label: "Protocol", default: "P54", store: false },
  { label: "Num Observers", default: "1" },
  { label: "Duration (min)", default: "60" },
  { label: "All Obs Reported (Y/N)", default: "N" },
  { label: "Dist Traveled (Miles)", default: "0" },
  { label: "Area Covered (Acres)", default: " " },
  { label: "Notes" },
];

const storableRows = rows.filter((r) => r.store !== false);

const DIALOG_ID = "ebird-defaults-dialog";

function EBirdExport(props: {
  results: DisplayResult[];
  activeFiles: string[];
}) {
  let dialogRef!: HTMLDialogElement;
  const [tbody, setTbody] = createSignal<HTMLTableSectionElement | null>(null);

  const loadedDefaults = (): Record<string, string> => {
    const fallback = Object.fromEntries(
      storableRows.map((r) => [r.label, r.default ?? ""]),
    );
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
    } catch {
      return fallback;
    }
  };

  const [defaults, setDefaults] = createSignal<Record<string, string>>(loadedDefaults());

  const submitDefaults = (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newDefaults = Object.fromEntries(
      storableRows.map((row) => [row.label, (formData.get(row.label) as string) ?? ""]),
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDefaults));
    setDefaults(newDefaults);
    dialogRef.close();
  };

  const makeExport = () => {
    if (!tbody()) return;
    const csv = [...tbody()!.childNodes].reduce((acc, row) => {
      const cells = [...row.childNodes].map(
        (cell) => cell.textContent?.trim() ?? "",
      );
      acc.push(cells.join(","));
      return acc;
    }, [] as string[]);
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ebird-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <><section class="ebird-export stack">
      <h2>eBird Export</h2>
      <div class="cluster">
        <button onClick={makeExport}>Export</button>
        <button type="button" commandfor={DIALOG_ID} command="show-modal">
          Edit defaults
        </button>
      </div>


      <table class="table table-striped">
        <tbody ref={setTbody}>
          <Index each={rows}>
            {(row) => (
              <tr>
                <th scope="row">{row().display ?? row().label}</th>
                <td> </td>
                <Index each={props.activeFiles}>
                  {() => <td contentEditable>{defaults()[row().label] ?? row().default}</td>}
                </Index>
              </tr>
            )}
          </Index>
          <For each={props.results}>
            {(result) => (
              <tr>
                <th scope="row">
                  {result.fullBird?.COMMONNAME ?? result.name}
                </th>
                <td> </td>
                <Index each={props.activeFiles}>
                  {(file) => {
                    const fc = () => result.fileCounts?.[file()];
                    const count = () => fc()?.count ?? 0;
                    const additional = () => fc()?.additional ?? 0;
                    if (count() === 0) return <td> </td>;
                    return (
                      <td contentEditable>
                        {count()}|NFC {count() + additional()}
                      </td>
                    );
                  } }
                </Index>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </section><dialog id={DIALOG_ID} ref={dialogRef}>
        <form onSubmit={submitDefaults} class="stack">
          <h3>Edit defaults</h3>
          <For each={storableRows}>
            {(row) => (
              <label>
                {row.label}
                <input name={row.label} value={defaults()[row.label] ?? ""} />
              </label>
            )}
          </For>
          <div class="cluster">
            <button type="submit" class="primary">
              Save
            </button>
            <button type="button" commandfor={DIALOG_ID} command="close">
              Cancel
            </button>
          </div>
        </form>
      </dialog></>
  );
}

export default EBirdExport;
