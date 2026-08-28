# Set Receipt — repair handoff

## Status: repaired and ready for static deployment

**Work order:** `lift-receipt-log-repair-1`
**Verifier base:** `80dd072e30d584627b59952e504115ac86b6c396`
**Verifier report commit:** `ebfab4e9c7815ad12367d45e8ca7ac73d8fef913`
**Functional repair commit:** `e5b63308e6bca28a73f28f2fefb6ac4fd3733c44`

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

## Deployment / response-policy note

This remains a static Vite PWA; deploy the generated `dist/` directory with
the factory's static deployment configuration. The verifier's P2 CSP,
frame-ancestors/clickjacking, Permissions-Policy, and immutable hashed-asset
cache finding is host configuration, not represented in this repository. Per
the repository contract, infrastructure is factory-owned and was not altered
here. It should be applied by the static host, then checked on the live URL
alongside the deployed commit identity.

## How to run

```sh
npm ci
npm test
npm run build
npm run preview
```

No product gaps remain from the verifier's release-blocking P1. The external
host response-policy/cache configuration above is the only deployment follow-up.
