# Verification report

Tested in headless Chromium using Playwright. All listed checks passed. Exact test output is in `browser-test-results.txt`; the repeatable test script is in `tests/browser-check.cjs`.

- Four full preview flows: condition/counterbalance 0/0, 0/1, 1/0, 1/1.
- Both robots appear once in the intended order and with the intended labels.
- Correct mapping of displayed authority choice to underlying philosophy.
- Both sets of ratings, demographics, and reflection retained.
- Preview CSV data contains matching participant IDs across files.
- All timed pages advance on expiration; partially completed ratings and text remain saved; missing ratings stay null.
- Explicit consent decline records no study trials; age bounds reject 17 and 81.
- Sound/video check rejects answers submitted before playback completion. Automated flow tests simulate the video's ended event; these tests do not assess human audibility.
- Responsive demographic form at 390-pixel width does not overflow horizontally.
- Mocked psiTurk adapter verifies native API routing, preference for server allocation over query parameters, preservation of the countdown deadline after reload, and retry after a failed final save. Completion is not allowed before the final save succeeds.
- No uncaught JavaScript exceptions across these flows.
- JavaScript syntax and Python installer compilation checked.
- Installer exercised against the official psiTurk 3.3.1 example from its distribution wheel. Experiment, advertisement, and consent-introduction templates rendered with Jinja; vendor dependency order and removal of the sample task were verified.
- Included check media verified as a six-second H.264/AAC MP4.
- Instruction screenshot captured from the actual interface with neutral example response text, avoiding exposure to either moral position before the experiment. Layout visually inspected.

## Limits

The real course psiTurk server, its balanced allocation service, native database persistence, and `download_datafiles` output were not available for end-to-end verification. The adapter tests use a mock of the documented API, not a real server. Complete the README's server demo checklist before submitting. Robot videos are deliberately absent; their playback, voice matching, durations, and the target human completion time require a pilot after insertion. No human participant data was collected.

## November 3, 2026 presentation revisions (v1.1.0)

Built on GitHub commit `cda2cb67a3f6526618a42faf1fd94b5bb18003fa`, including the existing 22 configured robot videos. All audio/video files, configured video paths, and recorded robot dialogue remain unchanged. The instruction screenshot was refreshed.

Validation run using Playwright with Chromium 134 headless, loading repository assets through request routing:

- All four order/label combinations completed; question/trial ID linkage and authority mapping passed.
- All timed-page exits passed, including partial answers and nulls for missing answers.
- Mocked psiTurk save failure/retry, completion gating, and reload deadline recovery passed.
- Consent and all required forms disable forward submission until valid. Age 17 and fractional ages are rejected; 18 and 81 have no upper-bound restriction.
- Setup Previous buttons restore demographic, media, and comprehension answers. Reaccepting consent preserves the original session start and allocation.
- Media check requires clip completion and correct answers. Incorrect instruction answers show feedback; attempts and the passing response are saved in question data.
- Every participant page and all robot replies/follow-ups fit a 1366×768 CSS-pixel viewport without page scrolling at 100% zoom. Smaller screens or browser zoom may scroll to keep controls accessible; nothing is clipped to force a fit.
- Opening-video metadata loaded. Automated media events are not a substitute for listening to every clip in the VM.
- No uncaught JavaScript errors. JavaScript syntax and `git diff --check` passed.

Run from the `robot-trust-study` directory with Playwright installed:

```sh
node tests/browser-check.cjs
node tests/revision-check.cjs
```

Set `STUDY_BROWSER` to an installed Chromium executable if needed. The tests route local repository files directly, so no HTTP server is required. `revision-check.cjs` refreshes the task screenshot. Earlier sections describe the original version; this section records the revised checks. The real psiTurk server, database exports, Firefox playback, and classroom timing still need a final check in the Ubuntu VM.
