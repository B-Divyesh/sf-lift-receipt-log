# Adversarial first-read review 1 — Set Receipt

**Work order:** `lift-receipt-log-review-1`

**Candidate:** `a7d4ba516ac092d3105ef8b4d9d7a8eb99017bff`

**Live URL:** <https://lift-receipt-log.sociobot.in>

**Reviewed:** 30 August 2026 UTC

## Verdict: FAIL

The product fails this round. Four findings are blocking: the phone first
screen does not expose a clear first action or the sample-data action; the
first phone screen after entering the demo shows no sample data; demo edits
survive leaving demo mode; and the declared `$9 once` checkout claim failed
twice during the review when both Sociobot endpoints returned HTTP 503. There are also route-focus,
site-structure, copy, terminology, metadata, and unlisted-claim findings.

## Findings

### Blocking

#### F-1-1 — The 390 px first screen does not make the first action clear

- **Exact location/quote:** On a fresh 390 × 844 load, the first large panel is
  `REST CLOCK` with `Start` and `Reset`. The headline `Log the set. Keep the
  proof.` starts at 395 px. The `Log set` button starts at 814 px and is cut by
  the viewport. `Try it with sample data` starts at 947 px and is entirely
  below the fold.
- **Why this fails:** A phone visitor can identify the audience from `For
  lifters who want to log a set as fast as a notebook`, but cannot confidently
  answer what to click first. The most prominent available action starts an
  unexplained timer. The mandatory no-setup action is invisible without
  scrolling.
- **Concrete fix:** On mobile, place the headline, one-sentence description,
  `Try it with sample data`, and `Loads a separate sample log` before the rest
  clock. Keep either the complete real entry form or the sample action visible
  within 390 × 844. Add a viewport assertion that the sample action and its
  outcome text are above `window.innerHeight`.

#### F-1-2 — The first demo screen does not show the product in use

- **Exact location/quote:** `/demo` shows the correct banner, `Demo — sample
  data, nothing is saved to your log`, but on 390 × 844 the entry form starts
  at 846 px, `Today’s sets` starts at 1,094 px, and the first sample row starts
  at 1,179 px. The visible screen contains the banner, rest clock, headline,
  and facts, but no sample set or receipt.
- **Why this fails:** After the promised one click, a visitor still has to
  scroll past the same marketing and empty entry UI before seeing evidence
  that sample data loaded. This fails the requirement that the first screen
  already look like the product being used.
- **Concrete fix:** In demo mode, put the active sample receipt directly below
  the demo banner, before the rest clock and repeated hero. Show at least one
  complete sample row in the initial phone viewport. Add a test asserting that
  `.set-row:first-child` intersects the 390 × 844 viewport immediately after
  entering `/demo`.

#### F-1-3 — The listed Pro price/checkout claim failed intermittently

- **Exact location/quote:** Setup shows `$9 once` and `Buy Pro`. Claim
  `pro-price` says, `Pro costs $9 once through the hosted Sociobot checkout.`
  Its exact command failed in both projects at
  `expect(catalogue.ok()).toBe(true)`. Independent requests to
  `https://api.sociobot.in/api/v1/products` and
  `https://api.sociobot.in/api/v1/products/lift-receipt-log/checkout` both
  returned HTTP 503 with `503 Service Unavailable`. A final retry later in the
  review recovered to catalogue 200, checkout 303, and 2/2 passing tests.
- **Why this fails:** A visitor can be offered a paid feature but cannot reach
  the advertised checkout. A failing listed claim is blocking regardless of
  whether the outage is temporary.
- **Concrete fix:** Stabilize and monitor the Sociobot catalogue and checkout
  endpoint, then rerun `npm run test:e2e -- --grep @claim:pro-price` repeatedly
  from fresh contexts.
  Keep the existing end-to-end assertions for product listing, 900-cent price,
  checkout URL, and 303 redirect. If checkout is unavailable, do not present an
  active `Buy Pro` action as purchasable.

#### F-1-4 — `Start for real` does not discard demo edits

- **Exact location/quote:** After `Reset demo`, removing one of the three Bench
  press rows, choosing `Start for real`, and reopening `/demo`, the edited
  two-row state returned. `indexedDB.databases()` still listed
  `set-receipt-demo`.
