# Independent verification 6 — PASS

**Work order:** `lift-receipt-log-verify-6`  
**Candidate:** `7a136da53ae3318cf7193a43aad362990e7561eb`  
**Verified:** 2026-08-30 UTC  
**Live URL:** <https://lift-receipt-log.sociobot.in>

## Verdict

**PASS.** The live app is a functional local-first lifting logger and receipt PWA, not a demo. All mandatory claim tests, clean-checkout gates, live privacy/PWA checks, and the real job-to-be-done passed. The live deployment is byte-identical to the candidate's production build. No product code was changed during verification.

There are no release-blocking, high, medium, or low defects. The deployment-only worker failure reported in verification 3 is fixed: the worker no longer precaches the host-only `staticwebapp.config.json`, registers in production, controls the page, and supports offline reload.

## First-read test — PASS

In a cold browser with no storage, the first screen says **“Log the set. Keep the proof.”** and **“For lifters who want to log a set as fast as a notebook.”** It tells regular lifters what it does and presents the visible, one-click **“Try it with sample data”** action with **“Loads a separate sample log.”** The action opened `/demo`, immediately showing realistic sample sets and a persistent **“Demo — sample data, nothing is saved to your log”** banner with **Reset demo** and **Start for real**. This satisfies the plain-words and sandbox gate.

## Clean-checkout gates — PASS

- Started at the exact candidate commit with a clean worktree. `npm ci` added 58 packages and reported 0 vulnerabilities.
- `.factory/claims.json` exists. Every exact listed command ran sequentially against the local production-preview/demo entry point and passed in both Chromium desktop and 390 px mobile projects: `keyboard-receipt`, `editable-aliases`, `data-portability`, `receipt-share`, `print-receipt`, `erase-local-data`, `demo-sandbox`, `local-private`, `offline-reload`, `pro-price`, and `pro-features`.
- `npm test` passed: 7/7 Vitest assertions, static 404/route verification, and all 40 Playwright cases. This covers keyboard logging, aliases, invalid-input recovery, portability, sharing/printing, erase/reset, demo isolation, privacy capture, worker update, offline reload, touch geometry, and Axe. The dedicated service-worker update test also passed 2/2.
- `npm run build` passed `tsc --noEmit`, Vite, and worker generation and produced `dist/`. No separate lint script is configured; type checking is part of the build.
- Build budgets pass: JS **31,589 B / 11.31 kB gzip**, CSS **17,642 B / 4.62 kB gzip**, first-screen hero WebP **38,168 B**, and no downloaded webfonts.

## End-to-end exercise — PASS

- On live `/demo`, keyboard entry `sq` + `225x5` produced **Squat 225lb × 5**, a PR, and a running rest clock. An added `zz` alias for Zercher squat worked with valid upper-bound input `2000x999`.
- On a fresh real log, invalid `2000.01x5` gave the focused recovery message **“Weight must be between 0 and 2,000.”** A corrected `225x5` then completed normally. **Finish workout** made a receipt with 1 set, **1,125** volume, duration, and PR count. Print media leaves the receipt while hiding app chrome and controls.
- Claim tests independently verified JSON/CSV contents, malformed-import recovery, valid restoration, clipboard receipt copy, immutable history, erase/reset, demo namespace isolation, and mocked daily-cached licensing. Artifact identity below makes those local production-build results applicable to live.

## Live deployment, PWA, privacy, and security — PASS

- Local/live SHA-256 values match for HTML `62780eca46de706000ed62b6dfa47a86462cd72221edb8e078c0b680f080f7e1`, worker `00941ab0a8e5ccdbd9884137bf37df8217950abc7754d282a5099036b151e2e9`, manifest `2f62890f30761e185c556100f5d83b156382cf1fe570847f0000aabb31f07a56`, JS `61a7cc64c637755f52ae4c564bc7cf2866b0a48f3b2f4c40411226c2f35b76f3`, and CSS `3f740d544b7294a5baf161ad29be3c88cd39cd835991d218a4669d80b8eb39f8`.
- A fresh 390 px production context registered one controlling worker at scope `/`. Offline `/demo` reload announced **“OFFLINE · LOGGING STILL WORKS”** and accepted `Deadlift 325lb × 3`, with no console/page errors. The local changed-worker test exposed **Update ready / Refresh** and passed on desktop and mobile.
- Ordinary live demo logging and alias creation made requests only to `https://lift-receipt-log.sociobot.in`; no analytics, tracking, CDN, or font request was observed. The optional license API was not contacted in this flow.
- Live headers include HSTS, `nosniff`, restrictive CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, strict-origin referrer policy, restrictive Permissions-Policy, and immutable one-year hashed assets. Shell and worker revalidate after 30 seconds. `/not-a-real-route` is a genuine styled HTTP 404 with a recovery link.
- The live catalog lists **Set Receipt Pro**, USD 900 cents; its documented checkout returned **303** to `checkout.dodopayments.com`. No payment was submitted.
- This static PWA has no product-owned server endpoint. For the relevant factory verification endpoint, one client sent 35 invalid-license requests: 1–30 returned 200; request 31 and later returned **429** with `Retry-After: 3` (then 2). Observed allowance: **30 requests per active window**.

## Accessibility, responsive, and performance — PASS

- Live `/`, `/demo`, `/privacy`, `/terms`, and the 404 have `lang="en"`, one H1, a main landmark, route-specific title, and image alt text.
- Keyboard focus starts at **Skip to workout**; Enter reaches the exercise input and keyboard logging works. Focus is visibly designed. At 390 px there is zero horizontal overflow and no visible target smaller than 44 × 44 px. Reduced-motion transition duration measured `0.00001s`.
- Axe 4.10 found **0 serious/critical** findings on all five routes in light and dark schemes, and in a 390 px scan. Tested console/page errors: 0.
- Fresh mobile Lighthouse: **96 Performance**, **100 Accessibility**; FCP **1.1 s**, LCP **1.3 s**, CLS **0**, TBT **220 ms**, **57 KiB** transfer.

## Remaining limitation

The real hosted checkout redirect and return-token implementation were verified, but QA did not submit a production payment. This is not a release defect; deterministic browser coverage verifies return-token capture and daily-cached license verification.
