import "invokers-polyfill";
import { createSignal, For, Index, Show } from "solid-js";
import type { DisplayResult } from "../lib/aggregateResults";

const STORAGE_KEY = "ebird-defaults";

const rows: {
  label: string;
  display?: string;
  default?: string;
  store?: false;
}[] = [
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
  const [aggregated, setAggregated] = createSignal(false);

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

  const [defaults, setDefaults] =
    createSignal<Record<string, string>>(loadedDefaults());

  const submitDefaults = (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newDefaults = Object.fromEntries(
      storableRows.map((row) => [
        row.label,
        (formData.get(row.label) as string) ?? "",
      ]),
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
    <div class="stack">
      <section class="ebird-export stack">
        <h2>eBird Export</h2>
        <div class="cluster">
          <button onClick={makeExport}>Export</button>
          <button type="button" commandfor={DIALOG_ID} command="show-modal">
            Edit defaults
          </button>
          <label>
            <input
              type="checkbox"
              checked={aggregated()}
              onChange={(e) => setAggregated(e.currentTarget.checked)}
            />{" "}
            Aggregate to single checklist
          </label>
        </div>

        <table class="table table-striped">
          <tbody ref={setTbody}>
            <Index each={rows}>
              {(row) => (
                <tr>
                  <th scope="row">{row().display ?? row().label}</th>
                  <td> </td>
                  <Show
                    when={aggregated()}
                    fallback={
                      <Index each={props.activeFiles}>
                        {() => (
                          <td contentEditable>
                            {defaults()[row().label] ?? row().default}
                          </td>
                        )}
                      </Index>
                    }
                  >
                    <td contentEditable>
                      {defaults()[row().label] ?? row().default}
                    </td>
                  </Show>
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
                  <Show
                    when={aggregated()}
                    fallback={
                      <Index each={props.activeFiles}>
                        {(file: () => string) => {
                          const fc = () => result.fileCounts?.[file()];
                          const count = () => fc()?.count ?? 0;
                          const additional = () => fc()?.additional ?? 0;
                          if (count() === 0) return <td> </td>;
                          return (
                            <td contentEditable>
                              {count()}|NFC {count() + additional()}
                            </td>
                          );
                        }}
                      </Index>
                    }
                  >
                    {result.count ? (
                      <td contentEditable>
                        {result.count}|NFC {result.totalCount}
                      </td>
                    ) : (
                      <td> </td>
                    )}
                  </Show>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </section>
      <section class="callout">
        <h2>Instructions</h2>
        <ul>
          <li>Date format: month/day/year (e.g., 3/28/2026).</li>
          <li>
            Start time: either military time (e.g., 08:00 or 14:50) or
            in twelve-hour format (e.g., "8:00 AM" or "2:50 PM").
          </li>
          <li>Duration: minutes, not hours</li>
        </ul>
        <h3>Resources</h3>
        <ul>
          <li>
            <a
              href="https://support.ebird.org/en/support/solutions/articles/48000907878-upload-spreadsheet-data-to-ebird"
              target="_blank"
              rel="noopener noreferrer"
            >
              Uploading Spreadsheet Data to eBird (Official eBird guide)
            </a>
          </li>
          <li>
            <a
              href="https://ebird.org/import/upload.form?theme=ebird"
              target="_blank"
              rel="noopener noreferrer"
            >
              eBird Upload Form - Use Format "eBird Checklist Format (Grid)"
            </a>
          </li>
        </ul>
      </section>
      <dialog id={DIALOG_ID} ref={dialogRef}>
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
      </dialog>
    </div>
  );
}

export default EBirdExport;
