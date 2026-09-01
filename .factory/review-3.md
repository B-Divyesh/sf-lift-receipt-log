# First-read review 3 — Set Receipt

**Work order:** `lift-receipt-log-review-3`  
**Reviewed URL:** <https://lift-receipt-log.sociobot.in>  
**Reviewed:** 1 September 2026 UTC  
**Candidate:** `1bb604df2a8569b2f9d0c72c02df5413e9773d10`

## Verdict: PASS

No blocking or minor findings remain in the reviewed product scope. The live
site is clear, tryable, and consistent with its documented claims. No claims
test failed, and no claim-like landing or README sentence lacked a matching
claim entry.

## Cold first read

Fresh Chromium contexts were checked before scrolling at 390 × 844 and
1440 × 900.

| Question | Answer from the first screen |
| --- | --- |
| What does this do? | It logs lifting sets and saves a workout receipt. |
| Who is it for? | Lifters recording weight and reps during a workout. |
| What should I click first? | **Try it with sample data**; its adjacent text says it loads a separate sample log. |

At 390 px, the headline, audience sentence, sample action, outcome text,
three plain facts, and complete set form were visible before the fold. The
first load and demo load had no page or console errors. The phone surface uses
the documented paper grid, hard ink rules, cobalt receipt type, orange control,
and original weight-plate artwork. It reads as a lifting docket, not a generic
SaaS layout.

## Copy audit

Word counts treat contractions, dates, and number-unit examples as one word.
All sentences are at or below 22 words. Checked labels and actions use the
same terms: **set**, **workout**, **receipt**, **rest timer**, **alias**,
**demo**, and **this browser**. No plain-words banned marketing term, mood
heading, or non-result action was found.

### Landing and logger

| Sentence | Words | Check |
| --- | ---: | --- |
| Log sets. | 2 | Clear job headline. |
| Keep a workout receipt. | 4 | Clear outcome. |
| For lifters who record weight and reps during a workout. | 10 | Names audience and situation. |
| Loads a separate sample log. | 5 | `demo-sandbox`. |
| Works offline after your first visit. | 6 | `offline-reload`. |
| Workout data stays in this browser. | 6 | `local-private`. |
| Free core tools. | 3 | `free-core`. |
| Pro extras cost $9 once. | 5 | `pro-price`. |
| Try 225x5, 100x8kg, or 135 × 10. | 6 | `keyboard-receipt`. |
| 2 min default · starts after each set. | 7 | `keyboard-receipt`. |
| Log sets, then finish the workout to save its receipt. | 10 | `keyboard-receipt`. |
| Enter an exercise and weight × reps. | 6 | `keyboard-receipt`. |
| Rest with the timer that starts after each set. | 9 | `keyboard-receipt`. |
| Finish the workout to file and share its receipt. | 9 | `keyboard-receipt`, `receipt-share`. |
| It does not give training or injury advice. | 8 | `no-training-advice`. |
| Workout data stays in this browser until you export or share it. | 12 | `local-private`, `data-portability`, `receipt-share`. |
| Pro adds custom rest intervals and private notes on finished receipts. | 11 | `pro-features`. |
| Workout data stays in this browser. | 6 | `local-private`. |
| Pro checks use Sociobot. | 4 | `pro-features`, `verified-license-only`. |
| Built by Param Factory · v1.0.1 · Generated editorial image. | 8 | Attribution and asset provenance. |

Checked standalone headings and actions: `LOCAL WORKOUT LOG`, `REST TIMER`,
`HOW IT WORKS`, `Log a workout in three steps`, `PRIVACY AND LIMITS`, `What
Set Receipt does not do`, `PRO FEATURES`, `Set Receipt Pro: $9 once`, `Start
rest timer`, `Reset rest timer`, `Log set`, `Try it with sample data`, and
`See Pro purchase`. They name a destination, section, or result. `Privacy`
and `Terms` are links, not misleading button labels.

### README

