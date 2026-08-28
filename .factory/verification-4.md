# Independent verification 4 — FAIL

**Work order:** `lift-receipt-log-verify-4`
**Candidate tested:** `01f2a4901b9aa41063aa84c047d3d4974f416fa7`
**Verified:** 2026-08-28 UTC
**Production URL:** https://lift-receipt-log.sociobot.in

## Verdict

**FAIL.** The live deployment is byte-for-byte the requested candidate, and the
previous production service-worker and PR-contrast blockers are repaired. Core
logging, receipts, exports/imports, offline persistence, the update flow,
response policy, privacy-by-default network behavior, Axe scans, and performance
budgets pass. Three P2 defects remain in explicit acceptance areas:

1. **“Erase all local data” does not erase settings**, despite its confirmation
   promising that it will.
2. **An old error masks later successful actions.** After a malformed import,
   successful export, finish, and share actions continue to announce the stale
   import error instead of their success.
3. **Required touch-target sizing and spacing fail at 390 px.** Several links
   and the update action are shorter than 44 px, and primary navigation targets
   are separated by only 2 px rather than 8 px.

No product code was modified by this verifier.

## Defects

### P2 — “Erase all local data” retains user settings

Freshly reproduced on the live deployment:

1. Open **Setup**, change the default unit to **Kilograms (kg)** and the rest
   clock to **3 minutes**.
2. Choose **Erase all local data** and accept the confirmation, which says it
   will erase workouts, aliases, and settings.
3. Return to **Setup**.

The unit is still `kg` and the rest value is still `180`. Workouts and custom
aliases are cleared, but settings are retained. This makes the destructive
control and its confirmation materially inaccurate. Reset settings to defaults
or narrow both the button and confirmation copy to what is actually erased.

### P2 — stale errors override successful recovery feedback

Freshly reproduced locally and on production:

1. Log `sq` / `225x5`.
2. In **Setup**, import malformed JSON such as `{bad`; the helpful invalid-JSON
   message appears.
3. Choose **Export JSON**. A valid download is produced, but the toast still
   says the file is invalid instead of `JSON backup exported.`
4. Return to **Log** and finish the workout. The receipt is filed, but the same
   stale import error remains. In the local extended flow, **Share receipt**
   copied successfully but still displayed the stale error as well.

The global renderer prefers `error` over `status`, while these successful action
paths do not clear `error`. Clear obsolete errors when a new action begins or
succeeds, and add a regression that performs a successful action after an
invalid import/alias input.

### P2 — mobile and update controls miss the touch-target contract

Computed boxes on the live 390 × 844 page were:

- Home wordmark: **50 × 40 px**.
- Footer Privacy link: **42.625 × 19.5 px**.
- Footer Terms link: **35.391 × 19.5 px**.
- Changed-worker **Refresh** action: **73.578 × 36 px** (measured in the
  candidate update state; the same rule applies responsively).
- Header Log/Receipts/Setup controls are each 48 px high, but their computed
  gaps are only **2 px**.

The supplied accessibility/design contract requires every target to be at least
44 × 44 CSS px and adjacent targets to be at least 8 px apart. Expand the
clickable link/action boxes and mobile navigation gaps, then test target geometry
in normal, error/undo, update, settings, and legal states.

## Clean checkout and repository gates

- Began with a clean `main...origin/main` checkout at exactly
  `01f2a4901b9aa41063aa84c047d3d4974f416fa7`.
- `npm ci`: 58 packages installed; `npm audit --omit=dev`: **0
  vulnerabilities**.
- `npm test`: Vitest **7/7 passed**; Playwright **19 passed, 1 intentional
  desktop skip, 0 failed**. The skip is the mobile-only overflow assertion.
- `npm run build`: passed `tsc --noEmit`, Vite production compilation, and
  service-worker generation; `dist/` was produced. There is no separate lint
  script in the repository.
- Production sizes: JS **27,410 B / 10.14 kB gzip**, CSS **16,591 B / 4.43 kB
  gzip**, hero WebP **38,168 B**. Initial JS, CSS, font (none), and image budgets
  pass.

## Independent product exercise

- Keyboard logging retained `Squat` and expression focus across consecutive
  `225x5` entries. Missing exercise, `225`, `0x5`, `2000.01x5`, `1x0`,
  `1x1000`, and `abc` produced recoverable errors without losing the resolved
  exercise.
- Accepted the upper boundary `2000x999`, explicit-unit `100x8kg`, and spaced
  multiplication-sign form `135 × 10`. Four sets produced the correct
  **2,001,050** volume and **3** PRs.