- **Why this fails:** Real data remains isolated, but the demo contract also
  requires leaving demo mode to discard demo changes unless the visitor
  explicitly keeps them. `Start for real` sounds like an exit, not a promise
  to retain the prior demo session.
- **Concrete fix:** When `Start for real` is chosen, delete or reseed the demo
  namespace before navigating to `/`. Add a regression that edits demo data,
  exits, re-enters, and sees the original three rows.

### Major

#### F-1-5 — SPA navigation and browser Back do not move focus to the route H1

- **Exact location/code:** Choosing footer `Privacy` changes the URL and title,
  but `document.activeElement` is `<body>`. Browser Back also leaves focus on
  `<body>`. `navigate()` calls `document.querySelector('h1')?.focus()`, but the
  H1 is not focusable; `popstate` only calls `render`.
- **Why this fails:** Keyboard and screen-reader users receive no dependable
  route-change context. This is specifically required for deep navigation and
  back/forward behavior.
- **Concrete fix:** Give route H1s `tabindex="-1"`, focus them after both
  programmatic navigation and `popstate`, and announce the route name through
  a dedicated polite live region. Test Privacy, Back, Forward, and a deep-link
  load.

#### F-1-6 — The landing route omits required explanatory and paid sections

- **Exact location:** The full `/` page is the logger, rest clock, empty-state
  illustration, and footer. It has no `How it works` section, no plain `What it
  does not do`/privacy section, and no paid-tier section stating what `$9`
  unlocks. The paid details are hidden behind the `Setup` tab.
- **Why this fails:** The standard landing skeleton requires these sections in
  that order. A first-time visitor must infer the workflow and open Setup to
  understand the price fact shown in the hero.
- **Concrete fix:** After the live logger, add three short verb-led steps, a
  plain privacy/limitations section, and the exact `$9 once` Pro features with
  the checkout action. Keep the neo-brutalist training-docket identity rather
  than introducing generic feature cards.

#### F-1-7 — Route headers are not consistent

- **Exact location:** `/` and `/demo` show `Log`, `Receipts`, and `Setup` in the
  header. `/privacy`, `/terms`, and the 404 replace that navigation with only
  `Back to logger`.
- **Why this fails:** The required site skeleton says the same wordmark and
  compact navigation remain available on every route. Removing the main
  destinations makes legal and recovery pages feel detached from the product.
- **Concrete fix:** Use one header component on every route. Keep the wordmark
  and the same main destinations, with an optional route-specific back link.

#### F-1-8 — The designed 404 omits Open Graph and Twitter metadata

- **Exact location:** The live HTTP 404 has a title, description, canonical,
  favicon, and apple-touch icon, but no `og:title`, `og:description`,
  `og:image`, `twitter:card`, or Twitter image/title/description.
- **Why this fails:** The metadata contract applies per route. A shared or
  indexed bad URL has an incomplete preview despite the product already
  shipping a 1200 × 630 image.
- **Concrete fix:** Add the same product-derived social image and
  route-specific not-found title/description to `public/404.html`.

### Copy and terminology

#### F-1-9 — `Keep the proof.` is metaphor copy, not the job

- **Exact location/quote:** H1: `Log the set. Keep the proof.`
- **Why this fails:** `Proof` is not a named product object and can imply
  evidence or verification the app does not provide. Elsewhere the saved object
  is consistently called a receipt.
- **Concrete fix:** Use `Log sets. Keep a workout receipt.`

#### F-1-10 — `Your next receipt starts here.` is a mood heading

- **Exact location/quote:** Empty illustration H2: `Your next receipt starts
  here.`
- **Why this fails:** In a headings list it does not name the section or explain
  what will appear.
- **Concrete fix:** Use `Finished workouts become receipts` and follow it with
  one sentence explaining how to create one.

#### F-1-11 — `Start` does not name the result

- **Exact location/quote:** Rest-clock button: `Start`.
- **Why this fails:** On the first phone screen it is the strongest visible
  action, but it does not say what starts.
- **Concrete fix:** Use `Start rest timer`.

#### F-1-12 — `Reset` does not name the result

- **Exact location/quote:** Rest-clock button: `Reset`.
- **Why this fails:** It is easily confused with `Reset demo`, particularly in
  demo mode.
