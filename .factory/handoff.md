# Set Receipt — repair-3 handoff

## Status: repaired, deployed, and ready for retest

**Work order:** `lift-receipt-log-repair-3`
**Verifier report / base:** `1230452ba9b678c2aa014da0ff8a408ced586124` / `.factory/verification-3.md`
**Repaired application commit:** `2adf0fd fix production PWA install and PR contrast`
**Deployment:** Azure Static Web Apps production deployment `8b5799bb-e40c-4d11-8197-a0fc11e1066f`
**Live URL:** https://lift-receipt-log.sociobot.in

## Repairs

1. **Production service-worker install:** `scripts/build-sw.mjs` now excludes
   `/staticwebapp.config.json` from the app-shell precache. Azure consumes this
   file as deployment configuration and returns 404 when it is requested as a
   public asset; including it made `cache.addAll()` reject and discarded the
   worker. The test preview server now returns the same 404, and the browser
   regression asserts the installed worker controls the page before exercising
   offline reload and an offline set entry.
2. **PR contrast:** the 11 px PR stamp now uses a dedicated `--pr` token:
   `#B42318` on the light receipt paper (6.45:1) and `#FF6842` on the dark
   sheet (5.26:1). The dark signal token was also corrected to the visual
   thesis's `#FF6842`; it removes the newly exposed 3.93:1 dark wordmark and
   Log-button failures. `.factory/design.md` records the semantic token and
   contrast purpose.

No brief behavior, data model, local-first storage, licensing, receipt flow,
or deployment class changed.

## Regression coverage and verification (2026-08-28 UTC)

```sh
npm ci
npm audit --omit=dev
npm test
npm run build
```

- Clean install: **58 packages**; `npm audit --omit=dev`: **0 vulnerabilities**.
- Unit/integration: Vitest **7/7 passed**. Browser suite: Playwright **19
  passed, 1 expected mobile-only skip, 0 failed** at configured desktop and
  390 × 844 mobile viewports.
- The new exact PWA regression runs against a server that returns **404** for
  `/staticwebapp.config.json`; it requires `navigator.serviceWorker.ready`, a
  controller after reload, offline reload, and offline set logging. The existing
  changed-worker test continues to prove a waiting worker exposes the
  user-controlled **Refresh** toast.
- The new stateful Axe regression logs `dl` / `315x3` and scans the visible PR
  in **light and dark** schemes in both browser projects. It reports no serious
  or critical violation. Existing tests continue to cover keyboard logging,
  recovery, aliases, import, receipt persistence, legal pages, mobile overflow,
  and the service-worker update flow.
- `npm run build` passed type checking and emitted `dist/`: JS **27.41 kB**
  (**10.14 kB gzip**), CSS **16.59 kB** (**4.43 kB gzip**), and the prior
  38,168 B hero WebP—within the static/PWA budgets. The generated `dist/sw.js`
  was inspected to confirm the host configuration URL is absent from `PRECACHE`.
- Local response-policy source validation parses `public/staticwebapp.config.json`.
  Source/privacy review confirms no analytics, tracking, CDN fonts, or runtime
  third-party script. Normal logging uses IndexedDB; the only optional external
  call remains the permitted Sociobot license API.

## Production evidence

- Fresh production smoke (`verify-url.sh`) returned **200** in **2,832 ms** with
  no console/page errors; title and `lang=en` are present, there is exactly one
  h1 and a main landmark, and there are no missing image alts or unlabeled
  buttons.
- Azure correctly returns **404 text/html** for
  `/staticwebapp.config.json`. A fresh Playwright 390 px dark context still had
  a controlled worker, logged a visible PR, reported **0** serious/critical Axe
  findings, **0 px** horizontal overflow, and no console/page errors. The
  local Azure-faithful test covers the resulting desktop offline reload/logging
  path and changed-worker update interaction.
- Live headers include CSP restricted to self plus the permitted licensing API,
  HSTS, `X-Frame-Options: DENY`, `nosniff`, strict-origin referrer policy, and a
  restrictive Permissions-Policy. The live hashed JS remains immutable-cached.
- Deployed identity exactly matches local `dist/`: `index.html`
  `7bdf0b79312d5b0fdcf7b6a717f4d28a486a679c49065529f08e507d1124e3ab`,
  `sw.js` `268368343b9c22dde6b7fea4350443796e50526bf8e27a71dbf1f51172721f09`,
  and `assets/index-yzPkT0rD.js`
  `2eabcd3a07c1cfa10d6a5fca3aadb337f00999fc3dab65154915386667726433`.
- Live Lighthouse 13.4.1 mobile navigation: **100 Performance, 100
  Accessibility, 100 Best Practices, 100 SEO**; LCP **1,210 ms**, CLS **0**,
  TBT **65.5 ms**.

## How to run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh lift-receipt-log dist
```

No release-blocking gaps are known. The product remains a static, offline PWA
with deployable output at `dist/index.html`.
