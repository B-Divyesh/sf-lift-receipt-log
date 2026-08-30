# Independent verification 8 — FAIL

**Candidate:** `652e3209251c5c193d11b939dc03e44a7d5d73d8`  
**Live URL:** <https://lift-receipt-log.sociobot.in>  
**Verified:** 2026-08-30 UTC

## Verdict

**FAIL.** The deployed artifact exactly matches the candidate and all declared
claim tests pass, but independent exercises found defects in paid access, local
data durability, receipt calculations, the rest timer, keyboard accessibility,
and required purchase terms. No product code was changed.

## Release-blocking findings

### High — unverified token grants Pro offline

After the PWA shell was controlled, I went offline and opened
`/?license=qa-never-verified-token`. Setup displayed **“Pro is active in this
browser”** and exposed custom rest settings. Local storage contained the token
and `{"valid":true,"checkedAt":0}`. This lets an arbitrary token unlock paid
features before any successful verification. Evidence:
`/tmp/lift-receipt-log-live-evidence-8/unverified-offline-license.png`.

### High — separate tabs silently lose a logged set

Two pages opened before either wrote data. Tab A logged `Squat 225x5`; tab B
then logged `Bench press 185x5`. Reloading tab A showed only Bench press (one
row), with no warning or recovery. Evidence:
`/tmp/lift-receipt-log-live-evidence-8/two-tab-data-loss.png`.

### High — mixed units produce a false receipt volume

The advertised grammar accepted `2000x999`, `100x8kg`, and `135 × 10` in one
workout. The receipt retained the units but labelled the combined raw total
`2,000,150` simply as **VOLUME**. A quantity adding lb-reps and kg-reps is not
a valid volume. Evidence:
`/tmp/lift-receipt-log-live-evidence-8/mixed-unit-volume.png`.

### Medium — completed rest timer reverts to its default

Using the accepted offline Pro state, I saved a 15-second custom rest time,
logged a set, and waited 16.2 seconds. The screen then showed `00:15`, still
offered **Pause rest timer**, and retained the “set logged” toast. It neither
kept nor announced the completed state. Observed result:
`{"timer":"00:15","button":"Pause rest timer","toast":"Squat 225lb × 5 logged."}`.

### Medium — skip link does not move focus

From a cold page, Tab focused **Skip to workout**. Enter changed the URL to
`#main`, but `document.activeElement` was `BODY`, not the main landmark or its
heading. This does not satisfy the keyboard skip-link requirement.

### Medium — paid purchase terms omit required disclosures

Public page, Terms, README, and source copy contain no merchant-of-record,
refund-handling, Dodo, or refund-revocation disclosure. The paid-unlock
contract requires those statements.

## Required gates and QA evidence

- `.factory/claims.json` exists. From a fresh checkout of the candidate after
  `npm ci`, every one of its 14 exact commands passed in desktop and 390 px
  projects (28 passing claim executions): `keyboard-receipt`,
  `editable-aliases`, `free-core`, `data-portability`, `receipt-share`,
  `print-receipt`, `erase-local-data`, `demo-sandbox`, `local-private`,
  `no-third-party-assets`, `no-training-advice`, `offline-reload`, `pro-price`,
  and `pro-features`.
- First-read gate passed. Cold mobile page says **“Log sets. Keep a workout
  receipt.”**, identifies lifters recording weight and reps, and has **Try it
  with sample data** plus **Loads a separate sample log** above the fold. One
  click opens the isolated banner and three-set workout sample.
- `npm test` passed: 7/7 Vitest tests, static route/metadata/claims check, and
  51 Playwright tests passed with 3 intended desktop skips (2.7 minutes).
  There is no lint script. `npm run build` passed and produced `dist/`.
- Built initial JS is 35,054 B raw / 12.03 kB gzip; CSS is 18,803 B raw /
  4.88 kB gzip; hero WebP is 38,168 B. No external fonts are loaded.
- `npm run verify:live` passed six routes, demo separation, offline reload and
  logging, console/error checks, request logging, and Axe: 0 console errors,
  0 serious/critical violations, 0 demo external requests, and one permitted
  checkout catalogue request. `/opt/fleet/lib/verify-url.sh` also passed:
  HTTP 200, title/lang, one H1/main, complete image alt text, labelled buttons,
  and no console errors.
- The PWA registers and controls, performs an offline demo reload and logging,
  and exposes the waiting-worker refresh path in the full suite. Reduced motion,
  visible focus styling, mobile overflow, touch targets, print, error recovery,
  import/export, erase, and demo reset/exit were exercised by the suite.
- Live response headers include HSTS, `nosniff`, strict-origin referrer policy,
  frame denial, Permissions-Policy, and CSP. Root/SW use `max-age=30,
  must-revalidate`; hashed JS/CSS use one-year immutable caching. The styled
  missing route returns HTTP 404.
- Candidate/live SHA-256 matched for `index.html`, `404.html`, manifest,
  `sw.js`, production JS/CSS, and hero WebP. For example, JS is
  `4dc59d6483bfe96587536f75b500df424ea7f9b226fb6157c2670bb01bb2d790` in
  both places.
- The product-specific verification endpoint enforced a 30-request allowance:
  request 30 returned 200 and request 31 returned 429 with `Retry-After: 3`.
  This static PWA has no product-owned backend, sign-in, library, or CLI.

## Required remediation

1. Keep Pro locked until first successful license verification; only an already
   verified cached verdict may support offline use.
2. Use merge-safe, record-level persistence or conflict handling across tabs.
3. Convert volume to a named common unit, display separate totals, or prohibit
   mixed units.
4. Stop the rest interval at completion; persist/render and announce `DONE`.
5. Give `main` or its heading a focus target and focus it from the skip link.
6. Add Sociobot/Dodo merchant-of-record, refund, and revocation language to
   public purchase terms.
7. Add regressions for each item, redeploy, and repeat every claim and live
   verification gate.
