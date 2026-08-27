# Set Receipt — build handoff

## Shipped

- Fast keyboard-first set grammar (`225x5`, decimals, explicit lb/kg), editable
  aliases, validation, and 48–56 px gym-friendly controls.
- IndexedDB persistence for the open workout, settings, aliases, completed
  read-only receipts, PR flags, volume, and duration.
- Auto-starting rest timer, removable active sets with undo, and a compact
  finish-workout flow.
- Receipt history, Web Share/clipboard text, print/PDF styling, free JSON/CSV
  export, validated JSON restore, and confirmed full local erase.
- Installable offline PWA with generated, content-versioned precache names,
  cache-first assets, navigation fallback, update notice, 192/512 maskable icon,
  and offline status.
- Responsive 390 px and desktop layouts, light/dark system treatments,
  reduced-motion fallback, skip link, focus states, semantic landmarks, and
  live validation/status feedback.
- `/privacy` and `/terms`, no analytics/CDNs/accounts, MIT license, README, and
  generated-image provenance in `.factory/design.md`.
- $9 one-time Set Receipt Pro path using only the Sociobot checkout and verify
  endpoints. License return capture, URL cleanup, local cached verdict,
  once-per-day background verification, offline optimistic unlock, restore
  field, and invalid-license reconciliation are implemented. Core logging,
  aliases, receipts, accessibility, and exports remain free.

## Run and verify

```sh
npm ci
npm test
npm run build
```

`npm run build` is the exact deploy command. It produces `dist/index.html` and
the rest of the static PWA in `dist/`.

Verification on 2026-08-27:

- `npm test`: 7 unit tests passed; 9 browser tests passed across desktop and
  390 px mobile; one intentionally inapplicable desktop duplicate skipped.
- The browser suite explicitly reloaded the installed app with the network
  disabled, then successfully logged `315x3` offline.
- Axe: no serious or critical violations on logger, privacy, or terms in both
  desktop and mobile projects; automated color contrast checks included.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 .factory/evidence`: HTTP
  200, no page/console errors, one h1, title/lang/main present, zero missing alt
  text, zero unlabeled buttons.
- Lighthouse 12.5.1 mobile: Performance **100**, Accessibility **100**, Best
  Practices **100**, SEO **100**; LCP **1.5 s**, CLS **0**, TBT **0 ms**. INP is
  not available in a single-navigation lab run; TBT is the lab responsiveness
  proxy.
- Production output: 26.85 KB JavaScript and 16.57 KB CSS uncompressed
  (9.93 KB and 4.42 KB gzip); hero WebP is 40 KB. All are below budget.
- `npm audit --omit=dev`: 0 vulnerabilities.

## Known gaps / factory next steps

- Register the paid product/price and confirm the hosted production checkout
  return URL. The app deliberately hardcodes no billing product ID; it uses the
  required product slug URL.
- Configure the static host to serve `index.html` for `/privacy` and `/terms`.
- Local browser storage can be cleared by the browser or OS; users are told to
  export backups. Cloud sync is intentionally out of v1 scope.
- Web Share availability varies by browser; unsupported browsers copy receipt
  text to the clipboard, and print/PDF remains available.
