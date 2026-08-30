# Set Receipt

Set Receipt logs lifts from the keyboard and stores them in this browser. It is
for lifters who record weight and reps during a workout. Enter `225x5`, then
finish the workout to keep a workout receipt.

Live: <https://lift-receipt-log.sociobot.in>

Demo: <https://lift-receipt-log.sociobot.in/?demo=1>. It opens a sample Bench
press workout in separate browser storage and does not change your workout log.

## What Set Receipt does

- Logs `weight × reps`; `225x5`, `100x8kg`, and `135 × 10` work.
- Reports separate lb-reps and kg-reps totals when a workout mixes units.
- Merges sets logged from two open tabs instead of replacing either set.
- Expands editable exercise aliases such as `sq`, `bp`, `dl`, and `ohp`.
- Starts a rest timer after each set, stops at `DONE`, and announces completion.
- Keeps active workouts and finished receipts in this browser’s storage.
- Shares plain-text receipts and prints cleanly to paper or PDF.
- Exports every record as JSON or CSV and restores JSON backups.
- Reloads and logs offline after the first visit.

The free logger includes aliases, fixed rest presets, receipts, export, and
import. A $9 one-time Pro license adds custom rest intervals and private receipt
notes through Sociobot checkout.

Sociobot/Dodo is the merchant of record. Refunds are handled there and
automatically revoke the Pro license.

## Develop

```sh
npm ci
npm run dev
```

Build the deployable site with:

```sh
npm run build
```

## Test

Playwright 1.58.2 is pinned. In the factory worker, Chromium is already
available. Elsewhere, install it once if necessary.

```sh
npx playwright install chromium
npm run typecheck
npm run lint
npm test
```

Tests cover logging, receipts, backups, aliases, demo isolation, privacy,
accessibility, and offline reloads. Machine-readable product claims and their
exact test commands are in `.factory/claims.json`. Demo data and reset behavior
are documented in `.factory/demo.md`.

## Privacy and data

Workout data stays in this browser during ordinary logging. The app loads no
analytics, ads, external fonts, or third-party scripts. The browser stores your
license token and checks it with `api.sociobot.in` no more than once a day. A
new token enables Pro only after that check succeeds. An already verified valid
token can keep Pro active offline.
Opening Setup checks Sociobot checkout availability without sending workout data. See
[`/privacy`](https://lift-receipt-log.sociobot.in/privacy) and
[`/terms`](https://lift-receipt-log.sociobot.in/terms).

## Deploy

Deploy `dist/` as a static site with `/privacy`, `/terms`, and `/?demo=1` routed
to the app and unknown routes served by `404.html`. Visual rationale and
generated-asset provenance are in [`.factory/design.md`](.factory/design.md).
MIT licensed.