- **Concrete fix:** Use `Reset rest timer`.

#### F-1-13 — `No loading spinner.` is an information-free slogan and unlisted claim

- **Exact location/quote:** Empty-state paragraph: `No loading spinner.`
- **Why this fails:** It neither explains the product nor gives the visitor an
  action. It is also a behavior claim with no `claims.json` entry.
- **Concrete fix:** Delete it. Keep the useful adjacent statements about no
  account and local storage after those claims are listed.

#### F-1-14 — `Private by default.` is vague marketing copy

- **Exact location/quote:** Footer: `Private by default.`
- **Why this fails:** `Private` does not identify the storage boundary or the
  checkout exception. The next sentence and Privacy route carry the useful
  facts.
- **Concrete fix:** Use one precise line: `Workout data stays in this browser;
  only license checks use Sociobot.`

#### F-1-15 — The same feature is called both `rest timer` and `rest clock`

- **Exact locations:** README: `Starts a large rest timer after each set.` UI:
  `REST CLOCK`, `Rest clock`, and `Rest clock saved.`
- **Why this fails:** The copy contract requires one term for one concept.
- **Concrete fix:** Use `rest timer` everywhere, including buttons, settings,
  claims, and README.

#### F-1-16 — The README test-coverage sentence is too long, jargon-heavy, and unlisted

- **Exact quote:** `The suite covers parsing, receipt math, backup validation,
  keyboard entry, IndexedDB persistence, aliases, exact recovery regressions,
  touch geometry, demo isolation, privacy request capture, axe scans, and
  offline reloads.` — **28 words**.
- **Why this fails:** It exceeds 22 words, combines many ideas, and uses
  unexplained phrases such as `exact recovery regressions`, `touch geometry`,
  and `axe scans`. It also makes a coverage claim absent from `claims.json`.
- **Concrete fix:** Split it: `Tests cover logging, receipts, backups, aliases,
  demo isolation, privacy, accessibility, and offline reloads.` Then list any
  additional coverage as short bullets or remove the meta-claim.

#### F-1-17 — The README opens with unexplained `keyboard-first` and `local`

- **Exact quote:** `Set Receipt is a keyboard-first, local lift logger for
  regular lifters.`
- **Why this fails:** `Keyboard-first` and `local` require interpretation on a
  first read; `local` could mean a gym or location rather than device storage.
- **Concrete fix:** Use `Set Receipt logs lifts from the keyboard and stores
  them on this device.`

#### F-1-18 — The README demo sentence uses jargon and a subjective adjective

- **Exact quote:** `It opens realistic sample workouts in a separate
  browser-storage namespace and never changes your real log.`
- **Why this fails:** `browser-storage namespace` is implementation jargon,
  `realistic` is subjective, and `real log` differs from `workout log`.
- **Concrete fix:** Use `It opens a sample Bench press workout in separate
  browser storage and does not change your workout log.`

#### F-1-19 — `IndexedDB` is unexplained in the feature list

- **Exact quote:** `Keeps active workouts and completed read-only receipts in
  IndexedDB.`
- **Why this fails:** The database name does not help a lifter understand the
  benefit.
- **Concrete fix:** Use `Keeps active workouts and finished receipts in this
  browser’s storage (IndexedDB).`

#### F-1-20 — `PWA` is unexplained

- **Exact quote:** `Installs as a PWA and reloads fully offline after the first
  visit.`
- **Why this fails:** `PWA` is developer shorthand in a user-facing feature
  list.
- **Concrete fix:** Use `Installs as an app and reloads offline after the first
  visit.`

#### F-1-21 — `hardcoded` is developer jargon and the sentence is an unlisted claim

- **Exact quote:** `No payment provider is embedded in this repository and no
  product ID is hardcoded.`
- **Why this fails:** The sentence is not useful to the primary user, uses
  implementation jargon, and has no claims entry or static assertion.
- **Concrete fix:** Either remove it or write `Checkout is hosted by Sociobot;
  this app does not collect card details.` List and test that narrower privacy
  claim.

#### F-1-22 — `generated precaching service worker` is avoidable jargon

- **Exact quote:** `It writes the deployable static application to ./dist, with
  index.html at the root and a generated precaching service worker.`
- **Why this fails:** A deployer needs the output and offline artifact, not the
  internal caching term.
