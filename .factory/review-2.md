# Adversarial first-read review 2 — Set Receipt

**Work order:** `lift-receipt-log-review-2`  
**Candidate:** `92b3564797582bf1eea8146903b1e1a76f7c9038`  
**Live URL:** <https://lift-receipt-log.sociobot.in>  
**Reviewed:** 30 August 2026 UTC

## Verdict: FAIL

One prior finding has regressed and is blocking: the product again calls a
finished receipt immutable without listing or proving that claim. Fourteen
additional copy, claim-registration, terminology, and documentation findings
remain. A PASS requires zero findings and no untested claim.

## First screen, before scrolling

Fresh contexts were used at 390 × 844 and 1440 × 900. Both returned HTTP 200
without a console error on the root page.

My cold-read answers were the same in both contexts:

- **What does it do?** It records a lift's weight and reps, then turns the
  workout into a receipt.
- **For whom?** Lifters who record sets while working out.
- **What should I click first?** **Try it with sample data**.

The phone view showed the headline, audience sentence, sample action, its
outcome text, all three facts, and the complete **Log set** control before the
844 px fold. No first-screen blocking finding was recorded.

## Findings

### Blocking

#### F-1-33 — The unsupported read-only claim has regressed as “immutable”

- **Exact quote/location:** Finished receipt view, eyebrow:
  `IMMUTABLE TRAINING RECORD`. The same wording also appears in the tagged test
  title: `files an immutable receipt`.
- **Why this fails:** Review 1 required the unsupported `read-only receipts`
  wording to be removed or proved. The replacement makes the same stronger
  claim. `.factory/claims.json` does not claim immutability, and
  `@claim:keyboard-receipt` only finishes and reloads a workout. It never tries
  to change one. A Pro user can change a private note on a finished receipt, so
  the whole displayed receipt is not immutable.
- **Concrete fix:** Replace the eyebrow with `COMPLETED WORKOUT`, and rename the
  test so it claims only persistence. If set immutability is intended, define
  its exact boundary in `claims.json` and test that completed set fields cannot
  be changed while describing receipt notes as editable.

### Claim coverage

#### F-2-1 — The installability claim is not registered or tested

- **Exact quote/location:** README, What it does: `Installs as an app and
  reloads offline after the first visit.`
- **Why this fails:** `offline-reload` proves service-worker control, offline
  reload, and offline logging. It does not assert PWA installability, manifest
  validity, required icons, or an install result. No other claim lists the
  `Installs as an app` promise.
- **Concrete fix:** Add an `app-installable` claim and a manifest/installability
  test, or rewrite the sentence as `Reloads offline after the first visit.`

#### F-2-2 — The no-advice product promise is unlisted

- **Exact quote/location:** Landing, Privacy and limits: `It does not give
  training or injury advice.`
- **Why this fails:** This is a product boundary a visitor can rely on, but no
  entry in `.factory/claims.json` names it. The sentence is important because
  it comes directly from the brief; leaving it unregistered makes the claims
  inventory incomplete.
- **Concrete fix:** Add a `no-training-advice` claim with a static/public-route
  content check that rejects prescriptive training or injury guidance, or move
  the statement to clearly labelled legal scope outside the product-claim
  inventory.

#### F-2-3 — “Compact receipt” is an unmeasured qualitative claim

- **Exact quote/location:** README introduction: `Enter 225x5, then finish the
  workout to keep a compact receipt.`
- **Why this fails:** `compact` has no defined measure and is absent from the
  receipt claim. It does not help the reader understand what the receipt
  contains.
- **Concrete fix:** Use `Enter 225x5, then finish the workout to keep a workout
  receipt.`

### Copy and terminology

#### F-2-4 — The storage boundary changes between “device” and “browser”

- **Exact quotes/locations:** Header: `SAVED ON THIS DEVICE`; README opening:
  `stores them on this device`; landing fact: `Workout data stays in this
  browser.`
- **Why this fails:** IndexedDB is scoped to this browser profile, not generally
  to the device. The mixed terms make the privacy boundary less precise and
  broaden the listed `local-private` wording.
- **Concrete fix:** Use `this browser` everywhere: `SAVED IN THIS BROWSER` and
  `Set Receipt logs lifts from the keyboard and stores them in this browser.`

#### F-2-5 — “Open receipt” contradicts the receipt definition

- **Exact quote/location:** Active workout sheet: `OPEN RECEIPT · <date>`.
  Landing copy says `Finished workouts become receipts`.
- **Why this fails:** The same object is a workout before it is finished and a
  receipt afterward. Calling the in-progress object a receipt makes the stated
  workflow inconsistent.
