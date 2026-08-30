# Polish round 1 — Set Receipt

Candidate repaired from `a7d4ba516ac092d3105ef8b4d9d7a8eb99017bff` after
`review-1.md`. Local evidence uses `f437c55b870dc31efa347698b353e895a9880e03`.
The deployed verification URL is `https://lift-receipt-log.sociobot.in`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Moved the headline, sample action, and its outcome above utilities on 390 px. | `mobile first screen exposes…`; `test-results/evidence/mobile-first-screen.png` |
| F-1-2 | Demo renders its seeded receipt before the entry form and rest timer. | `@claim:demo-sandbox`; `test-results/evidence/mobile-demo-first-screen.png` |
| F-1-3 | Kept the live Sociobot checkout path, $9 display, catalogue-price, and 303/Dodo redirect checks. | `@claim:pro-price` from clean clone |
| F-1-4 | `Start for real` deletes `set-receipt-demo` before loading `/`. | `@claim:demo-sandbox` exit/re-entry regression |
| F-1-5 | Route H1s receive `tabindex=-1`, focus after link/Back/Forward, and a polite route announcement. | `moves focus and announces…` |
| F-1-6 | Added How it works, limits/privacy, and exact $9 Pro sections after the logger. | landing screenshot and browser suite |
| F-1-7 | Legal SPA screens now use the same Log/Receipts/Setup header; the static 404 has the same destinations. | route and link tests |
| F-1-8 | Added route-specific Open Graph and Twitter metadata to `404.html`. | `npm run test:static` |
| F-1-9 | Rewrote the H1 as “Log sets. Keep a workout receipt.” | mobile-first screenshot |
| F-1-10 | Replaced the empty-state heading with “Finished workouts become receipts.” | accessibility/browser suite |
| F-1-11 | Renamed the timer action to “Start rest timer.” | mobile-first screenshot |
| F-1-12 | Renamed the timer action to “Reset rest timer.” | browser suite |
| F-1-13 | Removed “No loading spinner.” | copy audit |
| F-1-14 | Replaced vague footer privacy language with the storage boundary. | `@claim:local-private`, copy audit |
| F-1-15 | Standardized the feature name as “rest timer.” | repository copy scan and browser suite |
| F-1-16 | Rewrote README test instructions into short plain sentences. | `.factory/copy-audit.md` |
| F-1-17 | Rewrote README opening in plain device-storage language. | README review |
| F-1-18 | Rewrote README demo explanation without storage jargon. | README review |
| F-1-19 | Rewrote browser-storage explanation without database jargon. | README review |
| F-1-20 | Rewrote install language as “Installs as an app.” | README review |
| F-1-21 | Removed repository payment implementation copy. | README review |
| F-1-22 | Removed service-worker implementation jargon from README. | README review |
| F-1-23 | Rewrote and tested the no-third-party-assets sentence. | `@claim:no-third-party-assets` |
| F-1-24 | Rewrote license-check wording in plain language. | `@claim:pro-features` |
| F-1-25 | Removed unmeasured “fast” from titles, OG metadata, and manifest. | `npm run test:static`; metadata browser test |
| F-1-26 | Expanded keyboard claim coverage to all three advertised input formats. | `@claim:keyboard-receipt` |
| F-1-27 | Added an unlicensed free-core claim and end-to-end regression. | `@claim:free-core` |
| F-1-28 | Removed repository payment-integration claims. | README review |
| F-1-29 | Removed unsupported Node-version compatibility claim. | README review |
| F-1-30 | Removed build-artifact promise from user copy. | README review |
| F-1-31 | Narrowed privacy copy and added a route request capture claim. | `@claim:local-private`, `@claim:no-third-party-assets` |
| F-1-32 | Rewrote the audience sentence without a notebook-speed comparison. | mobile-first screenshot |
| F-1-33 | Removed unsupported “read-only” receipt wording. | README review |
| F-1-34 | Removed unsupported merchant-of-record wording. | legal-page review |
| F-1-35 | Removed unsupported card-data promise. | legal-page review |
| F-1-36 | Removed unsupported refund/revocation promise. | legal-page review |
| F-1-37 | Removed the untestable future backup-compatibility promise. | legal-page review |

All claim commands are also run individually from a fresh clone before final
handoff. The full unit, static, Playwright, accessibility, privacy, offline,
and build suite passed locally before deployment verification.
