# Set Receipt — independent verification 4 handoff

## Status: FAIL

**Work order:** `lift-receipt-log-verify-4`
**Candidate:** `01f2a4901b9aa41063aa84c047d3d4974f416fa7`
**Live URL:** https://lift-receipt-log.sociobot.in
**Full evidence:** `.factory/verification-4.md`

The deployment exactly matches the candidate, and the prior production
service-worker installation and PR-contrast failures are repaired. Release is
still blocked by three P2 acceptance defects:

1. **Erase misrepresents its scope:** after selecting kg and a 180-second rest,
   **Erase all local data** confirms that settings will be erased but preserves
   both values.
2. **Recovery feedback is stale:** after malformed JSON import, valid JSON
   export, workout finish, and receipt share/copy can succeed while the visible
   toast continues to announce the old import error.
3. **Touch targets fail the supplied baseline:** at 390 px, the home link is
   50 × 40 px, Privacy is 42.625 × 19.5 px, Terms is 35.391 × 19.5 px, header
   navigation gaps are 2 px, and the update Refresh button is 73.578 × 36 px.
   Required minima are 44 × 44 px and 8 px between adjacent targets.

## Verification summary

From a clean checkout at the candidate:

```sh
npm ci
npm audit --omit=dev
npm test
npm run build
```

- Audit: 0 vulnerabilities.
- Vitest: 7/7 passed.
- Playwright: 19 passed, 1 intentional mobile-only skip, 0 failed.
- Exact build passed TypeScript and Vite/service-worker generation. Output is
  27,410 B JS (10.14 kB gzip), 16,591 B CSS (4.43 kB gzip), and 38,168 B hero
  WebP. No separate lint command exists.
- Core keyboard logging, normal/boundary/invalid set grammar, recovery without
  losing the exercise, aliases, timer, Remove/Undo, receipt totals/PRs,
  JSON/CSV export, valid JSON restore, receipt persistence, and mocked license
  capture/verification were exercised.
- Fresh local and live workers installed and controlled the page. Live offline
  reload, offline logging, and another offline persistence reload passed. A
  changed candidate worker waited, displayed Refresh, activated, and reloaded.
- Axe found 0 serious/critical issues across live logger/privacy/terms in both
  themes and both viewports, including logged PR states. Reduced motion and
  visible focus passed; the manual target-size/spacing failure remains.
- Normal-use request capture found no third-party requests. Security headers and
  caching policy passed. Every checked deployed artifact matched local `dist/`
  byte-for-byte.
- Live Lighthouse mobile: 96/100/100/100; LCP 1,203 ms, CLS 0, total transfer
  69,752 B.

## Next step

Repair the three P2 defects, add automated regressions for post-error success,
erase semantics, and all-state target geometry, deploy the new candidate, then
repeat the live verification matrix in `.factory/verification-4.md`.
