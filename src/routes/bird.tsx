import { useParams } from "@solidjs/router";
import { specToBirdMap } from "../codes";
export default function Bird() {
  const params = useParams<{ spec: string }>();
  const bird = specToBirdMap.get(params.spec);
  if (!bird) {
    return <div>Bird not found</div>;
  }
  return (
    <div class="container-m">
      <h1 class="text-center">
        {bird.COMMONNAME}
        <br />
        <small>
          <em>{bird.SCINAME}</em>
        </small>
      </h1>
      <hr />
      {bird.SPEC === "BEKI" && (
        <img
          src="/logo.svg"
          alt="BEKI Birdcode Logo"
          width="320"
          height="320"
        />
      )}
      <dl>
        <dt>Species Code</dt>
        <dd>{bird.SPEC}</dd>
        <dt>Species 6 Code</dt>
        <dd>{bird.SPEC6}</dd>
        {bird.NFC && (
          <>
            <dt>NFC Group</dt>
            <dd>
              <a href={`/nfc#${bird.NFC}`}>{bird.NFC}</a>
            </dd>
          </>
        )}
        {bird.EBIRD && (
          <>
            <dt>eBird ID</dt>
            <dd>
              <a
                href={`https://ebird.org/species/${bird.EBIRD}`}
                target="_blank"
              >
                {bird.EBIRD}
              </a>
            </dd>
          </>
        )}
        {bird.SCI4 && (
          <>
            <dt>Scientific 4-letter code</dt>
            <dd>
             
                {bird.SCI4}

            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