- **Concrete fix:** Use `ACTIVE WORKOUT · <date>`.

#### F-2-6 — “ONE-TIME UNLOCK” is a banned marketing label

- **Exact quote/location:** Landing Pro section and Setup Pro panel:
  `ONE-TIME UNLOCK`.
- **Why this fails:** `unlock` is banned by the plain-words rules here, and the
  label does not name the section as clearly as its H2 does.
- **Concrete fix:** Use `PRO FEATURES` or `ONE-TIME PRO LICENSE`.

#### F-2-7 — “LOCAL LIFT LOG / READY” contains a vague status slogan

- **Exact quote/location:** Landing eyebrow above the H1:
  `LOCAL LIFT LOG / READY`.
- **Why this fails:** `READY` does not tell the visitor what is ready and
  duplicates the separate online/offline status bar.
- **Concrete fix:** Use `LOCAL WORKOUT LOG`, or remove the eyebrow.

#### F-2-8 — The Privacy eyebrow is a reusable mood label

- **Exact quote/location:** Privacy route: `THE PLAIN-LANGUAGE VERSION`.
- **Why this fails:** It could appear on any product and adds no information to
  the `Privacy` H1.
- **Concrete fix:** Delete it, or use `WORKOUT AND LICENSE DATA`.

#### F-2-9 — The Terms eyebrow is a reusable slogan

- **Exact quote/location:** Terms route: `SHORT AND STRAIGHT`.
- **Why this fails:** It describes tone, not the section, and carries no term a
  reader can use.
- **Concrete fix:** Delete it, or use `USE AND PRO LICENSE TERMS`.

#### F-2-10 — The receipts eyebrow is brand mood, not a section name

- **Exact quote/location:** Receipts list: `YOUR TRAINING, YOUR FILE`.
- **Why this fails:** The line can be removed without losing meaning and does
  not name what the page contains.
- **Concrete fix:** Use `FINISHED WORKOUTS`, or rely on the `Workout receipts`
  H1 alone.

#### F-2-11 — The Setup eyebrow does not name the page's contents

- **Exact quote/location:** Setup: `MAKE THE SHORTHAND YOURS`.
- **Why this fails:** Setup also contains units, rest timing, data controls,
  and Pro. The slogan describes only one panel.
- **Concrete fix:** Use `LOGGING, DATA, AND PRO`, or remove the eyebrow.

#### F-2-12 — The custom-rest action does not name its result

- **Exact quote/location:** Setup, custom seconds button: `Set`.
- **Why this fails:** The button is not understandable out of context and does
  not say what will be saved.
- **Concrete fix:** Use `Save rest time`.

#### F-2-13 — The README does not explicitly say who the product is for

- **Exact location:** README introduction. It says what Set Receipt does but
  never identifies `lifters who record weight and reps during a workout`, even
  though the repository definition of done requires the README to say who it
  is for.
- **Why this fails:** A reader evaluating the repository has to infer the
  intended user from the feature list.
- **Concrete fix:** Add the landing audience sentence after the opening:
  `It is for lifters who record weight and reps during a workout.`

#### F-2-14 — “What it does” does not make sense in a heading list

- **Exact quote/location:** README H2: `What it does`.
- **Why this fails:** Read without the document title, the heading does not name
  its subject.
- **Concrete fix:** Use `What Set Receipt does`.

## Complete landing copy audit

Counts ignore standalone symbols such as `×`, `/`, and `·`. No sentence exceeds 22
words. `F-*` marks every flagged line; `Pass` means no additional issue was
found in that line.

| Sentence | Words | Result |
| --- | ---: | --- |
| `Log sets.` | 2 | Pass |
| `Keep a workout receipt.` | 4 | Pass |
| `For lifters who record weight and reps during a workout.` | 10 | Pass |
| `Loads a separate sample log.` | 5 | Pass |
| `Works offline after your first visit.` | 6 | Listed: `offline-reload` |
| `Workout data stays in this browser.` | 6 | Listed: `local-private` |
| `Free core tools.` | 3 | Listed: `free-core` |
| `Pro extras cost $9 once.` | 5 | Listed: `pro-price` |
| `Try 225x5, 100x8kg, or 135 × 10.` | 6 | Listed: `keyboard-receipt` |
| `Enter an exercise and weight × reps.` | 6 | Listed: `keyboard-receipt` |
| `Rest with the timer that starts after each set.` | 9 | Listed: `keyboard-receipt` |
| `Finish the workout to file and share its receipt.` | 9 | Listed: `keyboard-receipt`, `receipt-share` |
| `It does not give training or injury advice.` | 8 | **F-2-2** |
| `Workout data stays in this browser until you export or share it.` | 12 | Listed: `local-private`, `data-portability`, `receipt-share` |
| `Pro adds custom rest intervals and private notes on finished receipts.` | 11 | Listed: `pro-features` |
| `Log sets, then finish the workout to save its receipt.` | 10 | Listed: `keyboard-receipt` |
| `Workout data stays in this browser.` | 6 | Listed: `local-private` |
| `License checks use Sociobot.` | 4 | Listed: `pro-features` |
| `Built by Param Factory · v1.0.0 · Generated editorial image.` | 8 | Pass |

