# Set Receipt — adversarial review 2 handoff

## Status: review complete, product verdict FAIL

This work order did not modify product code. It added
[`review-2.md`](review-2.md), which records one blocking regression and
fourteen additional findings against candidate
`92b3564797582bf1eea8146903b1e1a76f7c9038` and the live site.

The blocking regression is `F-1-33`: the unsupported `read-only receipts`
claim has returned as `IMMUTABLE TRAINING RECORD`. The tagged test proves a
finished workout survives reload, not immutability, and finished receipt notes
remain editable.

## Verification performed

- Opened the live site cold in fresh 390 × 844 and 1440 × 900 Chromium
  contexts and captured the above-fold text and screenshots.
- Exercised the live one-click demo, visible sample rows, Reset, Start for real,
  separate IndexedDB namespaces, real-data preservation, and demo reseeding.
- Confirmed service-worker control, offline reload, and offline logging in a
  dedicated browser context.
- Recorded live requests during the demo; no cross-origin request occurred.
- Crawled all links found across `/`, `/demo`, `/privacy`, `/terms`, and the
  designed 404; all intentional targets returned 200 after redirects.
- Ran all 13 exact `.factory/claims.json` commands separately from a fresh
  temporary clone. Every command passed in both configured projects.
- Ran `npm test`: 7 unit tests passed, static verification passed, and
  Playwright reported 45 passed / 3 expected skips.
- Ran `npm run build`: passed and produced `dist/`; initial JavaScript was
  11.74 kB gzip.
- Ran `/opt/fleet/lib/verify-url.sh` against the live root: passed with no
  console errors or basic semantic/alt failures. The repository's Playwright
  Axe checks passed all tested routes in light and dark modes.

## Files changed

- `.factory/review-2.md` — full verdict, findings, exhaustive landing/README
  copy audit, claim results, demo evidence, structure checks, and all 37 prior
  finding rechecks.
- `.factory/handoff.md` — this review handoff.

## Work remaining

Resolve every finding in `review-2.md`, beginning with blocking `F-1-33`.
After repair, repeat the full cold-read review rather than checking only the
changed copy.
