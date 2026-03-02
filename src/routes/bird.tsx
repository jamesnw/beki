import { Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { specToBirdMap } from "../codes";
export default function Bird() {
  const params = useParams<{ spec: string }>();
  const bird = () => specToBirdMap.get(params.spec);
  return (
    <Show when={bird()} fallback={<div>Bird not found</div>}>
      {(b) => (
        <div class="container-m">
          <h1 class="text-center">
            {b().COMMONNAME}
            <br />
            <small>
              <em>{b().SCINAME}</em>
            </small>
          </h1>
          <hr />
          {b().SPEC === "BEKI" && (
            <img
              src="/logo.svg"
              alt="BEKI Birdcode Logo"
              width="320"
              height="320"
            />
          )}
          <dl>
            <dt>Species Code</dt>
            <dd>{b().SPEC}</dd>
            <dt>Species 6 Code</dt>
            <dd>{b().SPEC6}</dd>
            {b().NFC && (
              <>
                <dt>NFC Group</dt>
                <dd>
                  <a href={`/nfc#${b().NFC}`}>{b().NFC}</a>
                </dd>
              </>
            )}
            {b().EBIRD && (
              <>
                <dt>eBird ID</dt>
                <dd>
                  <a
                    href={`https://ebird.org/species/${b().EBIRD}`}
                    target="_blank"
                  >
                    {b().EBIRD}
                  </a>{" "}
                  <a
                    href={`https://media.ebird.org/catalog?birdOnly=true&taxonCode=${b().EBIRD}&mediaType=audio&tag=flight_call`}
                    target="_blank"
                    aria-label="Flight calls"
                    class="size-3xl"
                  >
                    ♪
                  </a>
                </dd>
              </>
            )}
            {b().SCI4 && (
              <>
                <dt>Scientific 4-letter code</dt>
                <dd>{b().SCI4}</dd>
              </>
            )}
            {b().OLDBIRD && (
              <>
                <dt>OldBird Reference</dt>
                <dd>
                  <a href={b().OLDBIRD} target="_blank">
                    {b().OLDBIRD}
                  </a>
                </dd>
              </>
            )}
          </dl>
        </div>
      )}
    </Show>
  );
}
