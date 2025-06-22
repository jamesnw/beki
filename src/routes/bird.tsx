import { useParams } from "@solidjs/router";
import { birdMap } from "../codes";
export default function Bird() {
  const params = useParams<{ spec: string }>();
  const bird = birdMap.get(params.spec);
  if (!bird) {
    return <div>Bird not found</div>;
  }
  return (
    <div>
      <h1 class="text-center">{bird.COMMONNAME}</h1>
      <dl>
        <dt>Species Code:</dt>
        <dd>{bird.SPEC}</dd>
        <dt>Species 6 Code:</dt>
        <dd>{bird.SPEC6}</dd>
        <dt>Common Name:</dt>
        <dd>{bird.COMMONNAME}</dd>
      </dl>
      {bird.EBIRD && (
        <a href={`https://ebird.org/species/${bird.EBIRD}`} target="_blank">
          eBird Link
        </a>
      )}
    </div>
  );
}