Landing headings, labels, and actions are also copy even when they are not
sentences:

| Copy | Words | Result |
| --- | ---: | --- |
| `Set Receipt` | 2 | Pass; wordmark |
| `Log` / `Receipts` / `Setup` | 1 each | Pass; route names |
| `SAVED ON THIS DEVICE` | 4 | **F-2-4** |
| `LOCAL LIFT LOG / READY` | 4 | **F-2-7** |
| `Try it with sample data` | 5 | Pass; result-naming action |
| `Exercise` | 1 | Pass; field label |
| `Weight × reps` | 2 | Pass; field label |
| `Log set` | 2 | Pass; result-naming action |
| `HOW IT WORKS` | 3 | Pass |
| `Log a workout in three steps` | 6 | Pass |
| `PRIVACY AND LIMITS` | 3 | Pass |
| `What Set Receipt does not do` | 6 | Pass |
| `ONE-TIME UNLOCK` | 2 | **F-2-6** |
| `Set Receipt Pro: $9 once` | 5 | Pass |
| `Buy Pro` | 2 | Pass; result-naming action |
| `REST TIMER` | 2 | Pass |
| `Start rest timer` / `Reset rest timer` | 3 each | Pass |
| `2 min default · starts after each set` | 7 | Pass; concise status |
| `Finished workouts become receipts` | 4 | Pass |
| `Privacy` / `Terms` | 1 each | Pass; route names |

## Complete README copy audit

| Sentence | Words | Result |
| --- | ---: | --- |
| `Set Receipt logs lifts from the keyboard and stores them on this device.` | 13 | **F-2-4**, **F-2-13** |
| `Enter 225x5, then finish the workout to keep a compact receipt.` | 11 | **F-2-3** |
| `It opens a sample Bench press workout in separate browser storage and does not change your workout log.` | 18 | Listed: `demo-sandbox` |
| `Logs weight × reps; 225x5, 100x8kg, and 135 × 10 work.` | 9 | Listed: `keyboard-receipt` |
| `Expands editable exercise aliases such as sq, bp, dl, and ohp.` | 11 | Listed: `editable-aliases` |
| `Starts a rest timer after each set.` | 7 | Listed: `keyboard-receipt` |
| `Keeps active workouts and finished receipts in this browser’s storage.` | 10 | Listed: `keyboard-receipt`, `local-private` |
| `Shares plain-text receipts and prints cleanly to paper or PDF.` | 10 | Listed: `receipt-share`, `print-receipt` |
| `Exports every record as JSON or CSV and restores JSON backups.` | 11 | Listed: `data-portability` |
| `Installs as an app and reloads offline after the first visit.` | 11 | **F-2-1** |
| `The free logger includes aliases, fixed rest presets, receipts, export, and import.` | 12 | Listed: `free-core`, `data-portability` |
| `A $9 one-time Pro license adds custom rest intervals and private receipt notes through Sociobot checkout.` | 16 | Listed: `pro-price`, `pro-features` |
| `Build the deployable site with:` | 5 | Pass |
| `Playwright 1.58.2 is pinned.` | 4 | Confirmed in `package.json` |
| `In the factory worker, Chromium is already available.` | 8 | Confirmed in this worker |
| `Elsewhere, install it once if necessary.` | 6 | Pass; instruction |
| `Tests cover logging, receipts, backups, aliases, demo isolation, privacy, accessibility, and offline reloads.` | 13 | Confirmed by the full suite |
| `Machine-readable product claims and their exact test commands are in .factory/claims.json.` | 11 | Confirmed |
| `Demo data and reset behavior are documented in .factory/demo.md.` | 9 | Confirmed |
| `Workout data stays in this browser during ordinary logging.` | 9 | Listed: `local-private` |
| `The app loads no analytics, ads, external fonts, or third-party scripts.` | 11 | Listed: `no-third-party-assets` |
| `The browser stores your license token and checks it with api.sociobot.in no more than once a day.` | 17 | Listed: `pro-features` |
| `See /privacy and /terms.` | 4 | Pass; both links returned 200 |
| `Deploy dist/ as a static site with /privacy, /terms, and /demo routed to the app and unknown routes served by 404.html.` | 21 | Confirmed by static and live checks |
| `Visual rationale and generated-asset provenance are in .factory/design.md.` | 8 | Confirmed |
| `MIT licensed.` | 2 | Confirmed by `LICENSE` |

