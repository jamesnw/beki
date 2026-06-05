import { For, createEffect } from "solid-js";
import { nfcWithBirds, type BirdCode } from "../codes";
import nfcGroups from "../data/nfc";
import BirdItemPopper from "../components/BirdItemPopper";

declare module "solid-js" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "kelp-heading-anchors": any;
    }
  }
}

function NfcGroups() {
  return (
    <div
      class="toc-watch"
      style={{
        "--scopes": Object.keys(nfcWithBirds)
          .map((k) => `--${k}`)
          .join(","),
      }}
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
          <For
            each={Object.entries(nfcWithBirds).sort(([a], [b]) =>
              a.localeCompare(b),
            )}
          >
            {([nfcGroup, birds]) => (
              <section style={{ "--is": `--${nfcGroup}` }}>
                <h2 id={nfcGroup}>{nfcGroup}</h2>
                <p>
                  {nfcGroups.get(nfcGroup)?.description}{" "}
                  {nfcGroups.get(nfcGroup)?.link && (
                    <a
                      href={nfcGroups.get(nfcGroup)?.link}
                      target="_blank"
                      rel="noopener"
                    >
                      (OldBird reference)
                    </a>
                  )}
                </p>
                <ul>
                  <For each={birds}>
                    {(bird) => <NFCBirdListItem {...bird} />}
                  </For>
                </ul>
              </section>
            )}
          </For>
        </kelp-heading-anchors>
        <div>
          <nav id="toc" class="callout vivid primary">
            <h2>Groups</h2>
            <ul class="list-unstyled">
              <For
                each={Object.keys(nfcWithBirds).sort((a, b) =>
                  a.localeCompare(b),
                )}
              >
                {(nfcGroup) => (
                  <li style={{ "--for": `--${nfcGroup}` }}>
                    <a class="toc-link" href={`#${nfcGroup}`}>
                      {nfcGroup}
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default NfcGroups;

function NFCBirdListItem(bird: BirdCode) {
  return (
    <BirdItemPopper
      bird={bird}
      linkText={bird.COMMONNAME}
      postText={bird.SPEC}
    />
  );
}
