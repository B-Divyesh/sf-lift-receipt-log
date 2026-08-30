# Set Receipt — adversarial first-read review 1 handoff

## Status: FAIL

Reviewed candidate `a7d4ba516ac092d3105ef8b4d9d7a8eb99017bff` and the live site on 30 August
2026 UTC. No product code was modified. The complete report is
[review-1.md](review-1.md).

Four blockers remain: the 390 px first screen hides the sample action behind a
timer-led layout; the first demo viewport contains no sample row; demo edits
survive `Start for real`; and the declared `$9 once` checkout claim failed
intermittently when both Sociobot product endpoints returned HTTP 503. Route focus, landing
structure, copy, terminology, metadata, and claim-listing findings are also
documented.

## Verification performed

- Fresh `npm ci` completed with 0 reported vulnerabilities.
- All 11 exact `.factory/claims.json` commands ran: 10 passed and `pro-price`
  failed in both desktop and mobile. A later retry recovered to 2/2.
- `npm test` failed at the same two `pro-price` cases; all other results were 36
  passed and 2 expected skips after 7/7 Vitest and the static route check passed.
  After the endpoint recovered, a final full rerun passed with 38 passed and 2
  expected skips.
- `npm run build` passed and produced `dist/`; initial JS is 31.59 kB raw and
  11.31 kB gzip.
- Live cold mobile/desktop, demo/reset/isolation, demo exit/re-entry, offline
  reload/logging, metadata, 404, link status, history regressions, focus,
  request logs, and mobile target geometry were exercised.
- `/opt/fleet/lib/verify-url.sh` passed with no console/page errors. Axe CLI
  found 0 violations on `/`; Playwright Axe found 0 violations on the core,
  demo, legal, and 404 routes, and no serious/critical PR-state issue in light
  or dark mode.

## Reproduce

```sh
npm ci
npm run test:e2e -- --grep @claim:pro-price
npm test
npm run build
```

During the required claim run and full suite, both of these returned HTTP 503:

```text
https://api.sociobot.in/api/v1/products
https://api.sociobot.in/api/v1/products/lift-receipt-log/checkout
```

A final probe later recovered to catalogue 200 and checkout 303. The observed
intermittent failure remains blocking under the claims review rule.

## Next step

Repair every finding in `.factory/review-1.md`, deploy the candidate and
checkout dependency, then rerun the full review from a fresh browser context.
