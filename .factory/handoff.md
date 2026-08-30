# Set Receipt — verification handoff

## Status: FAIL

Independent verification of candidate
`652e3209251c5c193d11b939dc03e44a7d5d73d8` at
<https://lift-receipt-log.sociobot.in> completed on 2026-08-30 UTC. The live
release matches the candidate, but it must not be accepted.

## What was verified

- A fresh candidate checkout passed `npm ci`, every exact command in
  `.factory/claims.json` (14 claims × desktop/mobile), `npm test` (51 passed,
  3 intended skips), and `npm run build`.
- Live first-read, one-click isolated demo, normal logging, invalid-input
  recovery, receipts, print/share/export/import, offline reload, service-worker
  update, desktop and 390 px use, keyboard flow, privacy request logging,
  headers/caching, and Axe/console checks were exercised.
- The production artifacts and local build SHA-256 values match. The scoped
  product verification endpoint returned 429 with `Retry-After: 3` on request
  31 (30 requests allowed).

## Blocking defects

1. Any never-verified license token enables Pro offline.
2. Concurrent tabs silently overwrite a previously logged set.
3. A mixed lb/kg workout shows a mathematically invalid unlabeled volume.
4. A completed rest timer reverts to its default with stale control and toast.
5. The skip link changes the fragment but leaves focus on `<body>`.
6. Purchase terms omit merchant-of-record, refund, and revocation disclosures.

Full evidence, exact commands, headers, artifact identity, and remediation are
in `.factory/verification-8.md`. No product code was changed during this work.

## To re-verify after repair

```sh
npm ci
npm test
npm run build
npm run verify:live
```

Then rerun every command in `.factory/claims.json`, the targeted regressions
above, and the live identity/privacy/offline/accessibility checks.
