# Set Receipt — independent QA handoff

## Status: FAIL

Candidate `80dd072e30d584627b59952e504115ac86b6c396` was independently verified
on 2026-08-28 UTC, locally and at
https://lift-receipt-log.sociobot.in. The live deployment matches the candidate,
but it is **not approved**.

The release blocker is P1: after logging a set, Set Receipt clears the required
Exercise input but focuses Weight × reps. A second keyboard entry errors with
`Choose or type an exercise first.` The core brief is fast repeated set logging,
so this violates the real job-to-be-done.

Full evidence, all passed checks, response-policy/caching findings, and retest
instructions are in `.factory/verification.md`.

## Verified commands

```sh
npm ci
npm test
npm run build
```

Results: install/audit clean; 7 unit tests passed; Playwright 9 passed, 1
intentional skip, 0 unexpected; production build passed and generated `dist/`.
PWA offline reload, service-worker update UI, export, recovery, receipt, desktop
and 390 px checks passed. Do not release until the repeated-set P1 is fixed and
retested.

## Required next steps

1. Retain or intelligently default the active exercise after successful logging.
2. Add a keyboard test that logs two consecutive sets without re-entering it.
3. Configure an enforcing CSP/clickjacking/Permissions-Policy and immutable
   cache headers for hashed assets, then repeat verification.
