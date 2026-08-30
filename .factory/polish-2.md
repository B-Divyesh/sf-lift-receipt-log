# Polish round 2 — Set Receipt

Candidate `92b3564797582bf1eea8146903b1e1a76f7c9038` was repaired against
`review-2.md` and every finding in `review-1.md`. Production is
<https://lift-receipt-log.sociobot.in>; the canonical isolated demo is
<https://lift-receipt-log.sociobot.in/?demo=1>.

Evidence paths below are created by the named repeatable browser tests. The
post-deploy command `npm run verify:live -- https://lift-receipt-log.sociobot.in
test-results/evidence/live` checks the six routes, demo isolation, offline use,
request origins, console output, and serious/critical Axe results.

## Review 1 findings

| Finding | Change made | Evidence: test · screenshot · live URL check |
| --- | --- | --- |
| F-1-1 | Kept the job headline, audience, sample action, outcome, facts, and full set form above the 390 × 844 fold. | `mobile first screen exposes…` · `test-results/evidence/mobile-first-screen.png` · cold `/` geometry passed |
| F-1-2 | Kept the active sample receipt before entry controls in demo mode. | `@claim:demo-sandbox` · `test-results/evidence/mobile-demo-first-screen.png` · first row visible on `/?demo=1` |
| F-1-3 | Setup now checks the registered 900-cent catalogue entry before showing Buy Pro; an outage shows a disabled state and retry action. | `@claim:pro-price` covers recorded 503 and 200 responses · root screenshot · live Setup reflects the current endpoint state |
| F-1-4 | Demo exit deletes its IndexedDB database; re-entry reseeds three rows while the real row survives. | `@claim:demo-sandbox` · live demo screenshot · cold edit/reset/exit/re-entry passed |
| F-1-5 | Route H1s remain focusable and focus after links, Back, and Forward with a polite announcement. | `moves focus and announces…` · live root screenshot · live Privacy/Back focus passed |
| F-1-6 | Preserved How it works, limits, and paid sections after the live logger. | `sets route titles…` · root screenshot · live `/` content scan passed |
| F-1-7 | Preserved the shared wordmark, Log/Receipts/Setup navigation, and footer on app and legal routes. | `sets route titles…` · live root screenshot · six-route live sweep passed |
| F-1-8 | Preserved route-specific Open Graph and Twitter data on the static 404. | `npm run test:static` · live 404 in URL verifier · live `/definitely-missing` returned 404 |
| F-1-9 | Kept “Log sets. Keep a workout receipt.” as the H1. | `mobile first screen exposes…` · mobile root screenshot · live `/` passed |
| F-1-10 | Kept “Finished workouts become receipts” in the empty state. | full browser suite · root screenshot · live `/` scan passed |
| F-1-11 | Kept “Start rest timer.” | full browser suite · root screenshot · live `/` scan passed |
| F-1-12 | Kept “Reset rest timer.” | full browser suite · root screenshot · live `/` scan passed |
| F-1-13 | Kept “No loading spinner” removed. | `npm run test:static` reviewed-copy scan · root screenshot · live copy scan passed |
| F-1-14 | Kept the precise browser-storage and license-check footer. | `@claim:local-private` · root screenshot · live same-origin sweep passed |
| F-1-15 | Kept “rest timer” as the only public term. | static reviewed-copy scan · root screenshot · live route scan passed |
| F-1-16 | Kept the README coverage sentence short and plain. | `.factory/copy-audit.md` · root screenshot · deployed README source matches |
| F-1-17 | Rewrote the README opening with keyboard logging and browser storage. | static reviewed-copy scan · root screenshot · live wording matches |
| F-1-18 | Kept the README demo description plain and specific. | `@claim:demo-sandbox` · demo screenshot · live `/?demo=1` passed |
| F-1-19 | Kept the README user copy free of database jargon. | `.factory/copy-audit.md` · root screenshot · live copy scan passed |
| F-1-20 | Removed the untested installation promise; README now claims only tested offline reload and logging. | `@claim:offline-reload` · offline screenshot · live offline flow passed |
| F-1-21 | Kept repository/payment-provider implementation wording out of user copy. | static reviewed-copy scan · Setup screenshot via live sweep · live Setup scan passed |
| F-1-22 | Kept service-worker implementation jargon out of README. | `.factory/copy-audit.md` · offline screenshot · live offline flow passed |
| F-1-23 | Kept plain third-party asset wording and same-origin coverage. | `@claim:no-third-party-assets` · root screenshot · live request log had zero external requests |
| F-1-24 | Kept daily license verification wording and behavior. | `@claim:pro-features` · Setup screenshot via live sweep · live Setup loaded cleanly |
| F-1-25 | Kept unmeasured “fast” out of metadata. | `sets route titles…` · root screenshot · six live route titles passed |
| F-1-26 | Kept all three advertised entry formats under one claim. | `@claim:keyboard-receipt` · root screenshot · live keyboard logging passed |
| F-1-27 | Kept free logging, timers, aliases, receipts, and export registered and tested without a license. | `@claim:free-core` · root screenshot · live unlicensed root passed |
| F-1-28 | Kept repository payment-integration claims out of user copy. | static reviewed-copy scan · Setup screenshot via live sweep · live Setup scan passed |
| F-1-29 | Kept unsupported Node compatibility wording removed. | `.factory/copy-audit.md` · root screenshot · deployed README source matches |
| F-1-30 | Kept unsupported user-facing build-output promises removed. | `.factory/copy-audit.md` · root screenshot · production build created `dist/` |
| F-1-31 | Kept asset/privacy claims narrow and fully tested. | `@claim:local-private`, `@claim:no-third-party-assets` · demo screenshot · live external request count was zero |
| F-1-32 | Kept the unmeasured notebook-speed comparison removed. | static reviewed-copy scan · root screenshot · live root copy passed |
| F-1-33 | Replaced the regressed immutable label with “COMPLETED WORKOUT” and renamed the test to claim persistence only. | `@claim:keyboard-receipt`, `uses reviewed literal labels…` · receipt state covered by suite · live forbidden-copy scan passed |
| F-1-34 | Kept unsupported merchant-of-record claims out of public copy. | static reviewed-copy scan · Setup screenshot via live sweep · live legal/Setup scan passed |
| F-1-35 | Kept unsupported card-handling promises out of public copy. | static reviewed-copy scan · Privacy screenshot via URL verifier · live `/privacy` passed |
| F-1-36 | Kept unsupported refund/revocation promises out of public copy. | static reviewed-copy scan · Terms screenshot via URL verifier · live `/terms` passed |
| F-1-37 | Kept the future backup-compatibility promise removed. | `@claim:data-portability` · Setup screenshot via live sweep · live Setup passed |

