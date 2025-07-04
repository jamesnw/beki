function About() {
  return (
    <div class="stack gap-4">
      <h1 class="text-center">About BEKI</h1>
      <p>
        The Birdcode Easy Knowning Index, or <a href="/bird/BEKI">BEKI</a> is an
        attempt to bring some order to the chaos that is all the different ways
        that a bird's name can be shortened.
      </p>
      <h2>Data sources</h2>
      <ul>
        <li>
          The 4-letter, 6-letter, scientific name and common name is from{" "}
          <a
            href="https://www.birdpop.org/pages/birdSpeciesCodes.php"
            target="_blank"
          >
            The Institute of Bird Populations
          </a>
          .
        </li>
        <li>
          The scientific name to eBird code mapping is from{" "}
          <a href="https://github.com/fkdeboer/BirdNET-Pi/blob/main/scripts/ebird.php">
            BirdNet
          </a>
          .
        </li>
        <li>
          The NFC codes are from{" "}
          <a
            href="https://github.com/bmvandoren/Nighthawk/blob/main/nighthawk/taxonomy/groups_ebird_codes.csv"
            target="_blank"
          >
            Nighthawk
          </a>
          .
        </li>
      </ul>
      <p>Have ideas? Let me know on Github!</p>
    </div>
  );
}
export default About;
