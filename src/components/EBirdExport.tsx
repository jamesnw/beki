import { createSignal, For, Index } from "solid-js";
import type { DisplayResult } from "../lib/aggregateResults";

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
function EBirdExport(props: { results: DisplayResult[]; activeFiles: string[] }) {
  const [tbody, setTbody] = createSignal<HTMLTableSectionElement | null>(null);

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
    if (!tbody()) return;
    const values = [...tbody()!.childNodes]
      .slice(0, rows.length)
      .map((row) => [...row.childNodes][2]?.textContent?.trim() ?? "");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    setDefaults(values);
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
  const getWeather = (col = 2) => {
    if (!tbody()) return;
    const lat = [...tbody()!.childNodes][1].childNodes[col]?.textContent?.trim();
    const lon = [...tbody()!.childNodes][2].childNodes[col]?.textContent?.trim();
    const date = [...tbody()!.childNodes][3].childNodes[col]?.textContent?.trim();
    const starttime = [...tbody()!.childNodes][4].childNodes[col]?.textContent?.trim();
    const duration = [...tbody()!.childNodes][5].childNodes[col]?.textContent?.trim();
    if (!lat || !lon || !date) {
      alert("Please fill in Latitude, Longitude, and Date to get weather");
      return;
    }
    const url = 'https://raincrow.app/?/preGetWeather='
    const body = JSON.stringify({
      latlon:	`${lat},${lon}`,
      date:	`${date}`,
      startTime:starttime,
      duration:	`${duration}`
    })
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Weather data:", data);
        alert(`Weather data: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        console.error("Error fetching weather:", err);
        alert("Error fetching weather");
      });
  }
  
  return (
    <section class="ebird-export">
      <h2>eBird Export</h2>

      <button onClick={makeExport}>Export</button>
      <button onClick={storeDefaults}>Store defaults</button>
      <button onClick={()=>getWeather()}>Get Weather</button>

      <table contentEditable class="table table-striped">
        <tbody ref={setTbody}>
          <Index each={rows}>
            {(row, i) => (
              <tr>
                <th scope="row">{row().display ?? row().label}</th>
                <td> </td>
                <Index each={props.activeFiles}>
                  {() => <td>{defaults()[i]}</td>}
                </Index>
              </tr>
            )}
          </Index>
          <For each={props.results}>
            {(result) => (
              <tr>
                <th scope="row">{result.fullBird?.COMMONNAME ?? result.name}</th>
                <td> </td>
                <Index each={props.activeFiles}>
                  {(file) => {
                    const fc = () => result.fileCounts?.[file()];
                    const count = () => fc()?.count ?? 0;
                    const additional = () => fc()?.additional ?? 0;
                    if (count() === 0) return <td> </td>;
                    return (
                      <td>
                        {count()}|NFC {count() + additional()}
                      </td>
                    );
                  }}
                </Index>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </section>
  );
}

export default EBirdExport;
