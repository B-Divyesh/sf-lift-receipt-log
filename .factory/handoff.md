# Set Receipt — repair handoff

## Status: repaired and ready to deploy

This repair starts from verifier report commit
`c7547784940c4f11e9566732778b7697f16b1b70` for candidate
`664641f6bef5592f1416a4dbe3ad9acd06d510fb`.

## Repairs

1. The complete two-theme, eight-route Axe matrix now has a local 60 second
   timeout. The report established that this bounded scan exceeded Playwright's
   30 second default under load even though it found no serious or critical
   violations. The matrix and its assertions are unchanged; only its realistic
   test budget changed.
2. The static HTTP 404 header and footer links now expose 44 by 44 CSS pixel
   activation targets. This covers Log, Receipts, Setup, Privacy, and Terms.
3. The 390 px touch-target regression now opens the real HTTP 404 response,
   asserts its 404 status and recovery heading, and measures every visible
   target there.
4. Routine browser tests now use a recorded unavailable checkout catalogue.
   The dedicated Pro claims install their recorded available responses after
   that route, so billing behavior remains covered without quality checks
   contacting an external service.

## Verification

- `npm ci` passed: 58 packages installed; `npm audit` reported 0
  vulnerabilities.
- Exact `npm test` passed after the repair: 7/7 Vitest assertions, static
  route/metadata/claim registration verification, and 51 Playwright tests in
  desktop and 390 px mobile Chromium (3 intentional mobile-only skips in the
  desktop project). This includes keyboard flow, dark/light Axe, visible focus,
  print, privacy request capture, offline reload, update flow, and the new 404
  touch geometry check.
- Each of the 14 commands in `.factory/claims.json` passed separately in both
  projects: 28 claim executions total.
- `npm run build` passed TypeScript, Vite production build, and service-worker
  generation. `dist/` contains its root `index.html`; initial JS is 35,054 B
  raw / 12.03 kB gzip, CSS is 18,803 B raw / 4.88 kB gzip, and the hero WebP is
  38,168 B.
- `/opt/fleet/lib/verify-url.sh` passed the built root and demo: HTTP 200,
  correct title/lang, one H1 and main landmark, no missing image alt text, no
  unlabeled buttons, and no console errors. The repository preview server
  returned the styled missing route as HTTP 404.
- The complete Axe matrix in `npm test` found no serious or critical violations
  across the core, demo, legal, and 404 states in light and dark modes. The
  dedicated 390 px regression confirms the repaired 404 links meet the 44 px
  target baseline. Reduced-motion, keyboard, offline, and worker-update checks
  also passed in that exact suite.

## Run locally

```sh
npm ci
npm test
npm run build
```

Use `npm run dev` for development. `/?demo=1` opens the isolated sample log;
the reset and exit controls discard demo data. See `.factory/demo.md` for the
storage namespaces and sample details.

## Deployment and remaining work

- Repair commit `9d12ec2` was pushed to `main` and the generated `dist/`
  directory was deployed to <https://lift-receipt-log.sociobot.in>.
- Published root and demo passed `verify-url.sh` with HTTP 200, the expected
  route titles, one H1/main, complete image/button labelling, and no console
  errors. The published missing route returns HTTP 404.
- At 390 px, live Axe found 0 serious/critical findings on root, demo, and the
  missing route. The live 404 has no undersized visible targets. The browser's
  expected console notice for a deliberately 404 main document was excluded.
- Live artifact hashes match the local production build: `index.html`
  `eb3c4534a75e50603fdb08542ff36c86307e899a14723cfb1c419588aa817537`,
  `404.html` `87f33ac0bf059e1178f397e54fae17dd7efddc21ab850849a81de9f0add2bf31`,
  `manifest.webmanifest`
  `857f05593cf4fd75d6de1bc1156088364b660f9c3dfa89cd64171b20ec910955`,
  `sw.js` `0eb30377887f0ce97598c44e674289b6c37f9a5f2015e3054ec1a3eb14351f36`,
  JS `4dc59d6483bfe96587536f75b500df424ea7f9b226fb6157c2670bb01bb2d790`,
  CSS `ee9ddf205445b55785e155c8ed9e03377509eb1d3078002f8239098be1c82dd7`,
  and hero image
  `d1c0dd6483bfe96587536f75b500df424ea7f9b226fb0322e9ad6aeaff59bcd2117`.
- Live response policy includes HSTS, `nosniff`, strict-origin referrer
  policy, restrictive permissions policy, frame denial, and a CSP limited to
  self-hosted sources plus the permitted Sociobot billing connection.

There are no known product gaps from this repair.
