# Set Receipt

Set Receipt is a keyboard-first, local lift logger for regular lifters. Enter a
set as `225x5`, then keep the finished workout as a compact receipt.

Live: <https://lift-receipt-log.sociobot.in>

Demo: <https://lift-receipt-log.sociobot.in/demo>. It opens realistic sample
workouts in a separate browser-storage namespace and never changes your real log.

## What it does

- Logs `weight × reps` from the keyboard; `225x5`, `100x8kg`, and `135 × 10`
  all work.
- Expands editable exercise aliases such as `sq`, `bp`, `dl`, and `ohp`.
- Starts a large rest timer after each set.
- Keeps active workouts and completed read-only receipts in IndexedDB.
- Shares plain-text receipts and prints cleanly to paper or PDF.
- Exports every record as JSON or CSV and restores JSON backups.
- Installs as a PWA and reloads fully offline after the first visit.

The free logger, aliases, fixed rest presets, receipts, and all data portability
are complete and ungated. A $9 one-time Pro license adds custom rest intervals
and private receipt notes via the Sociobot hosted checkout. No payment provider
is embedded in this repository and no product ID is hardcoded.

## Develop

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

The production work-order command is exactly:

```sh
npm run build
```

It writes the deployable static application to `./dist`, with `index.html` at
the root and a generated precaching service worker.

## Test

Playwright 1.58.2 is pinned. In the factory worker, Chromium is already present
at `$PLAYWRIGHT_BROWSERS_PATH`; elsewhere install it once if necessary.

```sh
npx playwright install chromium
npm test
```

The suite covers parsing, receipt math, backup validation, keyboard entry,
IndexedDB persistence, aliases, exact recovery regressions, touch geometry,
demo isolation, privacy request capture, axe scans, and offline reloads.

Machine-readable product claims and their exact test commands are in
`.factory/claims.json`. Demo data and reset behavior are documented in
`.factory/demo.md`.

## Privacy and data

There is no account, analytics, advertising, third-party font, or runtime CDN.
Workout data stays in local IndexedDB. A license token is stored in localStorage
and sent only to `api.sociobot.in` for daily-at-most verification. See
[`/privacy`](https://lift-receipt-log.sociobot.in/privacy) and
[`/terms`](https://lift-receipt-log.sociobot.in/terms).

## Deploy

Deploy the contents of `dist/` as a static site. The host must fall back to
`index.html` for `/privacy` and `/terms`. The factory owns infrastructure, DNS,
billing registration, and the production checkout configuration.

Visual rationale and generated-asset provenance are in
[`.factory/design.md`](.factory/design.md). MIT licensed.
