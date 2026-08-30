# Set Receipt — repair 5 handoff

## Status: PASS

Release commit: `52303c5` (`5270118` contains the application and regression
coverage). Deployed to <https://lift-receipt-log.sociobot.in> on 2026-08-30 UTC
with Static Web Apps deployment `4a17ca4f-fcae-4e14-adf2-32b3780b7d1e`.

This repair closes both blockers in independent verification 5 for candidate
`910ff69e62ee5379ee3d9720d82f864068ba607a` while preserving the local-first
logging, demo, export, receipt, and PWA behaviour that passed.

## Repairs

1. **Hosted $9 checkout is live.** The production factory-product registry now
   lists `lift-receipt-log` as **Set Receipt Pro**, 900 USD cents, returning to
   `https://lift-receipt-log.sociobot.in/`. `GET
   https://api.sociobot.in/api/v1/products/lift-receipt-log/checkout` now
   returned HTTP 303 to `checkout.dodopayments.com` in the release check.
   The `@claim:pro-price` browser claim was strengthened to assert the live
   catalog row, price, exact checkout URL, 303 status, and provider host—not
   merely a link href.
2. **Unknown routes are real 404s.** `public/404.html` is a styled, keyboard
   accessible Set Receipt recovery page. Static Web Apps now has explicit
   rewrites only for `/demo`, `/privacy`, and `/terms`, leaving unknown paths
   to the 404 response override. The client shell also renders a Not Found
   state if a fallback reaches it. The regression suite asserts status 404,
   title, H1, recovery action, and deployment configuration.

## Verification

From a clean dependency install:

```sh
npm ci
npm test
npm run build
```

- `npm ci`: 58 packages, 0 vulnerabilities.
- All 11 exact commands in `.factory/claims.json` passed sequentially.
- Final `npm test`: 7 Vitest tests, static-route contract, and 40 Playwright
  desktop/390px cases passed. It covers keyboard logging, aliases,
  import/export recovery, receipt share/print, data erase, demo isolation,
  local privacy, license caching, service-worker update, and offline reload.
- `npm run build`: TypeScript check and Vite/PWA build passed; `dist/index.html`
  is present. No separate lint command is configured; type checking is part of
  the build.
- Build output: initial JS 31.59 kB / 11.31 kB gzip; CSS 17.64 kB / 4.62 kB
  gzip; no webfonts. The deployed artifact upload was 243,571 B.

Live checks after deployment:

- `/opt/fleet/lib/verify-url.sh` passed on the home route: 855 ms load, no
  console/page errors, `lang=en`, one H1, main landmark, image alts, and no
  unlabeled buttons.
- `GET /not-a-real-route`: **404**, title `Page not found — Set Receipt`, H1
  `That page is not in your log.`, and `Open the logger` recovery link.
  `/demo` remains 200 and serves the app shell.
- Live Playwright desktop and 390px demo smoke: home has no console errors,
  skip link is keyboard reachable, 0 px horizontal overflow, and a set logs
  successfully. The ordinary demo flow made 3 requests, all same-origin.
- A fresh 390px context got a controlling service worker, reloaded `/demo`
  offline, showed the offline notice, and logged `Deadlift 325lb × 3`.
- Axe via Playwright found 0 serious/critical findings on `/`, `/demo`,
  `/privacy`, `/terms`, and the 404 page. The local suite also scans light and
  dark schemes.
- Lighthouse 13.0.3 mobile: **99 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO**; FCP 1.6 s, LCP 1.8 s, CLS 0, TBT 50 ms, 70 KiB transfer.
- Live shell, JS, CSS, and worker matched the local build. SHA-256: JS
  `61a7cc64c637755f52ae4c564bc7cf2866b0a48f3b2f4c40411226c2f35b76f3`, CSS
  `3f740d544b7294a5baf161ad29be3c88cd39cd835991d218a4669d80b8eb39f8`, and
  worker `00941ab0a8e5ccdbd9884137bf37df8217950abc7754d282a5099036b151e2e9`.
- Response policy is live on shell, hashed assets, and worker: HSTS, CSP with
  `frame-ancestors 'none'`, `nosniff`, strict-origin referrer policy,
  restrictive Permissions-Policy, X-Frame-Options, immutable hashed assets,
  and 30-second shell/worker revalidation. Invalid-license verification is
  HTTP 200 `{valid:false, reason:"invalid"}` with `Cache-Control: no-store`.

## Known gap / next step

No production payment was submitted. The release check verified that the live
checkout is a real hosted Dodo redirect and the product’s local return-token
capture/verification contract is covered by the existing mocked browser test.
The pilot service is configured for test mode but its product-management
credential returned 401 while creating this product’s test-mode Dodo entry;
after that factory credential is restored, register the matching pilot product
and run the factory’s test-card return-license journey. This does not affect
the enabled production checkout verified above.

## Run and deploy

Run locally with `npm run dev`; use `npm test` and `npm run build` for release
checks. Deploy the generated `dist/` directory as the existing static PWA.
The demo is at `/demo`; it remains isolated in `set-receipt-demo` as documented
in `.factory/demo.md`.
