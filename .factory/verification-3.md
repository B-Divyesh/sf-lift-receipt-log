# Independent verification 3 — FAIL

**Work order:** `lift-receipt-log-verify-3`
**Candidate tested:** `d2945ab42f866d3d2334d54ac202f92faa1c210f`
**Verified:** 2026-08-28 UTC
**Production URL:** https://lift-receipt-log.sociobot.in

## Verdict

**FAIL.** The deployed application is exactly the requested candidate, and the ordinary online logging flow is sound. It does not meet the `pwa-offline` and accessibility acceptance contract in production:

1. **P1 — production service-worker installation fails.** The deployed worker precaches `/staticwebapp.config.json`, but Azure returns that URL as 404. `cache.addAll()` rejects, the installing worker is discarded, and the live app has no registration or controller. Offline reload and in-app updates are therefore unavailable on the actual product URL.
2. **P1 — a visible PR badge has serious contrast failure.** In a real logged workout, Axe reports `color-contrast` (serious): orange `#f04b23` text on `#fffdf4` is 3.59:1 at 11 px bold, below the required 4.5:1.

No application code was modified by this verifier.

## Release-blocking defects

### P1 — deployed PWA never installs its service worker

**Reproduction on production, fresh Chromium context:**

1. Open `https://lift-receipt-log.sociobot.in/` and wait eight seconds.
2. The app invokes `navigator.serviceWorker.register('/sw.js')`; it initially resolves with a worker in `installing` state.
3. After installation settles, `navigator.serviceWorker.getRegistrations()` is `[]` and `navigator.serviceWorker.controller` is `false`.

The generated `sw.js` precache contains `/staticwebapp.config.json`. Every other precache member returned HTTP 200 in production, but `https://lift-receipt-log.sociobot.in/staticwebapp.config.json` returned HTTP 404 (`text/html`, 2,400 B). The worker's install handler uses `cache.addAll(PRECACHE)`, so that one non-OK response rejects installation.

This is a deployment-only regression: `scripts/preview-test.mjs` serves the file locally, which lets the offline and changed-worker tests pass. Azure uses the configuration file but does not serve it as a site asset. Remove host-only configuration from the precache (or tolerate an optional missing asset), then verify a fresh production registration, controlled offline reload, local offline logging, and an update toast.

### P1 — PR stamp fails serious color contrast in normal use

**Reproduction on production at 390 × 844:**

1. Log `dl` / `315x3` and press Enter; it creates a visible `PR` badge.
2. Run Axe on that active-workout state.

Axe returns one serious violation:

```text
color-contrast: .pr-stamp
foreground #f04b23, background #fffdf4, 11px bold
actual 3.59:1; required 4.5:1
```

The existing Axe test scans only empty logger/legal pages, so it misses this stateful badge. Use a darker PR foreground or a contrasting badge fill, and add a logged-set Axe regression on desktop and mobile.

## Fresh local evidence

- Clean checkout began at exactly `d2945ab42f866d3d2334d54ac202f92faa1c210f`. `npm ci` installed 58 packages; `npm audit --omit=dev` reported **0 vulnerabilities**.
- The intended `npm test` execution passed: Vitest **7/7**; Playwright **17 passed, 1 expected skip, 0 failed**. The skip is the desktop instance of the deliberately mobile-only overflow assertion. There is no separate lint command; `tsc --noEmit` is part of the build.
- Exact production build passed: `npm run build` (`tsc --noEmit`, Vite, and service-worker generation). It produced `dist/` with JS **27,410 B** (**10,140 B gzip**), CSS **16,571 B** (**4,423 B gzip**), and hero WebP **38,168 B**. These are within the stated static/PWA budgets.
- Independent desktop exercise passed without console/page errors: skip-link focus; `sq` / `225x5` keyboard entry; consecutive-set focus retention; maximum accepted `2000x999`; `100x8kg`; recovery from `2000.01x5` while preserving Squat; remove/Undo; finish-to-receipt; correct **1,999,925** volume; PR count; JSON/CSV download; JSON re-import; alias creation and duplicate-alias recovery; and persisted receipt history after reload.
- Reduced-motion emulation reduces the toast transition and row animation to **0.01 ms** (`1e-05s` computed). A 390 px live run had **0 px** horizontal overflow, logged `dl` / `315x3`, and all visible non-radio controls met 44 × 44 px minimums. The exception is the native radio input itself, which is visibly paired with a 44 px label.
- Empty live logger, `/privacy`, and `/terms` each have no Axe violations; the P1 above appears specifically after logging a PR. Live smoke found title, `lang=en`, one h1, `<main>`, image alt text, labeled buttons, and no console/page errors (load 771 ms).

## Privacy, policy, and live identity

- Normal-use desktop and mobile sessions made requests only to the app origin. Source review finds no analytics, CDN fonts, or runtime third-party scripts. Data is IndexedDB-local; the only optional external endpoint is the permitted Sociobot licensing API, reached only for checkout/license verification.
- The live document has CSP (`default-src 'self'`, narrowly allowing the licensing API), HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, restrictive Permissions-Policy, and immutable cache control on the hashed JS. HTML and `sw.js` use short revalidation caching, appropriate for updates.
- Deployment identity is exact, not merely compatible: local/live SHA-256 values match for `index.html` (`eba186dc5c2fbdaba7e008457f6d4d559e312d43962b04f2e9ad9ae0790ddb43`), `sw.js` (`21f19e88dc03981e230ea780f67d9d9abefd35bcefde9811ccabed1ba20dc9eb`), and `assets/index-DJEi6ax_.js` (`a7cd500594d3ada3c7fcaae1824ab15d37e8931431ca314f9ef7dc99159001f9`).

## Required retest

1. Confirm `/staticwebapp.config.json` is no longer a mandatory precache URL and a fresh live browser has a registration and controller.
2. With that controlled live app, set the context offline, reload, and log a set; then verify a changed worker remains waiting and exposes the user-controlled Refresh action.
3. Run Axe after a successful PR-producing entry in both light and dark modes, desktop and 390 px mobile. There must be zero serious/critical findings.
