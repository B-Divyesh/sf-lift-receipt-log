# Independent verification 2 — FAIL

**Work order:** `lift-receipt-log-verify-2`  
**Candidate tested:** `ffb0813a3f3d828efe454647f1614e1af7bfaf50`  
**Verified:** 2026-08-28 UTC  
**Production URL:** https://lift-receipt-log.sociobot.in

## Verdict

**FAIL.** The production deployment is byte-for-byte the requested candidate;
the previous repeat-set blocker is repaired, and local quality gates, offline
logging, accessibility, response policy, and budgets pass. Two P2 defects
remain in required recovery/update paths:

1. A malformed set clears the active exercise. Correcting just the expression
   then fails with `Choose or type an exercise first.` This makes an ordinary
   typo require re-entering the exercise and violates the fast, keyboard-first
   recovery flow.
2. A changed service worker activates, but the advertised in-app update toast
   stays hidden. `skipWaiting()` means the update never reaches
   `registration.waiting`, which is the only condition that displays the toast.

No product code was modified by this verifier.

## Defects

### P2 — invalid set entry destroys the exercise context

Reproduced on the exact local production build and the live URL, on desktop and
390 x 844 mobile:

1. Type `sq`, then `225x5`; press Enter twice. Both sets save; Exercise is
   retained as `Squat` and focus remains in Weight x reps.
2. Enter `2000.01x5`; the app correctly says `Weight must be between 0 and
   2,000.` and focus remains in Weight x reps, but Exercise has become empty.
3. Correct only the expression to `225x5` and press Enter. No row is added;
   the error changes to `Choose or type an exercise first.`

The brief's target is faster-than-notebook one-line entry. Invalid-input
recovery is part of that interaction; retyping a valid exercise after a typo
is unnecessary friction. Preserve the resolved/current exercise when rendering
after a parser error, and add a desktop + mobile regression test for correction
without touching Exercise.

### P2 — service-worker update notice is unreachable

Using a controlled browser with the exact built `sw.js`, I supplied a changed
worker response and called `registration.update()`. Before the change the page
was controlled, `waiting=false`, and `#update-toast[hidden]` was true. After
the changed worker installed and activated: `controller=true`, `active=activated`,
`waiting=false`, and the toast was still hidden. The source calls
`self.skipWaiting()` during install but only shows the toast when
`registration.waiting` exists, so that condition cannot represent this update.

This fails the PWA contract's in-app “update available” feedback. Use a
coherent update policy: either allow a waiting worker and show a user-triggered
Refresh/skip-waiting prompt, or detect `controllerchange` and give explicit
feedback/reload behavior. Add an automated changed-worker test that asserts
the user-visible result, not merely activation.

### P3 — malformed JSON import exposes a raw parser exception

Importing `{bad` leaves the page usable but displays the engine text
`Expected property name or '}' in JSON at position 1 (line 1 column 2)` rather
than a product error explaining that the selected file is not valid JSON and
what to do next. Wrap JSON parsing with a clear recovery message.

## Fresh evidence

### Clean checkout and repository gates

- Started at a clean `main...origin/main` checkout at exactly the candidate.
- `npm ci` installed 58 packages; `npm audit --omit=dev` reported **0
  vulnerabilities**.
- `npm test` passed: Vitest **7/7**; Playwright **11 passed, 1 expected skip,
  0 failed**. The skip is the desktop instance of the explicitly mobile-only
  overflow assertion.
- `npm run build` passed (`tsc --noEmit`, Vite production build, service-worker
  generation) and produced `dist/`. No separate lint script exists.
- Production output: JS **26,913 B** (**9,953 B gzip**), CSS **16,571 B**
  (**4,423 B gzip**), hero WebP **38,168 B**. Each is within the stated PWA
  budget.

### Product exercise

- On desktop and 390 px mobile, `sq` + `225x5`, Enter, then `225x5`, Enter
  created two Squat rows with the canonical Exercise retained and keyboard
  focus in Weight x reps.
- Grammar accepted `2000x999`, `100x8kg`, and `135 x 10`. Range and grammar
  validation was exercised for `2000.01x5`, `1x1000`, and `abc`; the P2 above
  is the recovery failure discovered during this check.
- Editable aliases, JSON and CSV downloads, finish-to-receipt, receipt totals,
  and receipt history were exercised. Export remains available without Pro.
- After service-worker control, a 390 px context was taken offline, reloaded,
  showed `Offline · logging still works`, and saved `Deadlift` / `315x3` with
  no console or page errors.
- Reduced motion was emulated: the inserted-row animation and toast transition
  both computed to **0.01 ms**. Keyboard focus begins at the Skip link and has
  a visible solid 4 px blue outline. Mobile horizontal overflow was **0 px**.

### Accessibility, privacy, and performance

- Fresh Axe scans of `/`, `/privacy`, and `/terms` at desktop and 390 px found
  **0 serious/critical** violations; every screen had one `h1`.
- Fresh normal-use live desktop and mobile sessions had **0 console errors, 0
  page errors, 0 external requests**, and 0 px horizontal overflow. Data is
  held in IndexedDB; no runtime font/CDN/analytics request occurred. The only
  compiled external application endpoint is the optional Sociobot billing API.
- Live Lighthouse 13.4.1 mobile: Performance **99**, Accessibility **100**,
  Best Practices **100**, SEO **100**; LCP **1,295 ms**, CLS **0**, TBT
  **102 ms**.

### Deployment identity and policies

- SHA-256 values of live and locally built `index.html`, `sw.js`, manifest,
  hashed JS, hashed CSS, and hero WebP matched exactly. The live document
  selects `assets/index-DQG_8wmy.js`, the candidate bundle.
- Live headers include enforcing self-only CSP (with the billing API permitted
  for `connect-src`), `X-Frame-Options: DENY`, restrictive
  Permissions-Policy, HSTS, `nosniff`, and Referrer-Policy. The hashed JS is
  `Cache-Control: public, max-age=31536000, immutable`; document and service
  worker use 30-second revalidation, which is appropriate for update checks.
- The manifest has standalone display, a versioned start URL, explicit matching
  splash colours, and 192/512 maskable icons.

## Retest

```sh
npm ci
npm test
npm run build
```

Retest the two P2 scenarios on the live URL at desktop and 390 px: correct an
invalid weight without editing Exercise, and force a changed `/sw.js` response
to assert a visible, actionable update outcome. Then repeat the offline reload
and Axe scans.
