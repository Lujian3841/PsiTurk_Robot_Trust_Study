# Test report

## Version 1.1.0 — November 3, 2026

Browser checks used Playwright with Chromium 134 in headless mode. Tests loaded repository files through request routing. The results below cover the presentation revisions, including the existing robot videos.

## Completed checks

- All four condition/counterbalance combinations completed with the expected order and labels.
- Both robot questionnaires, authority choices, demographics, and final comments were retained.
- Trial and question records used the same participant ID.
- Timed pages saved partial answers and moved on. Missing ratings remained null.
- Consent and required forms kept forward buttons disabled until valid.
- Age 17 and fractional ages were rejected; age 81 was accepted.
- Setup Previous buttons restored answers without resetting the session start or robot order.
- The media check required playback completion and correct answers. Tests simulated the ended event for this check.
- Incorrect instruction answers showed feedback. Retry history and the passing response were saved in question data.
- Every participant page and all robot replies/follow-ups fit at 1366×768 CSS pixels and 100% zoom.
- The demographic page had no horizontal overflow at 390 pixels wide.
- Opening-video metadata loaded.
- The mocked psiTurk adapter passed assignment, reload-deadline, failed-save retry, and completion checks.
- No uncaught JavaScript errors occurred. JavaScript syntax, Python installer compilation, and Git whitespace checks passed.
- All 67 audio/video files, 22 video paths, and recorded robot scripts were preserved. The instruction screenshot was updated.

## Running the tests

From the `robot-trust-study` directory with Playwright installed:

```sh
node tests/browser-check.cjs
node tests/revision-check.cjs
```

Set `STUDY_BROWSER` to an installed Chromium executable if needed. No HTTP server is required because the tests load local files through request routing. The revision test refreshes `static/media/task-example.png`.

The main test output is in `browser-test-results.txt`.

## Remaining VM checks

The browser tests use a mocked psiTurk connection. They do not verify the live server, its assignment service, database persistence, or exported CSV files.

The final VM check needs to cover Firefox audio, complete video playback, fresh psiTurk sessions, and actual exports. A timed pilot is also needed to check the 10–12 minute target. Smaller windows or browser zoom may require scrolling; the layout keeps content accessible rather than clipping it.
