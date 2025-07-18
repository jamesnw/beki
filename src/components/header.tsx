function Header() {
  return (
    <nav class="nav-wrap split align-center margin-start-s margin-end-m">
      <strong>
        <a
          class="logo link-subtle size-2xl font-secondary flex"
          style="--color: var(--color-text-normal); --color-hover: var(--focus-ring-color);"
          href="/"
        >
          <img
            src="/logo.svg"
            alt="BEKI Birdcode Logo"
            width="64"
            height="64"
          />
          <div class="split gap-4xs align-center">
            BEKI <small>(Birdcode Easy Knowing Index)</small>
          </div>
        </a>
      </strong>
      <div class="nav-menu" id="nav-menu">
        <ul class="nav list-inline">
          <li>
            <a class="link-subtle" href="/">
              Codes
            </a>
          </li>
          <li>
            <a class="link-subtle" href="/nfc">
              NFC Groups
            </a>
          </li>
          <li>
            <a class="link-subtle" href="/about">
              About
            </a>
          </li>
          <li>
            <a
              class="link-subtle"
              href="https://github.com/jamesnw/beki"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style="margin-bottom:-0.125em;"
                width="1em"
                height="1em"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
export default Header;
