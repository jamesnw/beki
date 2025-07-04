import { nfcWithBirds } from "../codes";

function NfcGroups() {
  return (
    <div>
      <h1>NFC Groups</h1>
      <div class="callout secondary">
        These groups are used by{" "}
        <a href="https://github.com/bmvandoren/Nighthawk/" target="_blank">
          Nighthawk
        </a>{" "}
        to group Nocturnal Flight Calls (NFC) that are often hard or impossible
        to differentiate.
      </div>
      {Object.entries(nfcWithBirds).map(([nfcGroup, birds]) => (
        <>
          <h2 id={nfcGroup}>{nfcGroup}</h2>
          <ul>
            {birds.map((bird) => (
              <li>
                <a href={`/bird/${bird.SPEC}`}>{bird.COMMONNAME}</a> (
                {bird.SPEC})
              </li>
            ))}
          </ul>
        </>
      ))}
    </div>
  );
}

export default NfcGroups;
