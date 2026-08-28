# Independent verification — FAIL

**Work order:** `lift-receipt-log-verify-1`  
**Candidate:** `80dd072e30d584627b59952e504115ac86b6c396`  
**Verified:** 2026-08-27 UTC  
**Deployment:** https://lift-receipt-log.sociobot.in

## Verdict

**FAIL.** The deployment is the candidate and the PWA, accessibility, offline,
and build checks are broadly sound. However, the central repeat-set interaction
does not meet the brief: after every successful entry the app clears the
Exercise field while putting keyboard focus in Weight × reps. Enter on the
next set therefore produces `Choose or type an exercise first.` A lifter must
re-enter or navigate back to the exercise on every set, directly defeating the
keyboard-first, notebook-speed job-to-be-done.

No product code was changed during this verification.

## Blocking defect

### P1 — repeated sets cannot be entered at notebook speed

**Reproduced locally and on the production URL, desktop and 390 px mobile.**

1. Enter `sq` / `225x5` and press Enter.
2. The row is saved and focus is moved to `#set-expression` as intended.
3. Inspecting the new form gives `{ exercise: "", focused: "set-expression" }`.
4. Type the next expression and press Enter: the app rejects it with `Choose
   or type an exercise first.`

This is not merely a retained-field preference: the brief's core user needs to
record each set faster than a notebook. Clearing the required preceding field
on every submit makes sequential sets error by default. The existing e2e test
only enters one set, so it does not detect the regression.

**Required resolution:** retain the current exercise (or otherwise make a
same-exercise next set unambiguous) after a successful log, and add a keyboard
regression test for two consecutive sets of one exercise.

## Other defects and deployment findings

### P2 — missing browser hardening and inefficient immutable-asset caching

The live response includes HSTS, `nosniff`, and Referrer-Policy, but has no
enforcing `Content-Security-Policy`, no clickjacking policy, and no
Permissions-Policy. Lighthouse's informational CSP audit reports `No CSP found
in enforcement mode` (High). The hashed production JS and CSS are both served
with `cache-control: public, must-revalidate, max-age=30`, rather than a long
immutable lifetime; the PWA precache limits impact after installation, but
ordinary revisits still revalidate static assets every 30 seconds.

These are host/deployment configuration items, not source-code changes made by
this verifier.

## Evidence: clean checkout and quality gates

- Started at a clean `main...origin/main` worktree at exactly the candidate
  SHA. `npm ci` installed 58 packages and reported 0 vulnerabilities.
- `npm test` passed. Unit: **7/7**. Playwright JSON report: **9 expected
  passed, 1 intentionally skipped, 0 unexpected** across desktop and mobile.
- `npm run build` (the exact deployment command) passed, including
  `tsc --noEmit`, and produced `dist/`. There is no separate lint/type script;
  type checking is part of `build`.
- `npm audit --omit=dev` reported **0 vulnerabilities**.
- Bundle evidence: app JS **26,854 B** (**9,929 B gzip**), CSS **16,571 B**
  (**4,427 B gzip**), hero WebP **38,168 B**. All are under the specified
  static/PWA budgets.
- Lighthouse 13.4.1, mobile, on the exact local production build: Performance
  **100**, Accessibility **100**, Best Practices **100**, SEO **100**; LCP
  **1,213 ms**, CLS **0**, TBT **8 ms**. The same live-URL run scored
  **100/100/100/100** with LCP **1,127 ms**, CLS **0**, TBT **15 ms**.

## End-to-end and recovery evidence

- Keyboard-only at 390 px: Tab reached Exercise in six tabs; its enclosing
  docket showed the designed yellow/blue focus-within treatment. Typing
  `sq`, Tab, `225x5`, Enter created the set.
- Normal and boundary grammar: accepted `225x5`, `100x8kg`, `2000x999`, and
  `135 × 10`; rejected `2000.01x5`, `1x1000`, and `abc`, then successfully
  recovered and logged a valid set.
- Completed a workout, viewed its receipt, removed and restored a set with
  Undo, exported JSON (1,698 B in the exercised case) and CSV with its header,
  and received a helpful rejected-invalid-JSON import message.
- After service-worker control was established, offline reload displayed
  `Offline · logging still works` and successfully logged `95x5` locally.
- A controlled changed-service-worker response was used to force an update:
  before update `waiting=false` / update toast hidden; after update
  `waiting=false` / update toast visible. The update UI is therefore reached
  despite immediate `skipWaiting` activation.
- Desktop and 390 px screenshots were visually inspected. Both had one h1,
  zero horizontal overflow, no page or console errors, and the
  reduced-motion toast transition measured `0.01 ms`.
- Axe (`@axe-core/playwright`) found **no serious or critical violations** on
  the logger, privacy, or terms screens in both desktop and mobile runs.

## Privacy, network, and deployment evidence

- Fresh normal-use browser sessions made no requests outside the app origin;
  no analytics, CDN fonts/scripts, or account calls were observed. Data uses
  local IndexedDB. The optional billing verification endpoint was not invoked
  because no real license token was supplied.
- `/`, `/privacy`, `/terms`, `offline.html`, manifest, icons, and service
  worker were reachable. Manifest has standalone display, versioned start URL,
  and 192/512 maskable icons.
- SHA-256 checks show the candidate's `index.html`, `sw.js`, manifest, app JS,
  app CSS, and hero WebP exactly equal their live counterparts. Live mobile
  browser smoke also reproduced the P1 state with service-worker control,
  zero overflow, zero console/page errors, and no external requests.
- Live headers: `strict-transport-security`, `referrer-policy`, and
  `x-content-type-options` are present. See P2 for the missing policies and
  30-second caching.

## Retest command

```sh
npm ci
npm test
npm run build
```

Then test two consecutive sets using only the keyboard. The second expression
must log without re-entering the exercise, followed by the PWA offline/update,
mobile, axe, and deployed-header checks above.
