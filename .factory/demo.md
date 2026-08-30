# Set Receipt demo

- URL: `https://lift-receipt-log.sociobot.in/demo` (local: `http://127.0.0.1:4173/demo`).
- Entry: choose **Try it with sample data** on the logger. No account or setup is required.
- Sample: an open three-set bench-press workout, one completed deadlift receipt, a private note, and an `rdl` alias.
- Storage: demo changes use the separate IndexedDB database `set-receipt-demo`. The real log remains in `set-receipt`; demo mode does not read license storage or call license verification.
- Reset: choose **Reset demo** in the persistent demo banner.
- Exit: choose **Start for real**. It deletes the demo database before opening
  the real logger, so a later `/demo` visit starts from the shipped sample.
- Offline: visit the demo once, wait for service-worker control, then it can be reloaded and edited offline.
