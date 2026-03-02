import { createSignal } from "solid-js";
import type { DisplayResult } from "../routes/merge";

const STORAGE_KEY = "ebird-defaults";

const rows: { label: string; display?: string; default?: string }[] = [
  {
    label: "Location",
    display: "",
  },
  {
    label: "Latitude",
  },
  { label: "Longitude" },
  { label: "Date" },
  {
    label: "Start Time",
  },
  {
    label: "State",
  },
  {
    label: "Country",
  },
  {
    label: "Protocol",
    default: "Nocturnal Flight Call Count",
  },
  {
    label: "Num Observers",
    default: "1",
  },
  {
    label: "Duration (min)",
    default: "60",
  },
  {
    label: "All Obs Reported (Y/N)",
    default: "N",
  },
  {
    label: "Dist Traveled (Miles)",
    default: "0",
  },
  {
    label: "Area Covered (Acres)",
  },
  {
    label: "Notes",
  },
];
function EBirdExport(props: { results: DisplayResult[] }) {
  console.log("EBirdExport results:", props.results);
  let tbody: HTMLTableSectionElement | null = null;

  const loadedDefaults = (): (string | undefined)[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : rows.map((r) => r.default);
    } catch {
      return rows.map((r) => r.default);
    }
  };

  const [defaults, setDefaults] = createSignal<(string | undefined)[]>(
    loadedDefaults(),
  );

  const storeDefaults = () => {
    if (!tbody) return;
    const values = [...tbody.childNodes]
      .slice(0, rows.length)
      .map((row) => [...row.childNodes][2]?.textContent?.trim() ?? "");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    setDefaults(values);
  };

  const makeExport = () => {
    if (!tbody) return;
    const csv = [...tbody.childNodes].reduce((acc, row) => {
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
    <section class="ebird-export">
      <h2>eBird Export</h2>

      <button onClick={makeExport}>Export</button>
      <button onClick={storeDefaults}>Store defaults</button>
      <table contentEditable class="table table-striped">
        <tbody ref={tbody}>
          {rows.map((row, i) => (
            <tr>
              <th scope="row">{row.display ?? row.label}</th>
              <td> </td>
              <td>{defaults()[i]}</td>
            </tr>
          ))}
          {props.results.map((result) => (
            <tr>
              <th scope="row">{result.fullBird?.COMMONNAME ?? result.name}</th>
              <td> </td>
              <td>
                {result.count ?? 0}|NFC{" "}
                {(result.count ?? 0) + (result.additional ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default EBirdExport;