- **Concrete fix:** Use `It writes the deployable site to ./dist, including
  index.html and the offline worker.`

#### F-1-23 — `runtime CDN` is unexplained jargon

- **Exact quote:** `There is no account, analytics, advertising, third-party
  font, or runtime CDN.`
- **Why this fails:** `runtime CDN` is not plain language and the sentence
  combines multiple privacy claims under one technical term.
- **Concrete fix:** Use `The app loads no analytics, ads, external fonts, or
  third-party scripts.` Add claim coverage for the whole sentence.

#### F-1-24 — `daily-at-most verification` is awkward implementation language

- **Exact quote:** `A license token is stored in localStorage and sent only to
  api.sociobot.in for daily-at-most verification.`
- **Why this fails:** `localStorage` and `daily-at-most` make the privacy rule
  harder to understand.
- **Concrete fix:** Use `The browser stores your license token and checks it
  with api.sociobot.in no more than once a day.`

### Unlisted claims

#### F-1-25 — `fast` is an unmeasured, unlisted claim in metadata

- **Exact locations/quotes:** Root title and Open Graph title: `Set Receipt —
  fast, offline lift log`. Manifest description: `A fast, offline set logger
  and portable workout receipt.`
- **Why this fails:** `Fast` is a qualitative performance claim with no number,
  measurement, or claims entry.
- **Concrete fix:** Remove the adjective. Use `Set Receipt — log lifts and keep
  workout receipts` and `Log sets offline and keep portable workout receipts.`

#### F-1-26 — Two advertised entry formats are not covered by the listed claim test

- **Exact quote:** README and entry help say `225x5`, `100x8kg`, and `135 × 10`
  work. `keyboard-receipt` tests only `225x5`.
- **Why this fails:** Visitors can rely on explicit kilograms and the
  multiplication-sign form, but no listed claim test asserts either observable
  flow.
- **Concrete fix:** Expand the claim text and tagged test to log all three
  formats through the demo, or narrow the public examples to the tested form.

#### F-1-27 — Free and ungated core functionality is not a listed claim

- **Exact locations/quotes:** Landing: `Free logger.` README: `The free logger,
  aliases, fixed rest presets, receipts, and all data portability are complete
  and ungated.`
- **Why this fails:** The existing feature tests usually run without a license,
  but no claim entry states and proves that every named core feature remains
  available without payment.
- **Concrete fix:** Add a `free-core` entry and a no-license demo test covering
  logging, fixed rest presets, aliases, receipt completion, export, and import;
  or replace the broad sentence with individually listed claims.

#### F-1-28 — Repository payment-integration claims are not listed

- **Exact quote:** `No payment provider is embedded in this repository and no
  product ID is hardcoded.`
- **Why this fails:** This is verifiable by source scanning but is absent from
  `claims.json`.
- **Concrete fix:** Remove it from user copy or add a static tagged test that
  rejects payment-provider SDKs, provider endpoints/keys, and fixed provider
  product IDs.

#### F-1-29 — The Node.js 20 compatibility claim is not listed

- **Exact quote:** `Requires Node.js 20 or newer.`
- **Why this fails:** The package has no `engines` declaration and no listed
  test proving Node 20 compatibility.
- **Concrete fix:** Add `engines.node: ">=20"`, run the build/tests on Node 20
  in CI, and list that verification; or state only the version actually tested.

#### F-1-30 — The documented build output is not a listed claim

- **Exact quote:** `It writes the deployable static application to ./dist,
  with index.html at the root and a generated precaching service worker.`
- **Why this fails:** The statement is observable and important to deployment,
  but no claim entry checks `dist/index.html` and the generated worker.
- **Concrete fix:** Add a `build-output` static test and claim entry, or keep
  this strictly as a command result in handoff documentation rather than a
  product claim.

#### F-1-31 — The broader no-account/ads/fonts/CDN promise exceeds `local-private`

- **Exact locations/quotes:** Landing: `No account.` and `No account, feed, or
  tracking.` README: `There is no account, analytics, advertising, third-party
  font, or runtime CDN.`
- **Why this fails:** `local-private` proves same-origin demo requests and says
  no analytics/tracking. It does not list or directly assert no account system,
  feed, advertising, or third-party font across all routes.