README headings and standalone link labels:

| Copy | Words | Result |
| --- | ---: | --- |
| `Set Receipt` | 2 | Pass |
| `Live` | 1 | Pass; link label |
| `Demo` | 1 | Pass; link label |
| `What it does` | 3 | **F-2-14** |
| `Develop` | 1 | Pass |
| `Test` | 1 | Pass |
| `Privacy and data` | 3 | Pass |
| `Deploy` | 1 | Pass |

No audited sentence exceeds 22 words. No banned marketing adjective appears in
a sentence. The banned `unlock` appears in the standalone heading recorded as
F-2-6.

## Demo and sandbox

- One click from `/` opened `/demo`.
- The first phone screen showed the persistent banner, `Sample workout`, and a
  realistic Bench press row. The first row occupied y=649–718 in an 844 px
  viewport; three rows were loaded.
- Removing a row changed the count from 3 to 2. **Reset demo** restored 3.
- A real Squat set was created before demo entry. IndexedDB then contained
  separate `set-receipt` and `set-receipt-demo` databases. **Start for real**
  deleted the demo database without changing the real database; `/demo`
  re-entry restored the original three rows.
- The live demo request log contained only
  `https://lift-receipt-log.sociobot.in` requests. No cross-origin request was
  made during logging or demo controls.
- A dedicated service-worker context became controlled, reloaded `/demo`
  offline with all three sample rows, logged `Deadlift 315x3`, and kept the UI
  working.

The demo itself passes. There is no demo-related blocking finding.

## Claims verification

The repository was cloned to a fresh temporary directory, `npm ci` was run,
and every exact command from `.factory/claims.json` was run separately. Each
command passed in desktop Chromium and the configured 390 × 844 mobile project.

| Claim | Exact command | Result |
| --- | --- | --- |
| `keyboard-receipt` | `npm run test:e2e -- --grep @claim:keyboard-receipt` | PASS, 2/2 |
| `editable-aliases` | `npm run test:e2e -- --grep @claim:editable-aliases` | PASS, 2/2 |
| `free-core` | `npm run test:e2e -- --grep @claim:free-core` | PASS, 2/2 |
| `data-portability` | `npm run test:e2e -- --grep @claim:data-portability` | PASS, 2/2 |
| `receipt-share` | `npm run test:e2e -- --grep @claim:receipt-share` | PASS, 2/2 |
| `print-receipt` | `npm run test:e2e -- --grep @claim:print-receipt` | PASS, 2/2 |
| `erase-local-data` | `npm run test:e2e -- --grep @claim:erase-local-data` | PASS, 2/2 |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS, 2/2 |
| `local-private` | `npm run test:e2e -- --grep @claim:local-private` | PASS, 2/2 |
| `no-third-party-assets` | `npm run test:e2e -- --grep @claim:no-third-party-assets` | PASS, 2/2 |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 2/2 |
| `pro-price` | `npm run test:e2e -- --grep @claim:pro-price` | PASS, 2/2 |
| `pro-features` | `npm run test:e2e -- --grep @claim:pro-features` | PASS, 2/2 |

Each claim tag occurs on exactly one test. Findings F-1-33 and F-2-1 through
F-2-3 identify the claim-like public copy not fully represented by that
registry.

## Earlier findings checked from scratch

The live site and source were checked for every finding in `review-1.md`; the
polish report and prior handoff were treated as assertions, not evidence.

