# Set Receipt — verification 9 handoff

## Status: PASS

Independent QA passed candidate `e3faa1c6fbd692a0727de41a754f87abff1e0aca`
at <https://lift-receipt-log.sociobot.in>. The live deployment exactly matches
the candidate build. Verification changed documentation only, not product code.

## What was verified

- The first screen plainly describes logging sets and workout receipts for
  lifters and provides the one-click **Try it with sample data** demo.
- All 19 exact tests in `.factory/claims.json` passed individually.
- `npm run typecheck`, `npm run lint`, clean `npm test` (8 unit and 61
  Playwright passes; 3 intentional skips), and `npm run build` passed.
- Live QA passed demo isolation, privacy request logging, offline PWA reload
  and logging, service-worker update UI, normal/error-recovery logging,
  aliases, export/import, receipts/share/print, concurrent tabs, keyboard,
  390 px mobile, reduced motion, response headers/caching, and Axe (0 serious
  or critical findings; 0 console/page errors).
- Initial JavaScript is 12.76 kB gzip; CSS is 4.88 kB gzip.

## How to verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:live
```

Use `https://lift-receipt-log.sociobot.in/?demo=1` for the isolated sample.
**Reset demo** restores it and **Start for real** discards demo state.

## Known gaps / next steps

No product defects were found. The product has no product-owned server
endpoint. The separately operated Sociobot billing API rate-limit probe was not
made because the work order forbids connecting to non-`sf-` resources; all
in-scope browser behavior remains verified. See `.factory/verification-9.md`
for detailed evidence and deployment hashes.