| Sentence | Words | Check |
| --- | ---: | --- |
| Set Receipt logs lifts from the keyboard and stores them in this browser. | 13 | `keyboard-receipt`, `local-private`. |
| It is for lifters who record weight and reps during a workout. | 12 | Clear audience. |
| Enter 225x5, then finish the workout to keep a workout receipt. | 11 | `keyboard-receipt`. |
| It opens a sample Bench press workout in separate browser storage and does not change your workout log. | 18 | `demo-sandbox`. |
| Logs weight × reps; 225x5, 100x8kg, and 135 × 10 work. | 9 | `keyboard-receipt`. |
| Reports separate lb-reps and kg-reps totals when a workout mixes units. | 11 | `unit-aware-volume`. |
| Merges sets logged from two open tabs instead of replacing either set. | 12 | `tab-safe-logging`. |
| Expands editable exercise aliases such as sq, bp, dl, and ohp. | 11 | `editable-aliases`. |
| Starts a rest timer after each set, stops at DONE, and announces completion. | 13 | `keyboard-receipt`, `timer-completion`. |
| Keeps active workouts and finished receipts in this browser’s storage. | 10 | `keyboard-receipt`, `local-private`. |
| Shares plain-text receipts and prints cleanly to paper or PDF. | 10 | `receipt-share`, `print-receipt`. |
| Exports every record as JSON or CSV and restores JSON backups. | 11 | `data-portability`. |
| Reloads and logs offline after the first visit. | 8 | `offline-reload`. |
| The free logger includes aliases, fixed rest presets, receipts, export, and import. | 12 | `free-core`, `data-portability`. |
| A $9 one-time Pro license adds custom rest intervals and private receipt notes through Sociobot checkout. | 16 | `pro-price`, `pro-features`. |
| Sociobot/Dodo is the merchant of record. | 6 | `purchase-terms`. |
| Refunds are handled there and automatically revoke the Pro license. | 10 | `purchase-terms`. |
| Build the deployable site with: | 5 | Useful development instruction. |
| Playwright 1.58.2 is pinned. | 4 | Confirmed in `package.json`. |
| In the factory worker, Chromium is already available. | 8 | Useful environment instruction. |
| Elsewhere, install it once if necessary. | 6 | Useful development instruction. |
| Tests cover logging, receipts, backups, aliases, demo isolation, privacy, accessibility, and offline reloads. | 13 | Confirmed by `npm test`. |
| Machine-readable product claims and their exact test commands are in `.factory/claims.json`. | 11 | Confirmed. |
| Demo data and reset behavior are documented in `.factory/demo.md`. | 9 | Confirmed. |
| Workout data stays in this browser during ordinary logging. | 9 | `local-private`. |
| The app loads no analytics, ads, external fonts, or third-party scripts. | 11 | `no-third-party-assets`. |
| The browser stores your license token and checks it with `api.sociobot.in` no more than once a day. | 17 | `pro-features`. |
| A new token enables Pro only after that check succeeds. | 10 | `verified-license-only`. |
| An already verified valid token can keep Pro active offline. | 10 | `verified-license-only`. |
| Opening Setup checks Sociobot checkout availability without sending workout data. | 10 | `pro-price`, `local-private`. |
| See `/privacy` and `/terms`. | 4 | Both product routes checked. |
| Deploy `dist/` as a static site with `/privacy`, `/terms`, and `/?demo=1` routed to the app and unknown routes served by `404.html`. | 21 | Confirmed by static-route test and live route checks. |
| Visual rationale and generated-asset provenance are in `.factory/design.md`. | 8 | Confirmed. |
| MIT licensed. | 2 | Confirmed by `LICENSE`. |

`What Set Receipt does` is a contextual README heading. No README sentence is
over the length limit or uses inconsistent product terminology.

## Demo and sandbox

The first-click action opened `/?demo=1`. On a fresh 390 px context, the
persistent banner, **Reset demo**, **Start for real**, `Sample workout`, and
seeded set rows appeared immediately. The request log for the complete normal
demo load contained only the product origin and its self-hosted JS and CSS.

The exact `demo-sandbox` claim test passed from a clean clone. It confirms
separate `set-receipt-demo` storage, a visible seeded sample, reset reseeding,
and exit discarding demo changes while preserving the real log. The exact
`offline-reload` test also passed using a dedicated fresh context.

## Claims and checks

The repository was cloned afresh under `/tmp`, dependencies were installed,
and every exact command in `.factory/claims.json` completed successfully in
the configured desktop and 390 px projects.

| Claim | Result |
| --- | --- |
| `keyboard-receipt` | PASS |
| `unit-aware-volume` | PASS |
| `tab-safe-logging` | PASS |
| `editable-aliases` | PASS |
| `free-core` | PASS |
| `data-portability` | PASS |
| `receipt-share` | PASS |
| `print-receipt` | PASS |
| `erase-local-data` | PASS |
| `demo-sandbox` | PASS |
| `local-private` | PASS |
| `no-third-party-assets` | PASS |
| `no-training-advice` | PASS |
| `offline-reload` | PASS |
| `timer-completion` | PASS |
| `pro-price` | PASS |
| `pro-features` | PASS |
| `verified-license-only` | PASS |
| `purchase-terms` | PASS |

`npm test` passed: 8 unit tests, static route/copy/claim verification, and 64
Playwright tests. `npm run build` also passed and produced `dist/` with a
40 kB JavaScript bundle and 20 kB CSS file before gzip.

