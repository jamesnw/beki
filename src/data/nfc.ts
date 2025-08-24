export interface NFCGroup {
  description: string;
  birds: string[];
  link?: string;
}
const groups: Map<string, NFCGroup> = new Map([
  [
    "CUPS",
    {
      description: "It looks like a cup.",
      link: "",
      birds: ["chispa", "amtspa"],
    },
  ],
  [
    "SWLI",
    {
      description: "From the bird names",
      link: "",
      birds: ["swaspa", "linspa"],
    },
  ],
  [
    "SFHS",
    {
      description: "",
      link: "",
      birds: ["foxspa", "sonspa", "harspa", "gocspa", "whtspa"],
    },
  ],
  [
    "HSSP",
    {
      description: "",
      link: "",
      birds: ["graspa", "vesspa", "whcspa", "seaspa"],
    },
  ],
  [
    "SBUF",
    {
      description: "Single-banded up or flat?",
      link: "",
      birds: [
        "yerwar",
        "palwar",
        "btbwar",
        "prowar",
        "swawar",
        "ovenbi1",
        "buwwar",
        "gowwar",
      ],
    },
  ],
  [
    "DESP",
    {
      description: "Descending Sparrows",
      link: "http://oldbird.org/pubs/fcmb/pages/deseeps.htm",
      birds: [
        "fiespa",
        "nstspa",
        "sstspa",
        "lecspa",
        "henspa",
        "bacspa",
        "savspa",
      ],
    },
  ],
  [
    "DEWA",
    {
      description: "Descending Warblers",
      link: "http://oldbird.org/pubs/fcmb/pages/deseeps.htm",
      birds: ["yetwar", "norpar", "pinwar"],
    },
  ],
  [
    "BUNT",
    {
      description: "Buntings (and a Grosbeak!?)",
      link: "",
      birds: ["indbun", "blugrb1", "paibun", "lazbun", "varbun"],
    },
  ],
  [ 
    {
      description: "TANAgers",
      link: "",
      birds: ["scatan", "sumtan", "westan"],
    },
  ],
  ["GROS", { description: "Grosbeaks", link: "", birds: ["robgro", "bkhgro"] }],
  [
    "THSH",
    {
      description: "THruSHes",
      link: "",
      birds: ["veery", "swathr", "woothr", "herthr"],
    },
  ],
  [
    "GCBI",
    {
      description: "From the bird names",
      link: "",
      birds: ["gycthr", "bicthr"],
    },
  ],
  [
    "ZEEP",
    {
      description: "Onomatopoeia",
      link: "http://oldbird.org/pubs/fcmb/pages/zeep.htm",
      birds: [
        "norwat",
        "louwat",
        "kenwar",
        "magwar",
        "babwar",
        "bkbwar",
        "bkpwar",
        "conwar",
        "yelwar",
        "cerwar",
        "woewar1",
        "camwar",
        "refwar",
      ],
    },
  ],
  [
    "DBUP",
    {
      description: "Double-Banded UP-seep",
      link: "",
      birds: [
        "tenwar",
        "naswar",
        "orcwar",
        "btnwar",
        "gchwar",
        "herwar",
        "towwar",
        "lucwar",
        "virwar",
        "colwar",
        "grawar",
        "btywar",
      ],
    },
  ],
  [
    "BZWA",
    {
      description: "BuZzing WArblers.",
      link: "http://oldbird.org/pubs/fcmb/pages/buzz.htm",
      birds: ["chswar", "kirwar", "hoowar", "comyel"],
    },
  ],
  [
    "BLUEB",
    {
      description: "These burbs are bluebs.",
      link: "",
      birds: ["easblu", "wesblu", "moublu"],
    },
  ],
  [
    "CCBRS",
    {
      description: "From the bird names",
      link: "",
      birds: ["clcspa", "brespa"],
    },
  ],
  [
    "MWAR",
    {
      description: "From the bird names",
      link: "",
      birds: ["macwar", "mouwar"],
    },
  ],
  [
    "WITH",
    {
      description: "",
      link: "",
      birds: [
        "dusthr2",
        "dusthr1",
        // Not sure what these birds are?
        //   "retthr1",
        //   "datthr1"
      ],
    },
  ],
]);
export default groups;

const ebirdToNFCMap = new Map<string, string>();
[...groups.entries()].forEach(([nfcGroup, { birds }]) => {
  birds.forEach((code) => {
    ebirdToNFCMap.set(code, nfcGroup);
  });
});

export { ebirdToNFCMap };