- **Concrete fix:** Expand the claim and static/runtime test to cover these exact
  promises across `/`, `/demo`, `/privacy`, and `/terms`, or narrow the copy to
  `No analytics or tracking`, which is already listed.

#### F-1-32 — The notebook-speed comparison is an unlisted performance claim

- **Exact location/quote:** Landing: `For lifters who want to log a set as fast
  as a notebook.`
- **Why this fails:** `As fast as` is a comparative speed claim. No claim entry
  defines or measures notebook-speed entry.
- **Concrete fix:** Use a factual audience line such as `For lifters who record
  weight and reps during a workout`, or add a timed usability benchmark and a
  claim with a measurable threshold.

#### F-1-33 — `read-only receipts` is not proved by a listed claim

- **Exact location/quote:** README: `Keeps active workouts and completed
  read-only receipts in IndexedDB.`
- **Why this fails:** Tests confirm persistence and display, but no listed claim
  test attempts to edit a completed receipt and proves that it cannot change.
- **Concrete fix:** Add immutability to the receipt claim and test the absence
  and ineffectiveness of edit controls after completion, or remove `read-only`.

#### F-1-34 — Merchant-of-record claims are inconsistent and unlisted

- **Exact locations/quotes:** Setup says `Checkout is hosted by Sociobot/Dodo,
  the merchant of record.` Privacy says `Sociobot and Dodo are the merchant of
  record and process checkout details`. Terms says `Sociobot/Dodo is the
  merchant of record; it handles payment and refunds.`
- **Why this fails:** The wording alternates between a slash, singular, and
  plural identity. The checkout test proves only a redirect to Dodo, not which
  legal entity is merchant of record or handles refunds.
- **Concrete fix:** Confirm the legal entity, use its exact name everywhere,
  and add an authoritative billing-contract assertion or remove the unsupported
  operational claims.

#### F-1-35 — The card-data handling promise is unlisted

- **Exact location/quote:** Privacy: `payment card data never passes through
  this app.`
- **Why this fails:** This is an important privacy claim, but neither
  `local-private` nor `pro-price` explicitly tests the checkout boundary and
  source for card fields/provider SDKs.
- **Concrete fix:** Add a static and browser claim test that confirms the app
  only navigates to hosted checkout and never renders, stores, or submits card
  fields; or remove the promise.

#### F-1-36 — Refund handling and license revocation are unlisted

- **Exact locations/quotes:** Setup: `Refunds are handled there and revoke the
  license.` Terms: `A refund revokes the license.`
- **Why this fails:** No listed test exercises a refunded license or the stated
  support channel. The mocked valid-license test cannot prove refund behavior.
- **Concrete fix:** Add a recorded refunded-license fixture and contract test,
  and name the actual refund handler, or remove both claims.

#### F-1-37 — Future backup compatibility is an untestable promise

- **Exact location/quote:** Terms: `We may improve the app while preserving
  reasonable backup compatibility.`
- **Why this fails:** `Reasonable` has no defined version or test threshold, and
  a future promise cannot be verified in the current sandbox.
- **Concrete fix:** Delete the sentence or publish a versioned compatibility
  rule such as `The current app imports backup schema version 1`, with fixtures
  for every supported version.

## Cold first-screen record

### Phone, 390 × 844, before scrolling

- **What does it do?** It appears to log lifting sets and keep some form of
  workout record, although `proof` is not defined.
- **For whom?** Lifters who want notebook-speed set entry.
- **What should I click first?** Not clear. `Start` and `Reset` on the rest clock
  are the first large controls. The logger submit is clipped and the sample
  action is below the viewport.

This is blocking under F-1-1.

### Desktop, 1440 × 900, before scrolling

- **What does it do?** Logs a lifting set and keeps a workout receipt.
- **For whom?** Lifters who want to log as quickly as a notebook.
- **What should I click first?** `Try it with sample data` is visible with
  `Loads a separate sample log`, or the visitor can enter an exercise and set.

Desktop passes the first-read gate. It does not offset the required phone
failure.

## Copy audit

Counts treat displayed numbers and contractions as one word. Headings, status
fragments, and actions are included separately so no visible cold-landing copy
is omitted.

