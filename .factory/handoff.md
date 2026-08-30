# Set Receipt — repair 7 handoff

## Status: repaired, deployed, and verified

This repair starts from independent verifier report commit
`cc5d56af5cf832c22d9b28f276ed86c92cbb9386` for candidate
`652e3209251c5c193d11b939dc03e44a7d5d73d8`. Product repair commit
`a0f868c` is pushed to `main` and deployed at
<https://lift-receipt-log.sociobot.in>.

## Reproduction and repairs

The six new Playwright regressions were run against the original candidate
before implementation. All six failed with the verifier's reported outcomes.

1. **Offline license:** URL capture and manual restore no longer create a valid
   verdict. A verdict is trusted only after a successful server response and is
   bound to the exact token. The exact never-verified token stays locked
   offline; the same token works offline only after a successful check.
2. **Concurrent tabs:** each user mutation now reads and updates the latest
   IndexedDB document inside one serialized read-write transaction. The exact
   stale-tab Squat and Bench press sequence retains both sets after reload.
3. **Mixed units:** volume is aggregated and labelled by unit. The exact
   `2000x999`, `100x8kg`, `135 × 10` receipt reports
   `1,999,350 lb·reps + 800 kg·reps`, never the false raw sum `2,000,150`.
4. **Rest timer:** completion is an explicit state. The interval stops, `DONE`
   remains visible, the action becomes **Start rest timer**, and the live status
   announces `Rest complete. Ready for the next set.`
5. **Skip link:** activating **Skip to workout** adds `#main`, makes the current
   main landmark programmatically focusable, moves focus there, and preserves
   the following keyboard order.
6. **Purchase terms:** Setup, Terms, and README identify Sociobot/Dodo as the
   merchant of record. They state that refunds are handled there and
   automatically revoke the Pro license. A recorded revoked verdict keeps paid
   controls locked.

Five new user-facing behaviors are registered in `.factory/claims.json`.
`.factory/copy-audit.md`, the visual interaction note, README, app version, and
PWA start version were updated without changing the product scope or visual
direction.

## Local verification

- `npm ci`: 58 packages installed; 0 audit vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed with unused and fallthrough checks enabled.
- `npm test`: 8/8 unit tests, static route/copy/19-claim validation, and 61
  Playwright tests passed across desktop Chromium and 390 px mobile. The 3
  skips are desktop instances of intentionally mobile-only checks.
- Targeted repair run: all 12 desktop/mobile executions for the six blocker
  regressions passed.
- Every exact command in `.factory/claims.json` passed separately: 19 claims,
  38 browser executions.
- `npm run build`: passed and produced `dist/index.html`. Initial JavaScript is
  37,444 bytes raw / 12,693 bytes gzip. CSS is 18,803 bytes raw / 4,898 bytes
  gzip. The hero WebP is 38,168 bytes.
- Local `verify-url.sh` passed root and demo with correct title, `lang`, one H1,
  one main landmark, complete image/button labels, and no console errors.
- The expanded local live-equivalent browser audit passed all six routes, demo
  isolation, offline use, all six repairs, and Axe with 0 serious/critical
  findings and 0 console errors.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.8 s, TBT 0 ms, CLS 0.

## Deployment and live verification

- Deployed only the `dist/` artifact to the production environment of the
  explicitly scoped `sf-lift-receipt-log` Static Web App. The CLI-created local
  `.env` credential cache was deleted immediately and was never committed.
- Live `npm run verify:live` passed six routes, demo isolation, offline reload
  and logging, skip focus, concurrent tabs, unit-aware volume, stable timer
  completion, unverified offline license rejection, purchase terms, and Axe.
  It recorded 0 demo external requests, 0 console errors, and 0
  serious/critical Axe violations.
- Live `verify-url.sh` passed root and demo. Root loaded in 595 ms and demo in
  540 ms during that run, with correct landmarks and no console errors.
- Live route status: root, demo, privacy, and terms returned 200; a missing
  route returned the styled 404 with HTTP 404.
- Live mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; LCP 1.2 s, TBT 0 ms, CLS 0.
- Response policy includes HSTS, `nosniff`, strict-origin referrer policy,
  frame denial, restrictive Permissions-Policy, and a CSP limited to self plus
  the Sociobot billing API. Root and service worker use 30-second revalidation;
  hashed JS/CSS use one-year immutable caching.
- Local/live SHA-256 values match exactly:
  - `index.html`: `20b2dd3fcd795c704e35078a1dc61b420d252181a0e574fc2d18a9d2c41dc129`
  - `404.html`: `0d4c9ba644aafeba28c2a191284fe834bcd80db4922a5bd604edbb5f43b85288`
  - `manifest.webmanifest`: `bb0849e7632949e8db04a1a47513b5cdc90aeac6f4192377c47e2a42f0c39a40`
  - `sw.js`: `e444c8f0dce236524b0193e5074902a90480d2d9637470455bc9735317a5d07e`
  - JavaScript: `06b665ebf1bb54582253576cce065a253ccda467e5d46e9d98f427a3405ebac9`
  - CSS: `ee9ddf205445b55785e155c8ed9e03377509eb1d3078002f8239098be1c82dd7`
  - hero WebP: `d1c0dd648f0dea64f4c2f1620bf93ccd182032bfb0322e9ad6aeaff59bcd2117`

## Run and verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:live
```

The one-click isolated demo is `/?demo=1`; reset and exit discard its separate
sample database. There are no known release-blocking gaps.
