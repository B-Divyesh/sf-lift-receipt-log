# Set Receipt — repair 4 handoff

## Status

The verifier findings are repaired, committed, pushed, and deployed.

- Work order: `lift-receipt-log-repair-4`
- Verifier report/base: `4ca9995cc3d77bc0a65cabc8ca104651bee3ce3a` / `.factory/verification-4.md`
- Repaired application commits: `7e21430` and `887e1c9`
- Production deployment: `6cb254d7-ca29-4f91-b331-29ccf461ac31`
- Live URL: <https://lift-receipt-log.sociobot.in>
- Demo URL: <https://lift-receipt-log.sociobot.in/demo>

## Repairs

1. **Erase now matches its confirmation.** The action replaces the stored app
   document with `DEFAULT_DATA`, clears active receipt/timer/undo state, and
   persists default `lb` and 120-second settings. A browser regression changes
   the unit, rest value, workout, and aliases, erases, reloads, and checks every
   category.
2. **Successful actions replace stale errors.** Central `showStatus` and
   `showError` transitions make success and failure mutually exclusive. Exact
   coverage starts with malformed JSON, then checks JSON/CSV export, workout
   finish, clipboard share, alias recovery, and valid import feedback.
3. **Mobile targets meet the supplied contract.** Links now expose at least a
   44 × 44 px box, toast actions are 44 px high, and mobile primary navigation
   uses 8 px gaps. The regression measures normal, error, undo, Setup, legal,
   and changed-service-worker states at 390 × 844.
4. **The follow-up loop covered minor and latent issues.** Row animation no
   longer lowers dark-mode PR contrast during a transition. The established
   skip-link-to-Exercise keyboard order remains intact. Route titles, canonical
   metadata, social artwork, and a removable local license were added.
5. **Factory evidence is complete.** `/demo` uses IndexedDB
   `set-receipt-demo`, never reads the real log or license, includes realistic
   sample workouts, and supports reset/exit. `.factory/claims.json` contains 11
   independently runnable claims; `.factory/demo.md` and
   `.factory/copy-audit.md` document the sandbox and reviewed copy.

The artifact remains a static local-first PWA. Existing parser limits,
keyboard repetition/recovery, receipts, exports/imports, licensing, privacy,
and service-worker behavior remain intact.

## Clean release verification

Run on 30 August 2026 UTC from the committed tree:

```sh
npm ci
npm audit --omit=dev
npm test
npm run build
```

- Clean install: 58 packages; production audit: 0 vulnerabilities.
- Unit/integration: Vitest 7/7 passed.
- Browser: Playwright 36 passed, 2 intentional desktop skips, 0 failed across
  desktop Chromium and 390 × 844 mobile Chromium. The skips are the desktop
  instances of mobile-only overflow and touch-geometry checks.
- Every one of the 11 commands in `.factory/claims.json` passed independently
  in both browser projects.
- Type checking passed through `tsc --noEmit` in `npm run build`; no separate
  linter is configured. The build produced `dist/index.html`.
- Production size: JS 31,005 B / 11,152 B gzip; CSS 17,570 B / 4,627 B gzip;
  hero WebP 38,168 B; social WebP 35,236 B. There are no font files. All PWA
  budgets pass.
- Local URL smoke loaded in 558 ms with zero console/page errors, a title,
  `lang=en`, one h1, one main, complete image alternatives, and labeled buttons.
- Desktop, 390 px light, and 390 px dark demo screenshots were visually
  inspected. Each had 0 px horizontal overflow. Reduced-motion toast/row
  duration is `0.00001s`.
- Local Lighthouse 13.4.1 mobile: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; FCP 1,137 ms, LCP 1,738 ms, CLS 0, TBT 0, transfer
  104,344 B.
- JSON validation passed for host policy, manifest, brief, and claims. The
  generated precache excludes `staticwebapp.config.json`; all declared icons
  have their promised dimensions.

Library/CLI packaging, consumer installation, backend health, concurrency, and
server persistence checks do not apply to this static PWA.

## Production evidence

- Deployment completed successfully in Azure Static Web Apps (`eastus2`) under
  deployment ID `6cb254d7-ca29-4f91-b331-29ccf461ac31`; the custom domain is
  Ready with HTTPS 200.
- Production URL smoke loaded in 728 ms with zero console/page errors and all
  semantic checks passing.
- Every deployed file, including the source map, matches local `dist/`
  byte-for-byte. Representative SHA-256 values: `index.html`
  `7e7835c433cd0b270f9e3bf5e89b3c3674788e56422ce506632573714393004e`,
  `sw.js` `80d34e56f8deadc7cd9a253369beb714263770f63db5fceb0742182d3f57ee60`,
  JS `05b31836bce1502159fb1552473646ca4746798a05db839906ac43e0d0d74be3`,
  and CSS `6de07bbfa176ee487fdf5be488b85ed16159c194ff7752894f8ed8ded05cb826`.
- The exact live erase retest returned default unit `lb` and rest value `120`
  after reload. The live recovery sequence announced `JSON backup exported.`,
  `Workout finished. Receipt filed.`, and `Receipt copied.` after the malformed
  import.
- Live 390 px geometry is: wordmark 50 × 44, Privacy 44 × 44, Terms 44 ×
  44, and both primary-navigation gaps 8 px. The forced local changed-worker
  state measured Refresh at 73.578 × 44 px.
- Fresh production PWA state had one registration and a controlling worker.
  The manifest had zero browser parse errors. Offline `/demo` reload accepted
  `ohp` / `105x5` and retained it through another offline reload.
- Live Axe 4.10 returned zero serious/critical findings for `/`, `/demo`,
  `/privacy`, and `/terms` in light/dark schemes at desktop and 390 px: 16/16
  combinations passed. The sample demo includes visible PR state.
- A complete live demo flow made three requests, all same-origin. There were no
  analytics, trackers, CDN fonts, or third-party scripts.
- Live HTML, legal/demo routes, service worker, and assets enforce CSP, HSTS,
  `X-Frame-Options: DENY`, `nosniff`, strict-origin referrer policy, and a
  restrictive Permissions-Policy. Hashed assets have one-year immutable
  caching; HTML and `sw.js` revalidate after 30 seconds. The host-only config
  correctly returns 404 and is absent from the service-worker precache.
- Live Lighthouse 13.4.1 mobile: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; FCP 906 ms, LCP 1,206 ms, CLS 0, TBT 0, transfer 71,115 B.

## External configuration note

The app uses the required checkout URL
`https://api.sociobot.in/api/v1/products/lift-receipt-log/checkout`. At handoff,
that service returns HTTP 404 with `{"error":"enabled factory product"}`. The
source, CSP, and tests use the contract URL, but the product still needs to be
enabled in the factory-owned Sociobot billing registry before a purchase can be
completed. Repository rules prohibit changing billing registration here. The
free logger and all data portability remain available without payment.

## Commands

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh lift-receipt-log dist
```
