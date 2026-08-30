# Set Receipt — independent verification 7 handoff

## Status: FAIL

Candidate `664641f6bef5592f1416a4dbe3ad9acd06d510fb` at
<https://lift-receipt-log.sociobot.in> is **not accepted**. The live deployment
matches the candidate and the product works end to end, but the required exact
`npm test` command fails consistently and the mobile 404 page has undersized
navigation targets. No product code was modified during verification.

Full evidence: [`.factory/verification-7.md`](verification-7.md).

## What passed

- All 14 commands in `.factory/claims.json` passed separately in desktop and
  390 px mobile Chromium (28 claim executions).
- The cold first screen states what the product does, who it serves, and offers
  a visible one-click sample demo with its result explained.
- Unit tests and static checks pass; `npm run build` passes TypeScript and emits
  `dist/`.
- Live normal, boundary, invalid/recovery, receipt persistence, demo isolation,
  request privacy, keyboard, focus, dark/light Axe, reduced motion, offline
  reload, service-worker update, headers, caching, and billing-rate-limit checks
  otherwise passed.
- The local and live HTML, manifest, service worker, JS, CSS, and hero hashes
  match.
- Mobile Lighthouse: 99 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.1 s, CLS 0, TBT 150 ms.

## Blocking defects

1. **High:** exact `npm test` ends with 49 passed, 3 skipped, 2 failed. Both
   desktop and mobile accessibility-matrix cases exceed the default 30-second
   timeout at `tests/e2e/app.spec.ts:464`. The isolated default-timeout rerun
   also fails. The unchanged test passes 2/2 with `--timeout=60000` in 46.5 s,
   and independent live Axe scans find no serious/critical violations.
2. **Medium:** at 390 px, the live 404 page's Log, Receipts, Setup, Privacy, and
   Terms links are only 17–19.5 px tall (and several are below 44 px wide).
   This violates the required 44 by 44 touch-target baseline. The current
   target-size regression omits the 404 route.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run verify:live -- https://lift-receipt-log.sociobot.in test-results/evidence/live
```

Then inspect `/definitely-missing` at 390 by 844 CSS pixels. Remediation must
make the exact `npm test` command pass and extend 44 by 44 target sizing/testing
to the 404 page before another release decision.
