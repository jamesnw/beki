const groups = {
  CUPS: ["chispa", "amtspa"],
  SWLI: ["swaspa", "linspa"],
  SFHS: ["foxspa", "sonspa", "harspa", "gocspa", "whtspa"],
  HSSP: ["graspa", "vesspa", "whcspa", "seaspa"],
  SBUF: [
    "yerwar",
    "palwar",
    "btbwar",
    "prowar",
    "swawar",
    "ovenbi1",
    "buwwar",
    "gowwar",
  ],
  DESP: ["fiespa", "nstspa", "sstspa", "lecspa", "henspa", "bacspa", "savspa"],
  DEWA: ["yetwar", "norpar", "pinwar"],
  BUNT: ["indbun", "blugrb1", "paibun", "lazbun", "varbun"],
  TANA: ["scatan", "sumtan", "westan"],
  GROS: ["robgro", "bkhgro"],
  THSH: ["veery", "swathr", "woothr", "herthr"],
  GCBI: ["gycthr", "bicthr"],
  ZEEP: [
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
  DBUP: [
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
  BZWA: ["chswar", "kirwar", "hoowar", "comyel"],
  BLUEB: ["easblu", "wesblu", "moublu"],
  CCBRS: ["clcspa", "brespa"],
  MWAR: ["macwar", "mouwar"],
  WITH: [
    "dusthr2",
    "dusthr1",
    // Not sure what these birds are?
    //   "retthr1",
    //   "datthr1"
  ],
};

export default groups;

const ebirdToNFCMap = new Map<string, string>();
Object.entries(groups).forEach(([nfcGroup, ebirdCodes]) => {
  ebirdCodes.forEach((code) => {
    ebirdToNFCMap.set(code, nfcGroup);
  });
});

export { ebirdToNFCMap };