| Earlier finding | Result in this review |
| --- | --- |
| F-1-1 | Fixed: sample action and outcome are above the phone fold. |
| F-1-2 | Fixed: first sample row is visible at y=649–718. |
| F-1-3 | Fixed now: both claim projects passed; live checkout resolved to Dodo with HTTP 200 after redirect. |
| F-1-4 | Fixed: exit deletes demo storage; re-entry reseeds it. |
| F-1-5 | Fixed: Privacy navigation and browser Back focus the new H1 and update the title. |
| F-1-6 | Fixed: How it works, limits, and paid sections are on `/`. |
| F-1-7 | Fixed: all checked routes keep the wordmark, main navigation, and footer. |
| F-1-8 | Fixed: the HTTP 404 includes route-specific OG and Twitter metadata. |
| F-1-9 | Fixed: H1 says `Log sets. Keep a workout receipt.` |
| F-1-10 | Fixed: empty-state H2 says `Finished workouts become receipts`. |
| F-1-11 | Fixed: action says `Start rest timer`. |
| F-1-12 | Fixed: action says `Reset rest timer`. |
| F-1-13 | Fixed: `No loading spinner.` is absent. |
| F-1-14 | Fixed: footer names browser storage and the Sociobot exception. |
| F-1-15 | Fixed: public copy uses `rest timer`, not `rest clock`. |
| F-1-16 | Fixed: coverage sentence is 13 words and uses plain terms. |
| F-1-17 | Fixed for jargon; the remaining audience and storage-boundary issues are F-2-13 and F-2-4. |
| F-1-18 | Fixed: README names the sample and separate browser storage plainly. |
| F-1-19 | Fixed: README does not expose `IndexedDB`. |
| F-1-20 | Fixed for jargon; the remaining unlisted installability claim is F-2-1. |
| F-1-21 | Fixed: the payment-provider implementation sentence is absent. |
| F-1-22 | Fixed: the service-worker implementation sentence is absent. |
| F-1-23 | Fixed: plain third-party asset wording is listed and tested. |
| F-1-24 | Fixed: the daily license-check sentence is plain and tested. |
| F-1-25 | Fixed: `fast` is absent from title, OG copy, and manifest. |
| F-1-26 | Fixed: the tagged test logs all three advertised formats. |
| F-1-27 | Fixed: `free-core` is listed and passed without a license. |
| F-1-28 | Fixed: repository payment-integration promises are absent. |
| F-1-29 | Fixed: unsupported Node compatibility copy is absent. |
| F-1-30 | Fixed: unsupported build-output promise is absent. |
| F-1-31 | Fixed: the narrowed asset/privacy claims are both listed and passed. |
| F-1-32 | Fixed: the notebook-speed comparison is absent. |
| F-1-33 | **Regressed — BLOCKING:** `IMMUTABLE TRAINING RECORD` repeats the unsupported claim. |
| F-1-34 | Fixed: merchant-of-record claims are absent. |
| F-1-35 | Fixed: card-data handling promise is absent. |
| F-1-36 | Fixed: refund and revocation promises are absent. |
| F-1-37 | Fixed: future compatibility promise is absent. |

## Structure, links, accessibility, and visual identity

- Titles follow the required pattern: root, Demo, Privacy, Terms, Receipts,
  Setup, and Page not found all set route-specific titles. Root is 41
  characters.
- Each checked route had one H1, one main landmark, a description, canonical,
  Open Graph image, Twitter card, header, and footer. Favicons, robots, sitemap,
  and the 1200 × 630 product image are present.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200. A missing route returned
  the designed 404 with recovery links. All discovered intentional links
  returned 200 after redirects; the only 404 was the deliberately missing URL.
- Privacy navigation, Back, Forward, and direct legal links pass the repository
  focus test. The live Privacy and Back checks focused the route H1.
- `/opt/fleet/lib/verify-url.sh` passed the live root with no console errors,
  one H1, `lang=en`, a main landmark, labelled buttons, and no missing alt text.
- Playwright Axe reported no serious or critical issue across core, demo,
  legal, and 404 routes in light and dark modes. Keyboard, reduced-motion,
  44 px touch-target, and 390 px overflow checks passed in the full suite.
- The neo-brutalist training-docket treatment is distinct: paper grid, cobalt
  timer, orange controls, hard rules/shadows, receipt typography, and original
  plate/receipt art. It does not read as a generic SaaS template.

No structural or visual-identity finding was recorded.

## Missed leverage

No missing AI step is justified. Logging a short set expression is faster and
more private without a model. The brief's obvious portability need is already
covered by JSON/CSV export and JSON restore. Cross-device sync would conflict
with the current local-first scope unless it were an explicit opt-in product
expansion. No decorative AI feature or embedded provider key was found.

## Other verification

- `npm test`: PASS — 7 unit tests, static verification, 45 Playwright passes,
  and 3 expected project-specific skips.
- `npm run build`: PASS — `dist/` produced; initial JS is 33.80 kB raw and
  11.74 kB gzip.
- Root live request: PASS — HTTP 200 and no console errors.

## What would make this perfect

Remove or rigorously scope the regressed immutability wording, register or
remove every remaining public claim, use `browser` for the storage boundary,
replace the six vague/mood labels with literal section names, rename `Set` to
`Save rest time`, and state the README audience explicitly. Then rerun all 13
claim commands, the complete suite, the live demo isolation/offline flow, and
the full copy audit. A subsequent review should find no remaining item rather
than treating the otherwise strong behavior and visual system as sufficient.
