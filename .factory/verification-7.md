# Independent verification 7 — FAIL

**Work order:** `lift-receipt-log-verify-7`  
**Candidate:** `664641f6bef5592f1416a4dbe3ad9acd06d510fb`  
**Verified:** 2026-08-30 UTC  
**Live URL:** <https://lift-receipt-log.sociobot.in>

## Verdict

**FAIL.** The shipped product performs the brief's job and every declared claim
test passed, but the candidate does not meet the release contract because the
exact `npm test` quality gate fails consistently. The live 404 page also has
five touch targets below the required 44 by 44 CSS pixels. No product code was
changed during this verification.

## Release-blocking findings

### High — the required `npm test` command fails

The clean-checkout command reached Playwright with 7/7 unit assertions and the
static checks passing, then finished with **49 passed, 3 skipped, 2 failed**.
Both failures are the desktop and 390 px projects for `has no serious
accessibility violations on core and legal screens` at
`tests/e2e/app.spec.ts:458`. The test scans 8 routes in both light and dark mode
inside Playwright's default 30-second test timeout; both projects timed out in
`AxeBuilder.analyze()` at line 464.

An immediate isolated rerun with the repository's normal timeout failed the
same two projects. Running that same test without changing source, but with
`--timeout=60000`, passed 2/2 in 46.5 seconds. Independent live Axe scans also
found zero serious/critical violations. This identifies an under-budgeted test,
not an observed Axe violation, but the acceptance contract explicitly requires
the exact `npm test` command to pass.

Reproduce:

```sh
npm ci
npm test
npm run test:e2e -- --grep "has no serious accessibility violations on core and legal screens"
```

### Medium — undersized links on the live mobile 404 page

At 390 by 844 CSS pixels, `/definitely-missing` returns the intended styled
HTTP 404, but five visible links are smaller than 44 by 44 CSS pixels:

- Log: 26.7 by 17
- Receipts: 62.3 by 17
- Setup: 41.8 by 17
- Privacy: 42.6 by 19.5
- Terms: 35.4 by 19.5

The primary recovery links and wordmark meet the target size. The undersized
links come from the header/footer markup at `public/404.html:37-39`; the inline
CSS gives the wordmark and recovery buttons minimum heights but not those nav
links. This violates the product's non-negotiable mobile target baseline. The
existing touch-target test does not visit the 404 route.

## Mandatory opening gates

### Claims — PASS

`.factory/claims.json` exists. From a clean clone, all 14 listed commands were
run separately through the production-preview demo entry point. Every command
passed in both configured projects (28 executions total):

`keyboard-receipt`, `editable-aliases`, `free-core`, `data-portability`,
`receipt-share`, `print-receipt`, `erase-local-data`, `demo-sandbox`,
`local-private`, `no-third-party-assets`, `no-training-advice`,
`offline-reload`, `pro-price`, and `pro-features`.

### First-read — PASS

A new live browser at `/` showed **“Log sets. Keep a workout receipt.”** and
**“For lifters who record weight and reps during a workout.”** The visible
**“Try it with sample data”** action says **“Loads a separate sample log.”**
beside it. On mobile, the action, its explanation, the three privacy/offline/
price facts, and the logging controls are visible on the first screen.

Opening the action reaches `/?demo=1`, immediately shows the seeded workout,
and keeps a persistent **“Demo — sample data, nothing is saved to your log”**
banner with **Reset demo** and **Start for real**. The claim test and live
verifier both confirmed that demo edits do not alter the real log.

## Clean build and product exercise

- `npm ci`: passed; 58 packages installed, 0 audit vulnerabilities.
- `npm run build`: passed TypeScript checking, Vite production build, and
  service-worker generation; `dist/` was produced.
- No separate lint script exists. Type checking is part of `npm run build`.
- Production output: JS 35,054 B raw / 12.03 kB gzip; CSS 18,803 B raw /
  4.88 kB gzip; hero WebP 38,168 B; no webfont files or requests. All are below
  the contract budgets.
- Independent live keyboard flow reached the skip link first, then the sample
  action and exercise input. Focus used a visible 4 px solid cobalt outline
  with 3 px offset.
- Invalid empty exercise, `225`, `0x5`, and `100x0` entries each produced a
  specific recovery message. Correcting the entry worked without a reload.