## Structure and routing

Checked `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, `/?view=history`,
`/?view=settings`, and an unknown path. Known routes returned 200 with one
H1, main content, title, description, canonical URL, Open Graph/Twitter data,
favicon, shared navigation, footer, and no console/page error. The unknown
path returned the designed 404 at HTTP 404 with recovery links and complete
metadata. Same-origin links were checked and resolved correctly. The single
outbound contact link is intentionally not opened because this work order
limits checks to `sf-lift-receipt-log` resources.

Privacy navigation moved focus to its H1 and set `Privacy — Set Receipt`.
Browser Back restored focus to the landing H1 and restored the landing title.
The static configuration supplies the required headers, 404 override, and
history fallback behavior.

## Earlier findings rechecked

Every earlier review finding was checked against the live product and current
source. None is unfixed, half-fixed, or regressed.

| Earlier id | Current confirmation |
| --- | --- |
| F-1-1 | Phone first screen exposes the sample action and outcome. |
| F-1-2 | Phone demo first screen shows the sample workout. |
| F-1-3 | Recorded available and unavailable checkout states pass `pro-price`. |
| F-1-4 | Demo exit clears its separate storage and re-entry reseeds it. |
| F-1-5 | Route navigation and Back move focus to the new H1. |
| F-1-6 | Landing includes workflow, limits, and paid sections. |
| F-1-7 | App, legal, and static 404 pages retain the shared navigation/footer. |
| F-1-8 | Static 404 has product social metadata. |
| F-1-9 | H1 states the job and receipt result. |
| F-1-10 | Empty-state heading names finished workout receipts. |
| F-1-11 | Timer action says `Start rest timer`. |
| F-1-12 | Timer reset says `Reset rest timer`. |
| F-1-13 | The removed spinner slogan is absent. |
| F-1-14 | Footer names browser storage and Pro-check scope. |
| F-1-15 | Public copy uses `rest timer` consistently. |
| F-1-16 | README test statement is short and useful. |
| F-1-17 | README opening is plain and names browser storage. |
| F-1-18 | README demo text names sample and isolation plainly. |
| F-1-19 | User-facing README omits database jargon. |
| F-1-20 | README keeps the tested offline statement only. |
| F-1-21 | Payment implementation jargon is absent. |
| F-1-22 | Service-worker implementation jargon is absent. |
| F-1-23 | Third-party-asset statement is plain and tested. |
| F-1-24 | License-check wording is plain and tested. |
| F-1-25 | No unmeasured `fast` promise remains in metadata. |
| F-1-26 | All advertised input formats are exercised by the claim. |
| F-1-27 | Free core behavior is registered and tested. |
| F-1-28 | Repository payment-integration statements are absent. |
| F-1-29 | Unsupported runtime-version promise is absent. |
| F-1-30 | Build-output wording is documented and statically checked. |
| F-1-31 | Privacy and asset claims are narrow and tested. |
| F-1-32 | The unmeasured notebook-speed comparison is absent. |
| F-1-33 | Receipt label is `COMPLETED WORKOUT`, not immutable/read-only. |
| F-1-34 | Merchant statement is consistent and covered by `purchase-terms`. |
| F-1-35 | Unsupported card-handling promise is absent. |
| F-1-36 | Refund/revocation terms are registered and tested. |
| F-1-37 | Untestable future-backup promise is absent. |
| F-2-1 | Untested installation promise is absent. |
| F-2-2 | No-advice statement is registered and tested. |
| F-2-3 | `Compact` receipt claim is absent. |
| F-2-4 | Storage boundary consistently says `this browser`. |
| F-2-5 | Active record is called `ACTIVE WORKOUT`. |
| F-2-6 | Banned `unlock` label is absent. |
| F-2-7 | Vague ready slogan is absent. |
| F-2-8 | Privacy eyebrow names workout and license data. |
| F-2-9 | Terms eyebrow names use and Pro license terms. |
| F-2-10 | Receipt-list eyebrow says `FINISHED WORKOUTS`. |
| F-2-11 | Setup eyebrow says `LOGGING, DATA, AND PRO`. |
| F-2-12 | Custom-rest control says `Save rest time`. |
| F-2-13 | README explicitly identifies lifters as the audience. |
| F-2-14 | README heading says `What Set Receipt does`. |

## Missed leverage

No further expected capability is missing from the brief. The product includes
the directly implied offline logging, receipt, rest timer, aliases, print/share,
and JSON/CSV portability paths. An AI feature would not improve the stated
quick set-recording job and is appropriately absent.

## What would make this perfect

Keep the exact claim commands, clean demo fixture, and 390 px first-screen
assertion in the release gate. They protect the clarity and isolation that make
this product immediately usable.
