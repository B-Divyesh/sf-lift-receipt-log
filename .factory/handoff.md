# Set Receipt — polish round 2 handoff

## Status

Complete. Every finding in `review-1.md` and `review-2.md` is resolved. The
released PWA remains a local-first, static Vite + TypeScript application with
the original neo-brutalist training-docket visual system.

Production: <https://lift-receipt-log.sociobot.in>

One-click demo: <https://lift-receipt-log.sociobot.in/?demo=1>

## What changed

- Replaced the regressed immutable-receipt claim and every vague or conflicting
  label identified in review 2 with literal workout, receipt, privacy, and Pro
  terminology.
- Standardized the data boundary as “this browser” in the app, legal copy,
  README, 404, and catalog description.
- Made `/?demo=1` the visible one-click demo path while retaining the isolated
  `set-receipt-demo` database, persistent banner, Reset demo, destructive exit,
  immediate sample receipt, and offline operation.
- Removed the untested installation promise and added the listed
  `no-training-advice` claim with a real route-level test.
- Expanded static regressions for metadata, routes, forbidden old wording, and
  exact one-test-per-claim registration.
- Expanded browser checks across root, demo, Receipts, Setup, demo Setup,
  Privacy, Terms, and 404 in light and dark modes. This exposed and fixed Pro
  panel and custom-rest button contrast in dark mode.
- Added `npm run verify:live` for repeatable cold production checks covering
  first-screen geometry, demo isolation, focus, routing, metadata, privacy,
  offline use, console errors, and serious/critical Axe findings.
- Updated `.factory/copy-audit.md`, `.factory/demo.md`,
  `.factory/catalog-description.txt`, and the exhaustive finding map in
  `.factory/polish-2.md`.

## Verification evidence

- Clean clone of implementation commit `99f66ff235039e69e07972e2e3005afdd9d780d7`:
  each of the 14 exact commands in `.factory/claims.json` passed separately in
  desktop Chromium and the 390 × 844 mobile project (28 executions).
- Clean-clone `npm test`: 7 unit tests passed; static route/copy/claim checks
  passed; 51 Playwright tests passed with 3 expected project-specific skips.
- Final local `npm test`: the expanded accessibility matrix passed after the
  contrast repair.
- Final `npm run build`: `dist/` produced; initial JS 33.84 kB raw / 11.72 kB
  gzip and CSS 18.71 kB raw / 4.86 kB gzip.
- Local URL verifier: HTTP 200, no console errors, `lang=en`, one H1, one main,
  no missing image alt, and no unlabeled buttons.
- Mobile Lighthouse on `http://127.0.0.1:4173/?demo=1`: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 0 ms.
- Production deployment used `/opt/fleet/lib/deploy-static.sh lift-receipt-log
  dist`; initial Azure deployment ID was
  `0fd92e88-5243-45c4-b47c-fad824c14c0d`.
- Live `/opt/fleet/lib/verify-url.sh` passed both `/` and `/?demo=1` with HTTP
  200 and no console errors. `npm run verify:live` passed six routes, demo
  isolation, offline reload/logging, zero external demo requests, and zero
  serious/critical Axe violations after the final redeploy.

Screenshots are generated at:

- `test-results/evidence/mobile-first-screen.png`
- `test-results/evidence/mobile-demo-first-screen.png`
- `test-results/evidence/live/cold-mobile-root.png`
- `test-results/evidence/live/cold-mobile-demo.png`
- `test-results/evidence/live/cold-mobile-offline.png`
- `test-results/evidence/live-root/screenshot-desktop.png`
- `test-results/evidence/live-root/screenshot-mobile.png`
- `test-results/evidence/live-demo/screenshot-desktop.png`
- `test-results/evidence/live-demo/screenshot-mobile.png`

## Run and verify

```sh
npm ci
npm test
npm run build
npm run verify:live -- https://lift-receipt-log.sociobot.in test-results/evidence/live
```

To repeat every claim separately, run each `test` command in
`.factory/claims.json` from a fresh clone.

## Known gaps and next steps

None. No review finding, serious/critical Axe issue, claim failure, console
error, cross-origin demo request, offline failure, or deployment issue remains.
