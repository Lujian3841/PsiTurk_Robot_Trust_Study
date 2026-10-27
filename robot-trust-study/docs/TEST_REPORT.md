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
