# Set Receipt copy audit

Audited 30 August 2026 after polish round 2. Counts treat displayed numbers and
contractions as one word. No public sentence exceeds 22 words or contains a
banned marketing word. Storage is consistently described as browser-scoped.

## Landing and logger sentences

| Copy | Words | Evidence |
| --- | ---: | --- |
| Log sets. | 2 | Plain job headline |
| Keep a workout receipt. | 4 | `keyboard-receipt` |
| For lifters who record weight and reps during a workout. | 10 | Audience sentence |
| Loads a separate sample log. | 5 | `demo-sandbox` |
| Works offline after your first visit. | 6 | `offline-reload` |
| Workout data stays in this browser. | 6 | `local-private` |
| Free core tools. | 3 | `free-core` |
| Pro extras cost $9 once. | 5 | `pro-price` |
| Try 225x5, 100x8kg, or 135 × 10. | 6 | `keyboard-receipt` |
| No sets yet. | 3 | Empty state |
| Your first line becomes the first row. | 7 | `keyboard-receipt` |
| Enter an exercise and weight × reps. | 6 | `keyboard-receipt` |
| Rest with the timer that starts after each set. | 9 | `keyboard-receipt` |
| Finish the workout to file and share its receipt. | 9 | `keyboard-receipt`, `receipt-share` |
| It does not give training or injury advice. | 8 | `no-training-advice` |
| Workout data stays in this browser until you export or share it. | 12 | `local-private`, `data-portability`, `receipt-share` |
| Pro adds custom rest intervals and private notes on finished receipts. | 11 | `pro-features` |
| Log sets, then finish the workout to save its receipt. | 10 | `keyboard-receipt` |
| Workout data stays in this browser. | 6 | `local-private` |
| License checks use Sociobot. | 4 | `pro-features` |
| Built by Param Factory · v1.0.0 · Generated editorial image. | 8 | Attribution and provenance |

## Demo, legal, and recovery sentences

| Copy | Words | Evidence |
| --- | ---: | --- |
| Demo — sample data, nothing is saved to your log. | 9 | `demo-sandbox` |
| Your workout log stays in this browser. | 8 | `local-private` |
| Ordinary logging does not send workout data to us. | 9 | `local-private` |
| That page is not in your log. | 7 | Designed 404 test |
| Use the logger to record a set, or open the sample workout. | 12 | 404 recovery links test |
| Set Receipt is a personal record-keeping utility, not training, medical, or injury advice. | 13 | `no-training-advice` |

## Headings, labels, and actions reviewed in round 2

| Copy | Result |
| --- | --- |
| LOCAL WORKOUT LOG | Names the product surface; no vague status slogan |
| ACTIVE WORKOUT | Distinguishes an unfinished workout from a receipt |
| COMPLETED WORKOUT | Does not claim immutability |
| FINISHED WORKOUTS | Names the receipt list |
| LOGGING, DATA, AND PRO | Names the Setup contents |
| PRO FEATURES | Replaces the banned “unlock” label |
| WORKOUT AND LICENSE DATA | Names the Privacy scope |
| USE AND PRO LICENSE TERMS | Names the Terms scope |
| Save rest time | Names the saved result |
| Try it with sample data | Opens `/?demo=1` in one click |
| Reset demo / Start for real | Reset or discard isolated demo data |

## README sentences

| Copy | Words | Evidence |
| --- | ---: | --- |
| Set Receipt logs lifts from the keyboard and stores them in this browser. | 13 | `keyboard-receipt`, `local-private` |
| It is for lifters who record weight and reps during a workout. | 12 | Audience sentence |
| Enter 225x5, then finish the workout to keep a workout receipt. | 11 | `keyboard-receipt` |
| It opens a sample Bench press workout in separate browser storage and does not change your workout log. | 18 | `demo-sandbox` |
| Logs weight × reps; 225x5, 100x8kg, and 135 × 10 work. | 9 | `keyboard-receipt` |
| Expands editable exercise aliases such as sq, bp, dl, and ohp. | 11 | `editable-aliases` |
| Starts a rest timer after each set. | 7 | `keyboard-receipt` |
| Keeps active workouts and finished receipts in this browser’s storage. | 10 | `keyboard-receipt`, `local-private` |
| Shares plain-text receipts and prints cleanly to paper or PDF. | 10 | `receipt-share`, `print-receipt` |
| Exports every record as JSON or CSV and restores JSON backups. | 11 | `data-portability` |
| Reloads and logs offline after the first visit. | 8 | `offline-reload` |
| The free logger includes aliases, fixed rest presets, receipts, export, and import. | 12 | `free-core`, `data-portability` |
| A $9 one-time Pro license adds custom rest intervals and private receipt notes through Sociobot checkout. | 16 | `pro-price`, `pro-features` |
| Tests cover logging, receipts, backups, aliases, demo isolation, privacy, accessibility, and offline reloads. | 13 | Full test suite |
| Workout data stays in this browser during ordinary logging. | 9 | `local-private` |
| The app loads no analytics, ads, external fonts, or third-party scripts. | 11 | `no-third-party-assets` |
| The browser stores your license token and checks it with api.sociobot.in no more than once a day. | 17 | `pro-features` |

## Terminology

| Concept | One term |
| --- | --- |
| One recorded effort | set |
| One training session before completion | workout |
| Finished workout record | receipt |
| Exercise shorthand | alias |
| Countdown after a set | rest timer |
| Portable full backup | JSON backup |
| Isolated sample mode | demo |
| Storage boundary | this browser |
| Paid one-time tier | Pro |