### Landing sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| `Saved on this device` | 4 | Pass; covered by `local-private` |
| `Log the set.` | 3 | Pass |
| `Keep the proof.` | 3 | Flag F-1-9 |
| `For lifters who want to log a set as fast as a notebook.` | 13 | Flag F-1-32 |
| `Works offline after your first visit.` | 6 | Pass; `offline-reload` |
| `Workout data stays on this device.` | 6 | Pass; `local-private` |
| `Free logger.` | 2 | Flag F-1-27 |
| `Pro extras cost $9 once.` | 5 | Listed, but the required run failed intermittently: F-1-3 |
| `Try 225x5, 100x8kg, or 135 × 10.` | 6 | Flag F-1-26 |
| `Loads a separate sample log.` | 5 | Pass; `demo-sandbox` |
| `2 min default · starts after each set` | 7 | Pass; terminology flag F-1-15 |
| `Your next receipt starts here.` | 5 | Flag F-1-10 |
| `No account.` | 2 | Flag F-1-31 |
| `No loading spinner.` | 3 | Flag F-1-13 |
| `Your sets stay on this device.` | 6 | Pass; `local-private` |
| `Private by default.` | 3 | Flag F-1-14 |
| `No account, feed, or tracking.` | 5 | Flag F-1-31 |
| `Built by Param Factory · v1.0.0 · Generated editorial image.` | 8 | Pass; provenance/version disclosure |

### Landing headings, labels, and actions

| Copy | Words | Result |
| --- | ---: | --- |
| `LOCAL LIFT LOG / READY` | 4 | Pass as a status label |
| `Log the set. Keep the proof.` | 6 | Flag F-1-9 |
| `Exercise` | 1 | Pass |
| `Weight × reps` | 3 | Pass |
| `Log set` | 2 | Pass; result-naming verb |
| `Try it with sample data` | 5 | Pass copy; placement fails F-1-1 |
| `REST CLOCK` | 2 | Terminology flag F-1-15 |
| `Start` | 1 | Flag F-1-11 |
| `Reset` | 1 | Flag F-1-12 |
| `Your next receipt starts here.` | 5 | Flag F-1-10 |
| `Log`, `Receipts`, `Setup` | 1 each | Pass as navigation destination names |
| `Privacy`, `Terms` | 1 each | Pass |

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| `Set Receipt is a keyboard-first, local lift logger for regular lifters.` | 11 | Flag F-1-17 |
| `Enter a set as 225x5, then keep the finished workout as a compact receipt.` | 14 | Pass |
| `It opens realistic sample workouts in a separate browser-storage namespace and never changes your real log.` | 16 | Flag F-1-18 |
| `Logs weight × reps from the keyboard; 225x5, 100x8kg, and 135 × 10 all work.` | 13 | Flag F-1-26 |
| `Expands editable exercise aliases such as sq, bp, dl, and ohp.` | 11 | Pass; `editable-aliases` |
| `Starts a large rest timer after each set.` | 8 | Terminology flag F-1-15; behavior listed |
| `Keeps active workouts and completed read-only receipts in IndexedDB.` | 9 | Flags F-1-19 and F-1-33 |
| `Shares plain-text receipts and prints cleanly to paper or PDF.` | 10 | Pass; listed claims |
| `Exports every record as JSON or CSV and restores JSON backups.` | 11 | Pass; `data-portability` |
| `Installs as a PWA and reloads fully offline after the first visit.` | 12 | Flag F-1-20; offline behavior listed |
| `The free logger, aliases, fixed rest presets, receipts, and all data portability are complete and ungated.` | 16 | Flag F-1-27 |
| `A $9 one-time Pro license adds custom rest intervals and private receipt notes via the Sociobot hosted checkout.` | 18 | Listed, but the required run failed intermittently: F-1-3 |
| `No payment provider is embedded in this repository and no product ID is hardcoded.` | 14 | Flags F-1-21 and F-1-28 |
| `Requires Node.js 20 or newer.` | 5 | Flag F-1-29 |
| `The production work-order command is exactly:` | 6 | Pass |
| `It writes the deployable static application to ./dist, with index.html at the root and a generated precaching service worker.` | 19 | Flags F-1-22 and F-1-30 |
| `Playwright 1.58.2 is pinned.` | 4 | Pass; confirmed in `package.json` |
| `In the factory worker, Chromium is already present at $PLAYWRIGHT_BROWSERS_PATH; elsewhere install it once if necessary.` | 18 | Pass as setup instruction |
| `The suite covers parsing, receipt math, backup validation, keyboard entry, IndexedDB persistence, aliases, exact recovery regressions, touch geometry, demo isolation, privacy request capture, axe scans, and offline reloads.` | 28 | Flag F-1-16 |
| `Machine-readable product claims and their exact test commands are in .factory/claims.json.` | 11 | Pass |
| `Demo data and reset behavior are documented in .factory/demo.md.` | 9 | Pass |
| `There is no account, analytics, advertising, third-party font, or runtime CDN.` | 11 | Flags F-1-23 and F-1-31 |
| `Workout data stays in local IndexedDB.` | 6 | Flag F-1-19; privacy behavior listed |
| `A license token is stored in localStorage and sent only to api.sociobot.in for daily-at-most verification.` | 15 | Flag F-1-24; behavior exercised by `pro-features` |
| `See /privacy and /terms.` | 4 | Pass |
| `Deploy the contents of dist/ as a static site.` | 9 | Pass as instruction |
| `The host must fall back to index.html for /privacy and /terms.` | 11 | Pass as deployment requirement |
| `The factory owns infrastructure, DNS, billing registration, and the production checkout configuration.` | 12 | Pass as responsibility statement |
| `Visual rationale and generated-asset provenance are in .factory/design.md.` | 8 | Pass |
| `MIT licensed.` | 2 | Pass; `LICENSE` exists |

