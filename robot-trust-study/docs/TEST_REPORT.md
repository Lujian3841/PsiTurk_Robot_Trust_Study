# Test report

## Experiment copy 1.2.0 — November 10, 2026

The separate experiment copy was checked against psiTurk 3.3.1 using Python 3.10 and a temporary SQLite database. The native integration test passed fresh installation, refusal to overwrite an existing folder, byte-for-byte media copying, consent and experiment template rendering, assignment of all four combinations across four fresh sessions, saving and loading through `/sync`, session completion, native CSV export with matching participant IDs, and SQLite backup. This used Flask's test client, not a deployed public server.

The browser suite also passed all four complete paths, timeouts and partial responses, age validation, and mocked psiTurk save/retry/completion checks with Chromium 134. No study dialogue, videos, or rating items were changed in this copy.

Run `python tests/native-check.py` in a working psiTurk environment to repeat the native test. It creates its own temporary project and never uses the collection database. The test environment used cryptography 38.0.4 and setuptools 80.10.2 for compatibility with psiTurk 3.3.1's older dependencies; the user's existing working environment should be reused.

**Still required on the Ubuntu VM:** a complete Firefox pilot covering audible sound, full video playback, page layout, timing, the saved confirmation, and an export. The automated browser media check simulates the video's ended event. These tests do not certify audio playback or the 10–12 minute duration on the VM.

The following report records earlier presentation checks; it is historical, not a new layout certification.

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

## Remaining VM checks at version 1.1.0

The browser tests use a mocked psiTurk connection. They do not verify the live server, its assignment service, database persistence, or exported CSV files.

The final VM check needs to cover Firefox audio, complete video playback, fresh psiTurk sessions, and actual exports. A timed pilot is also needed to check the 10–12 minute target. Smaller windows or browser zoom may require scrolling; the layout keeps content accessible rather than clipping it.
