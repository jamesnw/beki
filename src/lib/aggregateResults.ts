import groups from "../data/nfc";
import { ebirdToBirdMap, type BirdCode } from "../codes";
import type { NFCGroup } from "../data/nfc";
import type { Result } from "./processFile";

interface ShortBirdCode {
  SPEC: string;
  COMMONNAME: string;
  SORT_INDEX: number;
}

export const shortBirdCodes: ShortBirdCode[] = [
  { SPEC: "sp", COMMONNAME: "new world sparrow sp.", SORT_INDEX: 2035.5 },
  { SPEC: "w", COMMONNAME: "new world warbler sp.", SORT_INDEX: 2215.5 },
  { SPEC: "th", COMMONNAME: "thrush sp.", SORT_INDEX: 1770 },
  { SPEC: "p", COMMONNAME: "passerine sp.", SORT_INDEX: 99999 },
];

export interface DisplayResult {
  name: string;
  count?: number;
  totalCount?: number;
  additional?: number;
  audio?: boolean;
  times?: { start: string; end: string; file: string }[];
  fullBird?: BirdCode | ShortBirdCode;
  nfcGroup?: NFCGroup;
  fileCounts?: Record<string, { count: number; additional: number }>;
}

export function aggregateResults(
  results: Result[],
  files: string[],
  combine: boolean,
): DisplayResult[] {
  const grouped = combine
    ? Object.groupBy(results, (l) => groups.get(l.name)?.parent || l.name)
    : Object.groupBy(results, (l) => l.name);

  return Object.entries(grouped)
    .map(([name, items]) => ({
      name,
      totalCount: items?.reduce(
        (acc, item) => acc + (item.count ?? 0) + (item.additional ?? 0),
        0,
      ),
      additional: items?.reduce((acc, item) => acc + (item.additional ?? 0), 0),
      count: items?.reduce((acc, item) => acc + (item.count ?? 0), 0),
      audio: items?.some((item) => item.audio),
      times: items?.map((item) => ({
        start: item.start,
        end: item.end,
        file: item.fileName ?? "",
      })),
      fullBird:
        ebirdToBirdMap.get(name) || shortBirdCodes.find((sb) => sb.SPEC === name),
      nfcGroup: groups.get(name),
      fileCounts: Object.fromEntries(
        files.map((f) => [
          f,
          {
            count:
              items
                ?.filter((i) => i.fileName === f)
                .reduce((acc, i) => acc + i.count, 0) ?? 0,
            additional:
              items
                ?.filter((i) => i.fileName === f)
                .reduce((acc, i) => acc + i.additional, 0) ?? 0,
          },
        ]),
      ),
    }))
    .sort((a, b) => (b?.count ?? 1) - (a?.count ?? 1));
}

export function orderSorted(results: DisplayResult[]): DisplayResult[] {
  return [...results].sort(
    (a, b) =>
      (a.fullBird?.SORT_INDEX ?? 99999) - (b.fullBird?.SORT_INDEX ?? 99999),
  );
}

/** Format bird rows as a single aggregated CSV column. */
export function formatBirdCsvRowsAggregated(results: DisplayResult[]): string[] {
  return results.map((result) => {
    const name = result.fullBird?.COMMONNAME ?? result.name;
    const count = result.count ?? 0;
    const totalCount = result.totalCount ?? 0;
    const dataCell = count > 0 ? `${count}|NFC ${totalCount}` : " ";
    return [name, " ", dataCell].join(",");
  });
}

/** Format bird rows as CSV lines (one column per file after the two header columns). */
export function formatBirdCsvRows(
  results: DisplayResult[],
  files: string[],
): string[] {
  return results.map((result) => {
    const name = result.fullBird?.COMMONNAME ?? result.name;
    const dataCells = files.map((f) => {
      const fc = result.fileCounts?.[f];
      const count = fc?.count ?? 0;
      const additional = fc?.additional ?? 0;
      if (count === 0) return " ";
      return `${count}|NFC ${count + additional}`;
    });
    return [name, " ", ...dataCells].join(",");
  });
}