README headings `Set Receipt`, `What it does`, `Develop`, `Test`, `Privacy and
data`, and `Deploy` name their sections and pass. The `Live` and `Demo` URL
labels are direct and pass.

## Demo and sandbox evidence

- The landing action reaches `/demo` in one click.
- The sample contains three plausible Bench press sets: 185 lb × 5, 195 lb ×
  5, and 195 lb × 4. A completed sample receipt is available under Receipts.
- The persistent demo banner, `Reset demo`, and `Start for real` are present.
- Reset changed a two-row edited state back to all three rows and announced
  `Demo reset to sample data.`
- A real Squat 225 lb × 5 set remained unchanged after entering, editing,
  resetting, and leaving demo mode.
- The browser used distinct `set-receipt` and `set-receipt-demo` IndexedDB
  databases. All ordinary landing/demo requests were same-origin.
- F-1-2 records the missing above-the-fold sample. F-1-4 records the retained
  demo edit after exit.
- A fresh live worker controlled `/demo`; after going offline, reload worked
  and Deadlift 325 lb × 3 was logged with no console error.

## Listed claim results

Every exact command in `.factory/claims.json` was run after `npm ci`. Each
Playwright command exercised desktop Chromium and the 390 px mobile project.

| Claim | Result | Evidence |
| --- | --- | --- |
| `keyboard-receipt` | PASS | 2/2 |
| `editable-aliases` | PASS | 2/2 |
| `data-portability` | PASS | 2/2 |
| `receipt-share` | PASS | 2/2 |
| `print-receipt` | PASS | 2/2 |
| `erase-local-data` | PASS | 2/2 |
| `demo-sandbox` | PASS for real/demo separation | 2/2; lifecycle gap is F-1-4 |
| `local-private` | PASS | 2/2; live request log was same-origin |
| `offline-reload` | PASS | 2/2 and independent live offline flow |
| `pro-price` | **FAIL ON REQUIRED RUNS — BLOCKING** | 0/2 twice with HTTP 503; final retry later recovered to 2/2 |
| `pro-features` | PASS | 2/2 with recorded/mocked verification response |

The first exact `npm test` quality gate also failed only at `pro-price`: 7/7 Vitest
assertions passed, static route verification passed, and Playwright reported 36
passed, 2 expected mobile-only skips, and 2 failed. After the endpoint recovered,
a final full `npm test` rerun passed with 38 passed and 2 expected skips. The
observed visitor-facing outage and failed required runs remain F-1-3. `npm run
build` passed and produced `dist/`; initial JS is 31.59 kB raw and 11.31 kB gzip.

## History audit

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files, so
there are no earlier review finding IDs to preserve. The existing handoff and
verification records were still checked:

