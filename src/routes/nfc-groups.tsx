import { nfcWithBirds } from "../codes";

function NfcGroups() {
  return (
    <div
      class="toc-watch"
      style={`--scopes: ${Object.keys(nfcWithBirds)
        .map((k) => `--${k}`)
        .join(",")}`}
    >
      <h1>NFC Groups</h1>
      <div class="callout secondary">
        These groups are used by{" "}
        <a href="https://github.com/bmvandoren/Nighthawk/" target="_blank">
          Nighthawk
        </a>{" "}
        to group Nocturnal Flight Calls (NFC) that are often hard or impossible
        to differentiate.
      </div>
      <div class="sidecar-end">
        <kelp-heading-anchors>
          {Object.entries(nfcWithBirds)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([nfcGroup, birds]) => (
              <section style={`--is:--${nfcGroup}`}>
                <h2 id={nfcGroup}>{nfcGroup}</h2>
                <ul>
                  {birds.map((bird) => (
                    <li>
                      <a href={`/bird/${bird.SPEC}`}>{bird.COMMONNAME}</a> (
                      {bird.SPEC})
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </kelp-heading-anchors>
        <div>
          <nav id="toc" class="callout vivid primary">
            <h2>Groups</h2>
            <ul class="list-unstyled">
              {Object.keys(nfcWithBirds)
                .sort((a, b) => a.localeCompare(b))
                .map((nfcGroup) => (
                  <li style={`--for:--${nfcGroup}`}>
                    <a class="toc-link" href={`#${nfcGroup}`}>
                      {nfcGroup}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default NfcGroups;
