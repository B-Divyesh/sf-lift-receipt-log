# Independent verification 9 — PASS

**Candidate:** `e3faa1c6fbd692a0727de41a754f87abff1e0aca`  
**Live URL:** <https://lift-receipt-log.sociobot.in>  
**Verified:** 2026-08-30 UTC

## Verdict

**PASS.** The deployed files match the candidate exactly and all in-scope local
and live acceptance gates passed. No product code was changed during verification.

## First-read and demo

A cold, logged-out desktop load plainly says **“Log sets. Keep a workout
receipt.”**, identifies **“lifters who record weight and reps during a
workout,”** and offers **“Try it with sample data”** with **“Loads a separate
sample log.”** One click opened `/?demo=1`, showed the persistent separate-data
banner, and loaded a three-set sample workout immediately. This passes the
plain-words and demo-sandbox gates.

## Claims gate

`.factory/claims.json` exists with 19 registrations. From this clean checkout
after `npm ci`, every exact declared command passed individually and
sequentially (two desktop/mobile executions per command):

`keyboard-receipt`, `unit-aware-volume`, `tab-safe-logging`, `editable-aliases`,
`free-core`, `data-portability`, `receipt-share`, `print-receipt`,
`erase-local-data`, `demo-sandbox`, `local-private`, `no-third-party-assets`,
`no-training-advice`, `offline-reload`, `timer-completion`, `pro-price`,
`pro-features`, `verified-license-only`, and `purchase-terms`.

Evidence: `/tmp/lift-claims-clean.log`; exit status `0` is in
`/tmp/lift-claims-clean.status` in this verifier container.

## Local quality gates

- `npm ci`: 58 packages; 0 audit vulnerabilities.
- `npm run typecheck` and `npm run lint`: passed.
- Clean `npm test`: 8 Vitest tests, static metadata/copy/claims validation,
  and 61 Playwright tests passed; 3 deliberate mobile-only desktop instances
  skipped.
- `npm run build`: passed and produced `dist/`. JavaScript is 37,444 B raw /
  12.76 kB gzip; CSS is 18,803 B raw / 4.88 kB gzip; hero WebP is 38,168 B.
- The suite covers normal logging, aliases, export/import, share/print, erase,
  invalid-input recovery, receipts, concurrent tabs, service-worker updates,
  offline reload, and mobile touch geometry.

## Live product QA

- `npm run verify:live` passed all six routes plus demo isolation, offline
  reload/logging, skip focus, concurrent tabs, unit-aware volume, timer
  completion, unverified-license rejection, and purchase terms.
- Browser request logging found **0** external requests during ordinary demo
  use. Cold load requested only this origin's document, JS, CSS, and hero image.
  There were 0 console/page errors.
- Playwright Axe returned **0 serious/critical findings** across landing, demo,
  receipts, setup, privacy, terms, and 404. The page has lang/title/one h1/main,
  labels, visible focus, a working skip link, and reduced-motion support.
- At 390 px there was no horizontal overflow and the sample action/outcome were
  above the fold. Live invalid input displayed `Use weight x reps, like 225x5.`
  and accepted a corrected `225x5`; Tab order exposed visibly focused controls.
- The service worker controlled the app, reloaded the sample offline, and
  logged `Deadlift 325x3` offline. The full suite verifies the Refresh action
  for a waiting worker update.
- Response headers provide CSP (self plus the documented billing origin), HSTS,
  nosniff, strict-origin referrer policy, frame denial, and Permissions-Policy.
  Root/SW revalidate at 30 seconds; hashed JS/CSS cache immutable for one year.
- This static/local-first product has no product-owned server endpoint or
  sign-in. I did not directly rate-limit-probe the separately operated
  Sociobot billing API because the work order expressly forbids connecting to
  non-`sf-` resources; the product's in-scope browser behavior was verified.

## Candidate/deployment identity

Live and candidate SHA-256 values matched exactly for `index.html`, JavaScript,
CSS, `sw.js`, manifest, offline page, and 404. Key values:

- JS: `06b665ebf1bb54582253576cce065a253ccda467e5d46e9d98f427a3405ebac9`
- CSS: `ee9ddf205445b55785e155c8ed9e03377509eb1d3078002f8239098be1c82dd7`
- service worker: `e444c8f0dce236524b0193e5074902a90480d2d9637470455bc9735317a5d07e`
- manifest: `bb0849e7632949e8db04a1a47513b5cdc90aeac6f4192377c47e2a42f0c39a40`

## Findings

No release-blocking, high, medium, or low product defects were found. The
prohibited external billing-service rate-limit probe is a documented coverage
boundary, not a product-owned endpoint, and does not change this PASS verdict.
