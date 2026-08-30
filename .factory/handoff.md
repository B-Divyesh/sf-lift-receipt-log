# Set Receipt — polish round 1 handoff

## Status: complete

Repair commit: `f437c55b870dc31efa347698b353e895a9880e03`.

The repair resolves every `F-1-1` through `F-1-37` finding in
[`review-1.md`](review-1.md). The detailed finding-to-change-to-evidence map is
in [`polish-1.md`](polish-1.md). It preserves the training-docket visual system
while making the phone first screen action-led, moving sample data into the
demo’s first view, discarding demo state on exit, completing route behavior,
and removing unsupported promises.

## Verification

- Clean clone: cloned `f437c55` into `/tmp/lift-receipt-clean-7lewap`, ran
  `npm ci`, then ran every one of the 13 exact commands in
  `.factory/claims.json` separately. All passed in desktop Chromium and the
  390 × 844 mobile project; the clone’s final Playwright status is `passed`.
- Local quality gate: `npm test` passed: 7/7 Vitest tests, static 404/metadata
  verification, and 48 Playwright cases (including two expected mobile-only
  skips). The suite covers keyboard formats and repeated entry, demo isolation
  and reset, privacy requests, route focus, 404 metadata, Axe, service-worker
  update, and offline reload.
- Build: `npm run build` passed and produced `dist/`. Initial JS is 33.80 kB
  raw / 11.74 kB gzip; CSS is 18.67 kB raw / 4.85 kB gzip.
- Deployment: `/opt/fleet/lib/deploy-static.sh lift-receipt-log dist` completed
  successfully (deployment `d923d47a-774a-4cbd-88aa-50776113f9f1`).
- Cold live check: `https://lift-receipt-log.sociobot.in/` returned the new
  title and assets. A new 390 px browser context confirmed first-screen CTA,
  demo first-row visibility, demo exit/reseed, Privacy/Back H1 focus, styled
  HTTP 404 Open Graph metadata, and no root console errors. Screenshot:
  `.factory/evidence/live/live-mobile-demo.png` (ignored test evidence).
- Live PWA: fresh `/demo` service-worker control, offline reload, and logging
  `Deadlift 325lb × 3` passed.
- Accessibility: `verify-url.sh` passed for the live root (title/lang/one H1/
  main/alt/buttons/console). Live Playwright Axe found 0 serious or critical
  findings across `/`, `/demo`, `/privacy`, `/terms`, and a missing route at
  390 px. The standalone Axe CLI could not find a system Chrome binary, so the
  equivalent Playwright Axe integration was used.
- Lighthouse, live mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1,211 ms, CLS 0, transfer 58,635 B. Report:
  `.factory/evidence/live/lighthouse.json` (ignored test evidence).

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh lift-receipt-log dist
```

Open `/demo` or `?demo=1` for an isolated sample log. Use **Reset demo** to
restore sample data and **Start for real** to delete it before opening the real
logger.

## Known gaps

None. The checkout test verifies the live catalogue price and hosted redirect;
no production payment was submitted.