| Earlier issue | Current confirmation |
| --- | --- |
| Invalid set cleared the exercise | Fixed live: `2000.01x5` retained Squat and focus; correcting only the expression logged the set. |
| Service-worker update notice unreachable | Focused local update test passes in both projects; current worker uses a waiting-worker flow. |
| Raw malformed-JSON error | Fixed live: the message names invalid JSON, the required backup, and the retry action. |
| Production worker install/offline failure | Fixed live: one controlling worker, offline reload, and offline logging passed. |
| PR badge contrast | Fixed: live light/dark Axe scans after a PR found no serious/critical issue. |
| Erase retained settings | Fixed live: Pounds, 120 seconds, and default aliases returned after erase/reload. |
| Stale error masked later success | Fixed live: invalid-import feedback changed to `JSON backup exported.` after successful export. |
| Small mobile targets/navigation gaps | Fixed: no visible target under 44 × 44 in the exercised mobile state; focused tests pass. |
| Checkout returned 404 | **Intermittently regressed:** the prior handoff recorded 303; required runs received 503 before a final retry recovered to 303. See F-1-3. |
| Unknown route rendered logger | Fixed live: unknown path returns a designed HTTP 404 with recovery links. |

## Structure, links, accessibility, and identity

| Check | Result |
| --- | --- |
| Route titles | Demo, Privacy, Terms, and 404 patterns pass. Root fails plain-copy review because of unlisted `fast` (F-1-25). |
| One H1 and main landmark | Pass on `/`, `/demo`, `/privacy`, `/terms`, and live 404. |
| Description/canonical/favicon | Pass on all checked routes. |
| Open Graph/Twitter | Pass on app routes; missing on 404 (F-1-8). |
| Robots/sitemap | Pass; sitemap lists `/`, `/demo`, `/privacy`, and `/terms`. |
| Deep links and HTTP 404 | Pass. Privacy/Terms return 200; unknown route returns 404. |
| Browser Back and route focus | URL/title restore, but focus fails F-1-5. |
| Link crawl | First-party links and assets return expected 200/404. Sociobot home returns 200. `Buy Pro` returned 503 during required runs and 303 on a final retry (F-1-3). |
| Header/footer skeleton | Footer contains the required legal/factory information; header consistency fails F-1-7. |
| Landing information order | Fails F-1-1 and F-1-6. |
| Visual identity | Pass. The paper grid, cobalt plate/rest block, safety orange, hard rules/shadows, receipt geometry, and original lifting image are distinct from a generic SaaS template and match `.factory/design.md`. |
| Console/page errors | 0 during cold mobile, desktop, demo, legal, 404, and offline exercises. |
| Accessibility automation | Worker verifier passed. Axe CLI found 0 violations on `/`; Playwright Axe found 0 violations on all five routes and no serious/critical issue in live light/dark PR states. |
| Mobile layout | No horizontal overflow; touch-target smoke check passed. First-screen ordering still fails F-1-1/F-1-2. |
| Reduced motion | Covered by the passing focused project tests and CSS policy. |

## Missed leverage

No additional AI feature is justified. The brief is a fast local lifting log;
model calls would add delay, cost, and a network/privacy exception without
improving the core entry job. No provider key is embedded and no decorative AI
feature is present.

The obvious non-AI leverage is already present: JSON/CSV export, JSON restore,
plain-text sharing, print/PDF, aliases, offline operation, and a rest timer.
Cloud sync is not implied by the local/exportable brief. No missed-leverage
finding is added.

## What would make this perfect

Nothing can be left after this round. A perfect next candidate must:

1. Make the phone first screen name the job and expose the sample action before
   the rest timer.
2. Show at least one realistic sample row immediately after entering demo.
3. Discard demo edits on `Start for real` and keep real data isolated.
4. Restore the live $9 checkout so `pro-price` and the full suite pass.
5. Repair H1 focus/announcement for link, Back, and Forward navigation.
6. Supply the missing landing sections, consistent headers, and 404 social
   metadata.
7. Resolve every copy, terminology, and unlisted-claim finding above.
8. Rerun every exact claim command, `npm test`, `npm run build`, live offline
   logging, same-origin request capture, link crawl, phone/desktop screenshots,
   and stateful accessibility checks with zero findings.
