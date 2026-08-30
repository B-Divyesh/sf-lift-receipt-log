# Independent verification 5 — FAIL

**Work order:** `lift-receipt-log-verify-5`  
**Candidate:** `910ff69e62ee5379ee3d9720d82f864068ba607a`  
**Verified:** 2026-08-30 UTC  
**Live URL:** <https://lift-receipt-log.sociobot.in>

## Verdict

**FAIL.** The deployed static PWA is byte-for-byte the candidate and the free,
local-first lifting workflow is strong: it logs shorthand sets, uses aliases,
starts rest, creates a compact receipt, exports/imports data, works offline,
and passes the supplied accessibility and performance gates. Two release-blocking
contract defects remain: the advertised paid checkout is a live 404, and an
unknown URL is silently rendered as the logger rather than a real 404 page.

No product code was modified by this verifier.

## First-read test — PASS

In a cold desktop browser the first screen says **“Log the set. Keep the
proof.”**, then “For lifters who want to log a set as fast as a notebook.” It
names the job, the intended lifter, and presents **“Try it with sample data”**
with “Loads a separate sample log.” The action opened `/demo` in one click.
The first screen therefore satisfies the plain-words and demo-entry gate.

## Release-blocking defects

### P1 — The advertised $9 hosted checkout is unavailable

The visible Setup link **Buy Pro** points to the documented endpoint:

`https://api.sociobot.in/api/v1/products/lift-receipt-log/checkout`

On 2026-08-30 it returned **HTTP 404** with:

```json
{"error":"enabled factory product","status":404}
```

This prevents a customer from completing the advertised one-time $9 Pro
purchase. It contradicts the page/README claim that Pro is available “through
the hosted Sociobot checkout.” The claim test only asserts the displayed price
and href; it does not assert that the hosted checkout is available, so it does
not prove the visitor-facing claim as required by the claims contract.

Enable/register the production Sociobot product and retest the complete hosted
checkout and return-license flow before release. No payment was attempted.

### P2 — Unknown paths do not have the required 404 page

`GET /not-a-real-route` returned **200**, and a cold browser rendered the
normal logger with title `Set Receipt — fast, offline lift log` and H1 “Log the
set. Keep the proof.” There is no 404-specific page, status, title, or way
back. This fails the required site structure: a real, styled 404 route with a
way home.

Implement a 404 response override/page and have the SPA render a clear Not
Found state for unknown routes.

## Clean-checkout gates — PASS

- Started at exact commit `910ff69e62ee5379ee3d9720d82f864068ba607a`; the
  checkout was clean before documentation handoff edits.
- `npm ci`: passed; 58 packages installed; audit reported 0 vulnerabilities.
- All 11 exact commands listed in `.factory/claims.json` were run sequentially
  against the product’s Playwright demo entry point. The completed Playwright
  run record is `{"status":"passed","failedTests":[]}`. The individual
  keyboard-receipt and editable-aliases commands each reported 2/2 passed;
  the complete `npm test` run subsequently passed too.
- `npm test`: Vitest 7/7 passed and the 38 Playwright project cases completed
  with a passed final run record (the two desktop instances of mobile-only
  checks are intentional skips).
- `npm run build`: passed `tsc --noEmit`, Vite, and service-worker generation;
  it produced `dist/`. There is no configured lint script.
- Build sizes: initial JS **31,005 B / 11.15 kB gzip**; CSS **17,570 B /
  4.61 kB gzip**; hero WebP **38,168 B**; no font files. These meet the static
  PWA budgets.

## Product exercise — PASS for the free workflow

- On production, `sq` + `225x5` logged **Squat 225lb × 5**, marked a PR,
  started the rest clock, and **Finish workout** produced a receipt with 1 set,
  1,125 volume, duration, and PR count.
- `0x5` showed “Weight must be between 0 and 2,000.” and retained the resolved
  exercise `Squat` for correction. `2000x999` and `100x8kg` were accepted;
  over-weight, zero-rep, and malformed values returned recoverable validation
  messages. An `rdl` alias for Romanian deadlift was added and used.
- The demo banner says “Demo — sample data, nothing is saved to your log”, has
  Reset demo and Start for real, begins with three believable sample sets, and
  retained separation from the real IndexedDB namespace.
- The deployed Setup UI exposes both JSON and CSV exports; the full browser
  suite covers generated file contents, malformed-import recovery, valid
  import, copying a receipt, clean print output, erase/reset, and license
  cache behavior.

## Live PWA, privacy, accessibility, and performance — PASS

- A fresh 390 px context installed an activated, controlling worker at scope
  `/`, with versioned shell/runtime caches. After `context.setOffline(true)`,
  `/demo` reloaded, announced “OFFLINE · LOGGING STILL WORKS”, accepted
  `Deadlift` / `325x3`, and retained it through another offline reload.
  The local browser suite also passed its waiting-worker Update ready/Refresh
  flow.
- A full ordinary production flow made 12 requests, all same-origin; it had
  zero page errors and zero console errors. No analytics, tracking, CDN fonts,
  or third-party runtime requests were observed. The privacy policy accurately
  notes that a license verification is the exception.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 747 ms cold load, title,
  `lang=en`, exactly one H1, a main landmark, image alts, and no unlabeled
  buttons or console/page errors.
- Axe 4.10 via Playwright found **0 serious/critical** violations on `/`,
  `/demo`, `/privacy`, and `/terms` in light and dark schemes. Keyboard tests
  cover the skip link and keyboard logging; visible focus is a 4 px blue
  outline. At 390 px there was 0 px horizontal overflow. Reduced-motion row
  animation measured `0.00001s`.
- Lighthouse 13.4.1 mobile: **99 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO**; FCP 1.0 s, LCP 1.3 s, CLS 0, TBT 120 ms, 56 KiB transfer.
- Response policy is present on the live shell/assets: HSTS, CSP including
  `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, strict-origin
  referrer policy, and restrictive Permissions-Policy. Hashed JS/CSS has
  `public, max-age=31536000, immutable`; shell and worker revalidate in 30 s.
- Production hashes exactly match the candidate build for `index.html`, JS,
  CSS, `sw.js`, and the manifest. For example, live and local JS SHA-256 are
  both `05b31836bce1502159fb1552473646ca4746798a05db839906ac43e0d0d74be3`.

## Server endpoint allowance — PASS

The only product server call is the optional Sociobot license API. Invalid
license verification returned its documented JSON (`valid:false`,
`reason:"invalid"`). From one client, 30 sequential verification requests
succeeded; the 31st returned **429 Too Many Requests** with
`Retry-After: 3` (and `x-ratelimit-after: 3`). The observed allowance is
therefore 30 requests in the active window, followed by a three-second retry.

## Retest required

1. Enable the production Sociobot checkout, then test real checkout redirect,
   return `?license=...`, local capture, daily verification, and failure copy.
2. Add and deploy a real 404 response/page; verify an unknown URL has the
   expected status, title, heading, and home action.
3. Re-run all claim commands, `npm test`, build, live privacy/offline/Axe,
   hash comparison, and Lighthouse after deployment.
