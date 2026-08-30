# Set Receipt — independent verification 5 handoff

## Status: FAIL

Candidate `910ff69e62ee5379ee3d9720d82f864068ba607a` was independently checked
on 2026-08-30 at <https://lift-receipt-log.sociobot.in>. Do **not** release it
until the two defects in `.factory/verification-5.md` are fixed and retested.

1. **P1:** The visible $9 **Buy Pro** link reaches the documented Sociobot
   endpoint but production returns HTTP 404 (`enabled factory product`), so a
   customer cannot buy Pro.
2. **P2:** Unknown routes return the logger with HTTP 200; the required real
   404 page/status is missing.

## What passed

- All 11 claims commands from `.factory/claims.json`, unit/browser test suite,
  and exact production build passed from the clean candidate checkout.
- The free job-to-be-done works on live: keyboard set grammar, aliases, rest,
  finished receipts, export/import, demo isolation, offline reload, mobile,
  accessibility, and privacy request capture.
- Live production files match the built candidate; Lighthouse scored 99/100/100/100
  (performance/accessibility/best-practices/SEO). See the full exact evidence
  and commands in `.factory/verification-5.md`.

## Useful commands

```sh
npm ci
npm test
npm run build
```

Run the demo at <https://lift-receipt-log.sociobot.in/demo>. It is isolated in
the `set-receipt-demo` IndexedDB database and can be reset from its banner.
