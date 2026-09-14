ETimer V40

Changes:
- Auth screen no longer renders the Eugesta logo image.
- Google Sheets date/time values for monthly records and recent records are read with getDisplayValues(), so the app shows exactly the same wall-clock values as the spreadsheet, independent of Apps Script timezone.
- Existing seconds precision is preserved.
- Existing V39 features and deduplication logic are retained.

Apps Script:
- Replace Code.gs and update the existing TimerAI deployment.
- No new deployment URL is required.

PWA:
- Open index.html from this folder.