- Exact upper boundary `2000x999` and mixed-unit `100 × 8kg` both logged. The
  completed receipt showed 2 sets and 1,998,800 volume and survived reload.
- Same-origin link crawling found 200 responses for `/`, demo, history, setup,
  privacy, and terms. The deliberately missing route returned 404.

## Live identity, privacy, headers, and billing boundary

The live deployment is byte-identical to the candidate's local production
build for all checked shell artifacts:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `eb3c4534a75e50603fdb08542ff36c86307e899a14723cfb1c419588aa817537` |
| `manifest.webmanifest` | `857f05593cf4fd75d6de1bc1156088364b660f9c3dfa89cd64171b20ec910955` |
| `sw.js` | `b628b226ff02a220596599055ca2eafba0e9b820285fa3a4523875b3094c3c0a` |
| production JS | `4dc59d6483bfe96587536f75b500df424ea7f9b226fb6157c2670bb01bb2d790` |
| production CSS | `ee9ddf205445b55785e155c8ed9e03377509eb1d3078002f8239098be1c82dd7` |
| hero WebP | `d1c0dd648f0dea64f4c2f1620bf93ccd182032bfb0322e9ad6aeaff59bcd2117` |

- Live ordinary logging requested only the document and same-origin JS, CSS,
  and hero image. The repeatable live verifier reported 0 external demo
  requests, 0 console errors, 0 page errors, and one allowed checkout catalogue
  request outside the demo flow. No analytics, trackers, CDN scripts, or font
  requests were observed.
- Browser-read response headers include HSTS, `nosniff`, strict-origin referrer
  policy, restrictive Permissions-Policy, `X-Frame-Options: DENY`, and a CSP
  limited to self plus `api.sociobot.in` for connections. The shell and worker
  revalidate after 30 seconds; hashed JS/CSS use one-year immutable caching.
- The live catalogue returned Set Receipt Pro at USD 900 cents. Checkout
  returned HTTP 303 to `checkout.dodopayments.com`; no purchase was submitted.
- The scoped `lift-receipt-log` license verification endpoint was called with
  an invalid QA token. Requests 1–30 returned 200. Requests 31–35 returned 429
  with `Retry-After: 4`. Observed allowance: **30 requests per active window**.
- This is a static PWA with no product-owned server endpoint, sign-in, or shared
  database, so backend concurrency, persistence, and Entra checks do not apply.

## PWA, accessibility, and performance evidence

- `npm run verify:live -- https://lift-receipt-log.sociobot.in ...` passed six
  routes, demo isolation, offline reload and logging, request privacy, console
  checks, and Axe checks.
- `/opt/fleet/lib/verify-url.sh` passed both `/` and `/?demo=1`: HTTP 200,
  `lang=en`, one H1, one main, no missing image alt, no unlabeled button, and no
  console error.
- A fresh 390 px live context installed a controlling worker, reloaded the demo
  offline, logged a new set, and retained it after another reload. The local
  two-project update test exposed **Update ready / Refresh**, activated the
  waiting worker, and passed 2/2.
- Chromium parsed the live web manifest with no manifest errors. It reports the
  expected name, start URL, standalone display, scope, theme/background colors,
  and 192/512 icons.
- Independent Axe 4.10 scans covered 8 routes, light and dark, at 390 px:
  **0 serious/critical findings**. All routes had zero horizontal overflow.
  All visible targets met 44 by 44 except the five 404 links listed above.
- Reduced-motion emulation matched the media query and reduced the toast
  transition to 0.01 ms.
- Fresh mobile Lighthouse on live demo: Performance **99**, Accessibility
  **100**, Best Practices **100**, SEO **100**; FCP 1.0 s, LCP 1.1 s, CLS 0,
  TBT 150 ms, and 33 KiB transfer.

## Required next steps

1. Make the full accessibility matrix complete within the default test budget
   (for example, split it into bounded tests or set an explicit justified
   timeout), then confirm exact `npm test` passes from a clean checkout.
2. Give every header and footer link on `public/404.html` a 44 by 44 CSS pixel
   activation target and add the 404 state to the mobile target regression.
3. Rebuild, deploy, repeat all claim commands, the exact full quality gate,
   mobile 404 geometry, offline/update checks, and live-candidate hash matching.