- Remove/Undo restored a set. The rest clock started automatically and could be
  paused. A mocked valid Sociobot license exercised custom-rest boundaries of
  **15** and **900** seconds.
- JSON (1,800 B) and CSV (471 B) exports had the expected records/header. A
  valid JSON re-import restored four sets and the custom `rdl` alias. A finished
  receipt exposed no set-edit controls, survived reload, and appeared in receipt
  history.
- License capture stripped `?license=qa-token` from the URL, stored the expected
  local key, called only the documented Sociobot verification endpoint once,
  cached the valid verdict across reload, and exposed the correct hosted checkout
  URL. No real purchase was attempted.

## PWA and offline evidence

- In fresh local and live contexts, there was **1** registration, an
  `activated` worker, and a controlling worker after reload.
- The live host correctly returns 404 for `/staticwebapp.config.json`; the
  generated precache no longer includes it. Offline reload then displayed
  `Offline · logging still works`, accepted `Deadlift` / `315x3`, and retained
  that set across another offline reload with no console or page errors.
- An independently forced changed worker on the exact local production artifact
  reached `installed`/waiting state, exposed **Update ready / Refresh**, and the
  user action activated the worker and reloaded under service-worker control.
- Chrome parsed the live manifest with **0 manifest errors**. It has a versioned
  start URL, standalone display, matching theme/background colors, and verified
  192 × 192 and 512 × 512 PNG icons; the 512 icon is maskable.

## Accessibility and responsive evidence

- Live `/`, `/privacy`, and `/terms` were scanned with Axe 4.10 in light and dark
  schemes at desktop and 390 px: **0 serious/critical findings in all 12
  combinations**. Logged PR states also had 0 serious/critical findings locally
  in light/dark and live at 390 px.
- Each tested screen had `lang=en`, a title, one h1, and a main landmark; images
  had alt text and buttons had accessible names. Body text is 16 px.
- Keyboard-only smoke reached the visible skip link first with a 4 px blue focus
  outline. Activating it bypassed header navigation: the next Tab reached the
  Exercise field. Set entry and submission worked with the keyboard.
- Reduced-motion emulation reduced row animation and toast transition to
  `0.00001s`. The 390 px page had **0 px horizontal overflow**. Desktop and
  mobile empty/logged screenshots were visually inspected in both live and
  candidate runs. The target-size defect above remains despite otherwise clean
  Axe output.

## Privacy, requests, deployment identity, and policy

- Fresh local and live ordinary-logging sessions made requests only to their own
  origin. Source and runtime review found no analytics, tracking, CDN fonts, or
  third-party scripts. Workout data remained in IndexedDB; license data used the
  documented localStorage keys and optional Sociobot API only.
- `/opt/fleet/lib/verify-url.sh` passed the live URL: HTTP 200, load **1,119 ms**,
  zero console/page errors, title/lang/main present, one h1, no missing image alt,
  and no unlabeled button.
- Every published candidate artifact checked matched production byte-for-byte,
  including HTML, service worker, manifest, offline page, robots/sitemap, icons,
  CSS, JS, source map, and hero image. Representative SHA-256 values:
  `index.html` `7bdf0b79312d5b0fdcf7b6a717f4d28a486a679c49065529f08e507d1124e3ab`,
  `sw.js` `268368343b9c22dde6b7fea4350443796e50526bf8e27a71dbf1f51172721f09`,
  JS `2eabcd3a07c1cfa10d6a5fca3aadb337f00999fc3dab65154915386667726433`.
- Live HTML, legal routes, service worker, and assets carry enforcing CSP, HSTS,
  `X-Frame-Options: DENY`, `nosniff`, strict-origin referrer policy, and a
  restrictive Permissions-Policy. Hashed assets use one-year immutable caching;
  HTML and `sw.js` use 30-second revalidation.
- Lighthouse 13.4.1 live mobile: **96 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO**; FCP **987 ms**, LCP **1,203 ms**, CLS **0**, TBT
  **242.5 ms**, total transfer **69,752 B**. Required Lighthouse/LCP/CLS and
  bundle thresholds pass; lab TBT is not field INP.

Library/CLI packaging and backend concurrency/health/persistence checks are not
applicable to this static local-first PWA.

## Required retest

1. Reset settings (or correct the destructive copy) and verify the result after
   reload.
2. After every failure class, exercise export, import, finish, share, and other
   successes and assert the new success feedback replaces the old error.
3. At 390 px, measure all targets and adjacent gaps in logger, setup, legal,
   undo/error, and service-worker update states; require 44 × 44 px and 8 px.
4. Repeat live worker install/offline/update, stateful Axe, exact artifact hashes,
   response headers, and Lighthouse after deployment.
