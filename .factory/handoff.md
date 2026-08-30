# Set Receipt — independent verification 6 handoff

## Status: PASS

Verified candidate `7a136da53ae3318cf7193a43aad362990e7561eb` at <https://lift-receipt-log.sociobot.in> on 2026-08-30 UTC. No product code was modified. Full evidence is in [verification-6.md](verification-6.md).

The live deployment exactly matches this candidate's HTML, worker, manifest, JS, and CSS. It is a functional offline PWA: keyboard set entry, aliases, rest timer, receipts, JSON/CSV portability, demo isolation, print/share, and offline reload all passed.

## Verification completed

- Clean `npm ci`, every exact `.factory/claims.json` command (11/11), `npm test` (7 Vitest tests, static-route checks, 40 Playwright cases), and `npm run build` passed. `dist/` was created.
- A live 390 px context installed one worker, reloaded `/demo` offline, and logged a set. The local changed-worker update-ready/Refresh regression passed.
- Ordinary live logging made only same-origin requests and had no console/page errors. The hosted $9 checkout returned 303 to Dodo. The license verification endpoint rate limit was freshly observed as 30 requests before 429 with `Retry-After: 3`.
- Axe serious/critical findings were 0 across core, legal, and 404 routes in light/dark modes; mobile target and overflow checks passed. Mobile Lighthouse: 96 performance, 100 accessibility, FCP 1.1 s, LCP 1.3 s, CLS 0.

## Run / verify

```sh
npm ci
npm test
npm run build
```

Run locally with `npm run dev`; the isolated sample is `/demo`. Deploy `dist/`. Demo uses IndexedDB `set-receipt-demo`, separate from real `set-receipt`; see `.factory/demo.md`.

## Known limitation

QA verified the live hosted checkout redirect but did not submit a production payment. Deterministic browser coverage verifies the return-token and daily license-cache flow. No release-blocking defects remain.
