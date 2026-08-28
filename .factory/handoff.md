# Set Receipt — repair handoff

## Status: deployed and verified

**Work order:** `lift-receipt-log-repair-1`
**Verifier base:** `80dd072e30d584627b59952e504115ac86b6c396`
**Verifier report commit:** `ebfab4e9c7815ad12367d45e8ca7ac73d8fef913`
**Functional repair commit:** `e5b63308e6bca28a73f28f2fefb6ac4fd3733c44`
**Deployed policy commit:** `fda2d65`

## Release blocker repaired

The verifier's P1 was reproduced against the base candidate: after `sq` / `225x5`
and Enter, the new form state was `{ exercise: "", focused: "set-expression" }`.
Entering another `225x5` then failed with `Choose or type an exercise first.` and
only one row existed.

`addSet` now restores the resolved, canonical exercise into the newly rendered
form before returning focus to Weight × reps. This keeps the intended fast,
keyboard-first flow unambiguous: `sq` resolves to `Squat`, focus remains on the
expression input, and Enter logs each following Squat set without retyping the
exercise.

Exact regression coverage is in `tests/e2e/app.spec.ts` as
`keeps the active exercise for consecutive keyboard entries`. It asserts the
canonical retained value, focus, two saved rows, and no validation error. It
runs under both Desktop Chrome and the configured 390 × 844 mobile Chromium
project.

## Verification evidence

All checks ran from the repaired checkout on 2026-08-28 UTC.

```sh
npm ci
npm audit --omit=dev
npm test
npm run build
```

- Clean install: 58 packages; `npm audit --omit=dev`: 0 vulnerabilities.
- Unit/integration: 7/7 Vitest tests passed.
- Browser: 11/11 Playwright tests passed; one intentional desktop skip remains
  for the mobile-only overflow assertion. The new repeat-set keyboard test
  passed on desktop and 390 px mobile.
- Type checking is part of `npm run build` (`tsc --noEmit`); the production
  build passed and produced `dist/index.html`, hashed JS/CSS, manifest, icons,
  offline fallback, and generated `sw.js`.
- Output budgets: JS 26,913 B (9,953 B gzip), CSS 16,571 B (4,423 B gzip),
  and hero WebP 38,168 B — all within the static/PWA limits.
- Accessibility: the browser suite ran axe on logger, privacy, and terms in
  desktop and mobile with zero serious or critical violations; each page has
  one h1. The mobile check passed with no horizontal overflow.
- Privacy: a fresh normal-use browser load made no requests outside the app
  origin. The app has no analytics, runtime CDN, or third-party fonts; workout
  data remains local IndexedDB.
- Offline: after service-worker control, the suite reloaded while offline,
  showed `Offline · logging still works`, and logged a set locally.
- Update: a controlled changed `/sw.js` response on the repaired production
  build changed the in-app update toast from hidden to visible while the page
  remained service-worker controlled (`waiting=false`, `controlled=true`).
- Static-host policy: `public/staticwebapp.config.json` parsed successfully in
  the built `dist/` output. It supplies the verifier-requested CSP,
  clickjacking, Permissions-Policy, and hashed-asset cache directives.

## Deployment / response-policy note

This remains a static Vite PWA. The factory deployed the generated `dist/`
directory with `/opt/fleet/lib/deploy-static.sh`; Azure reported deployment
`2414df82-66b5-406e-b9d7-3416c99b9d8a` successful and the custom domain HTTPS
endpoint returned 200. The included Azure Static Web
Apps policy adds an enforcing self-only CSP (the billing API is the sole
allowed connection), `frame-ancestors 'none'` plus `X-Frame-Options: DENY`, a
restrictive Permissions-Policy, and one-year immutable caching for `/assets/*`.
This resolves the verifier's P2 source/deployment-policy finding.

Live identity and policy checks passed. The live `index.html` selected
`assets/index-DQG_8wmy.js`, matching the deployed build, and both live
`index.html` and `sw.js` had the same SHA-256 as `dist/`. The live document
returned the CSP, `X-Frame-Options: DENY`, the restrictive Permissions-Policy,
HSTS, nosniff, and Referrer-Policy; the hashed JavaScript returned
`Cache-Control: public, max-age=31536000, immutable`. The factory
`verify-url.sh` smoke check reported 690 ms load time, no browser errors, a
title/lang/main, one h1, no images missing alt text, and no unlabeled buttons.
Lighthouse 13 mobile against the live URL scored Performance 99, Accessibility
100, Best Practices 100, and SEO 100 (LCP 1,205 ms, CLS 0, TBT 94 ms).
Fresh live desktop and 390 px browser runs both retained `Squat`, kept focus on
Weight × reps, saved two rows without an error, had zero overflow and console
errors, and made requests only to `https://lift-receipt-log.sociobot.in`.

## How to run

```sh
npm ci
npm test
npm run build
npm run preview
```

No product gaps remain from the verifier's release-blocking P1 or its P2
response-policy/cache finding.
