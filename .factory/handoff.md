# Set Receipt — verification-3 handoff

## Status: FAIL — do not release this candidate

**Candidate:** `d2945ab42f866d3d2334d54ac202f92faa1c210f`
**Live URL:** https://lift-receipt-log.sociobot.in
**Full report:** `.factory/verification-3.md`

The live deployment is byte-for-byte the candidate, but two P1 acceptance failures remain:

1. The production service worker cannot install because its precache includes `/staticwebapp.config.json`, which Azure returns as 404. The worker is discarded; production has no service-worker registration/controller, so offline reload and PWA update behavior do not work.
2. After a normal PR-producing set, `.pr-stamp` has Axe serious `color-contrast` failure (3.59:1 at 11 px; minimum is 4.5:1).

## What was verified

- `npm ci`; `npm audit --omit=dev` (0 vulnerabilities); `npm test` (7/7 unit, 17 Playwright passed, 1 expected skip); and exact `npm run build` all pass.
- Build output is within budget: 27,410 B JS (10,140 B gzip), 16,571 B CSS (4,423 B gzip), and 38,168 B hero WebP.
- Desktop and 390 px exercised keyboard logging, aliases, boundary/invalid input recovery, Undo, receipt totals/PRs, export/import, persistence, visible focus, reduced motion, mobile overflow, privacy/network behavior, headers, caching, and live deployment identity.
- Online core logging is functional with no console/page errors. Privacy stays local-first; normal sessions make no third-party requests.

## Next steps

Fix the precache to omit/tolerate the Azure host configuration file and adjust the PR badge color treatment. Add production-like service-worker coverage and stateful Axe coverage after logging a PR. Then redeploy and rerun the three required retests in `.factory/verification-3.md`.

No application code was modified during this verification.