## Review 2 findings

| Finding | Change made | Evidence: test · screenshot · live URL check |
| --- | --- | --- |
| F-2-1 | Removed “Installs as an app”; README now promises only offline reload and logging, which the suite performs. | `@claim:offline-reload` · `test-results/evidence/live/cold-mobile-offline.png` · live offline reload/log passed |
| F-2-2 | Added `no-training-advice` to claims and a rendered-route test that rejects prescriptive guidance. | `@claim:no-training-advice` · root screenshot · live `/` and `/terms` show the boundary |
| F-2-3 | Replaced “compact receipt” with “workout receipt.” | static reviewed-copy scan · root screenshot · live forbidden-copy scan passed |
| F-2-4 | Standardized workout and license storage wording on “this browser.” | `uses reviewed literal labels…` · mobile root screenshot · live status says “Saved in this browser” |
| F-2-5 | Renamed “OPEN RECEIPT” to “ACTIVE WORKOUT.” | `uses reviewed literal labels…` · demo screenshot · live demo scan passed |
| F-2-6 | Replaced both “ONE-TIME UNLOCK” labels with “PRO FEATURES.” | `uses reviewed literal labels…` · Setup screenshot via live sweep · live Setup scan passed |
| F-2-7 | Replaced “LOCAL LIFT LOG / READY” with “LOCAL WORKOUT LOG”; offline remains an explicit state. | `uses reviewed literal labels…` · mobile root/offline screenshots · live root and offline states passed |
| F-2-8 | Replaced the Privacy mood label with “WORKOUT AND LICENSE DATA.” | `uses reviewed literal labels…` · URL-verifier Privacy capture · live `/privacy` passed |
| F-2-9 | Replaced the Terms mood label with “USE AND PRO LICENSE TERMS.” | `uses reviewed literal labels…` · URL-verifier Terms capture · live `/terms` passed |
| F-2-10 | Replaced the receipts mood label with “FINISHED WORKOUTS.” | `uses reviewed literal labels…` · route screenshot via live sweep · live `/?view=history` passed |
| F-2-11 | Replaced the Setup mood label with “LOGGING, DATA, AND PRO.” | `uses reviewed literal labels…` · route screenshot via live sweep · live `/?view=settings` passed |
| F-2-12 | Renamed “Set” to “Save rest time.” | `@claim:pro-features`, `uses reviewed literal labels…` · demo Setup screenshot via live sweep · live demo Setup passed |
| F-2-13 | Added the intended lifter audience to the README opening. | `.factory/copy-audit.md` · mobile root screenshot · live first-screen audience matches |
| F-2-14 | Renamed the README heading to “What Set Receipt does.” | static reviewed-copy scan · root screenshot · deployed README source matches |

## Additional cold-audit repair

The first live audit expanded Axe coverage to Setup and exposed dark-mode text
and custom-button contrast in the Pro panel. The panel now uses stable ivory
text and dark button text on the light-blue dark-mode control. The expanded
`has no serious accessibility violations on core and legal screens` test covers
root, demo, Receipts, Setup, demo Setup, Privacy, Terms, and 404 in both themes.
The final live verifier reports zero serious/critical Axe violations.

## Verification summary

- Clean-clone claim run: all 14 exact commands passed in desktop and mobile
  projects (28 claim executions).
- Clean-clone `npm test`: 7 unit tests and 51 browser tests passed; 3
  project-specific tests were intentionally skipped.
- `npm run build`: `dist/` created; initial JS 34.78 kB raw / 11.98 kB gzip;
  CSS 18.80 kB raw / 4.88 kB gzip.
- Mobile Lighthouse on `/?demo=1`: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 0 ms.
- `/opt/fleet/lib/verify-url.sh` passed the live root and demo with HTTP 200,
  no console errors, one H1, `lang=en`, one main landmark, and no missing alt.
- Deployment ID: `0fd92e88-5243-45c4-b47c-fad824c14c0d`; a final redeploy was
  made after the expanded dark-mode contrast fix.
