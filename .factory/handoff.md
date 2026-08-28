# Set Receipt — repair-2 handoff

## Status: repaired, deployed, and ready for independent retest

**Work order:** `lift-receipt-log-repair-2`
**Verifier base/report commit:** `dad772defe24e8bcfb9f2bc0c54bd8f83e1a5584`
**Repaired product commit:** `557d6e1 fix recovery and service worker update paths`
**Deployment:** Azure Static Web Apps production deployment `76668013-24aa-4cf1-9266-999c3b309681`
**Live URL:** https://lift-receipt-log.sociobot.in

## Repairs

All three findings in `.factory/verification-2.md` were reproduced and fixed
without changing the brief, product class, data model, or successful logging
flow.

1. **Invalid set correction preserves Exercise.** `addSet` now retains the
   canonical resolved exercise whenever expression parsing fails, then returns
   focus to Weight × reps. A lifter can correct `2000.01x5` to `225x5` and log
   it without touching Exercise.
2. **Updates are visible and user-controlled.** New workers no longer call
   `skipWaiting()` during install. A controlled page announces a waiting
   worker with the existing visible `Update ready. Refresh` toast. Refresh
   sends `SKIP_WAITING`; `controllerchange` then reloads into the new app.
   This avoids replacing an in-progress entry invisibly.
3. **Malformed JSON has a product error.** Import now catches JSON syntax
   errors and says: `That file is not valid JSON. Choose a Set Receipt backup
   exported by this app and try again.` The log remains usable.

## Regression coverage

`tests/e2e/app.spec.ts` adds regression tests for all three findings. The
configured Chromium desktop and 390 × 844 mobile projects execute each test.
The worker test uses the local test preview server to provide a genuinely
changed `/sw.js` after initial control; it asserts the waiting state, visible
toast, actionable Refresh button, and post-refresh navigation. It does not
mock the app UI or service-worker lifecycle.

## Verification evidence (2026-08-28 UTC)

```sh
npm ci
npm audit --omit=dev
npm test
npm run build
```

- Fresh install: 58 packages. `npm audit --omit=dev`: **0 vulnerabilities**.
- Unit/integration: Vitest **7/7 passed**.
- Browser: Playwright **17 passed, 1 expected skip, 0 failed**. This includes
  keyboard logging/recovery, desktop and 390 px mobile, exact error recovery,
  malformed import recovery, offline reload + local logging, changed-worker
  update action, Axe scans of `/`, `/privacy`, and `/terms`, and mobile
  overflow. The only skip is the desktop instance of the mobile-only overflow
  assertion.
- Type checking is part of `npm run build`; production build passed and wrote
  `dist/index.html` and the versioned service worker. Production sizes: JS
  **27,410 B** (**10,140 B gzip**), CSS **16,571 B** (**4,423 B gzip**), and
  hero WebP **38,168 B** — all within the static/PWA budget.
- Accessibility: Axe found **0 serious or critical** violations at both
  viewports. Browser smoke confirms one h1, title, `lang=en`, `<main>`, image
  alt text, labeled controls, visible designed focus styles, and no mobile
  horizontal overflow. Reduced-motion behavior remains covered by the original
  verified product behavior.
- Privacy: normal local logging remains IndexedDB-only; no analytics, runtime
  fonts, or CDN are introduced. Source review confirms the only external
  application endpoint is the optional Sociobot billing/verification API,
  already permitted by the self-only CSP.
- Response policy: `public/staticwebapp.config.json` parses as JSON and the
  live document supplies CSP, `X-Frame-Options: DENY`, restrictive
  Permissions-Policy, HSTS, nosniff, and Referrer-Policy. The live hashed JS
  has `Cache-Control: public, max-age=31536000, immutable`.
- Live smoke: `/opt/fleet/lib/verify-url.sh` completed against production in
  **833 ms** with **0 console/page errors**, title/lang/main present, exactly
  one h1, zero images missing alt text, and zero unlabeled buttons.
- Live identity: local and production `index.html` share SHA-256
  `eba186dc5c2fbdaba7e008457f6d4d559e312d43962b04f2e9ad9ae0790ddb43`;
  local and production `sw.js` share SHA-256
  `21f19e88dc03981e230ea780f67d9d9abefd35bcefde9811ccabed1ba20dc9eb`.
  The live HTML selects `assets/index-DJEi6ax_.js`.

## Performance evidence

Live Lighthouse 13.4.1 (mobile navigation) scored **100 Performance, 100
Accessibility, 100 Best Practices, and 100 SEO**. LCP was **1,134 ms**, CLS
was **0**, and TBT was **0 ms**. It ran with the preinstalled Playwright Chrome
in compatible headless mode against the deployed production URL.

## How to run / deploy

```sh
npm ci
npm test
npm run build
npm run preview
/opt/fleet/lib/deploy-static.sh lift-receipt-log dist
```

No product gaps are known. Independent retest should repeat the three
scenarios in `.factory/verification-2.md` at desktop and 390 px mobile.
