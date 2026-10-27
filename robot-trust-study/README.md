# Robot decisions — psiTurk study

A within-subject classroom experiment: every participant encounters two scripted robot characters making different decisions in the same rescue dilemma. Built with plain JavaScript and psiTurk's native data API; no jsPsych dependency is required.

## 1. Preview immediately

Extract the ZIP and open `preview.html` in a modern desktop browser. If your browser blocks local media, open a terminal in this folder and run:

```sh
python -m http.server 8000
```

Then visit http://localhost:8000/preview.html . Complete the study to download this session's `trialdata.csv` and `questiondata.csv`. Preview files are a readable demonstration format, not a substitute for actual psiTurk exports. No server/database is connected in preview mode. Every new preview uses a new ID and independently randomizes order and labels; repeating an order is valid.

To demonstrate all four combinations deterministically, use:

- http://localhost:8000/preview.html?condition=0&counterbalance=0
- http://localhost:8000/preview.html?condition=0&counterbalance=1
- http://localhost:8000/preview.html?condition=1&counterbalance=0
- http://localhost:8000/preview.html?condition=1&counterbalance=1

These overrides work only in the standalone preview. psiTurk uses its server-assigned values.

## 2. Install in your course's psiTurk environment

This is a source overlay for a fresh psiTurk example, not a replacement for installing psiTurk. Use your course's functioning psiTurk installation (Linux, macOS, or the course's WSL/VM setup). Do not install over an unrelated existing study.

1. In a separate directory run `psiturk-setup-example` to create a fresh example.
2. Run this installer, replacing the paths with yours:

```sh
python /path/to/robot-trust-study/install_into_psiturk.py /path/to/psiturk-example
```

3. Open the target project's `config.txt`. Under `[Task Parameters]`, verify:

```ini
num_conds = 2
num_counters = 2
experiment_code_version = robot-trust-1.0.0
```

4. In that project directory, run `psiturk`; in its shell run `server on`, then `debug`.
5. The installer also replaces the sample advertisement and consent wrapper with study-specific introduction pages. Full consent remains inside the task before study responses are recorded. Original templates are backed up.
6. Complete fresh debug sessions repeatedly. Verify server-assigned `condition` and `counterbalance` values in exports; no strict alternation is promised by psiTurk's balanced random assignment.
7. In the psiTurk shell run `download_datafiles`. Inspect `trialdata.csv` and `questiondata.csv`. An additional platform-generated `eventdata.csv` is normal.

The installer retains the example's existing psiTurk, jQuery, Backbone, and other vendor scripts. It replaces the sample `task.js` reference with this study and supplies neutral introduction templates. Both full HTML and psiTurk 3.3.1 Jinja body-block templates are supported. Backups are saved before modifications. If the installer cannot identify the sample script, it stops without modifying the template.

### Manual installation if your course uses a different template

Copy this package's `static/js/content.js`, `static/js/study.js`, `static/css/study.css`, and contents of `static/media/` into the corresponding folders. Retain the template's server-injected `uniqueId`, `adServerLoc`, `mode`, `condition`, and `counterbalance`, and its scripts needed to define `PsiTurk`. Remove the previous experiment's task script. Add these tags at the end of the body, after psiTurk and its dependencies:

```html
<div id="app"></div>
<link rel="stylesheet" href="/static/css/study.css">
<script>window.ROBOT_STUDY_ENV={preview:false,mediaBase:'/static/media/'};</script>
<script src="/static/js/content.js"></script>
<script src="/static/js/study.js"></script>
```

Remove leftover sample experiment markup from the body. Set the two allocation parameters above. An unexpected condition value produces an explicit setup error rather than silently showing the wrong order.

## 3. Add the videos

All scripts and video slots are in `static/js/content.js`. Recordings should match the supplied text. Use the same visual framing, voice characteristics, sound level, movement, clothing/background, and pacing for both robots. Differentiate only the scripted moral decisions. Do not display “cold,” “human,” or philosophy labels to participants.

Place your MP4 files in `static/media/`. For example:

```js
videos: {
  outcome: {
    opening: 'outcome-opening.mp4',
    reason: 'outcome-reason.mp4',
    reason_follow: 'outcome-reason-follow.mp4',
    // Fill the other keys already present in content.js.
  },
  // Fill the care object's corresponding keys too.
}
```

There are 22 slots: 2 openings, 10 main replies, and 10 optional follow-up replies. The package's `docs/RECORDING_SCRIPT.md` lists every slot and its exact text. Blank paths display a clearly labeled placeholder and the corresponding transcript. Broken media also leave the transcript available and log a video error. Participants can review a transcript without finishing playback; playback and ended events are logged separately. A “reviewed” flag is not proof of listening.

Aim for roughly 15–20 seconds per main reply and opening, and 10–15 seconds per optional follow-up. Match durations across robot counterparts. The 150-second dialogue budget allows the opening, five main replies, and limited follow-up exploration. Pilot with the final clips; extensive optional follow-ups can time out.

The included sound/video check is a real six-second MP4 with three tones and a circle. The instruction page contains a screenshot of the actual dialogue interface, satisfying the screenshot option in the assignment. Replace this screenshot if you substantially change the interface.

Fill `researcher` and `contact` in `content.js`. `demoMode: true` displays a classroom-demo banner. Set it to false only when the final videos and consent details are ready. This setting does not disable psiTurk saving. This deliverable is for a classroom demonstration; consent is a draft for instructor review, not an institutional approval claim.

## 4. Timing and automatic progression

| Page | Time limit |
|---|---:|
| Consent, demographics, equipment check, instructions | Untimed; typically 1.5–2 minutes combined |
| Scenario and understanding questions | 60 seconds |
| First robot dialogue | 150 seconds |
| First robot ratings | 60 seconds |
| Second robot dialogue | 150 seconds |
| Second robot ratings | 60 seconds |
| Authority preferences | 60 seconds |
| Final open response | 45 seconds |
| Timed-page total | 9 minutes 45 seconds |

Target: around 10–12 minutes including setup at an ordinary pace. This is a design estimate, not a measured completion-time guarantee. Early completion is required by the assignment, so a fast participant may finish below ten minutes. Consent is never granted by timeout. Demographic validity and the media check cannot be skipped by waiting.

Every experimental page displays a countdown. Dialogue automatically advances once all five main answers are marked reviewed. Survey “Save/Continue” buttons submit the completed page and immediately advance without an extra transition screen. Timeouts save partial answers and advance without validation. Missing answers are null, not neutral ratings or zero scores. No back button is provided. Absolute deadlines continue in background tabs. psiTurk-mode reloads resume the same page/deadline from this tab's session storage when available; preview reloads intentionally start a fresh session.

## 5. Where data goes

- **trialdata.csv:** `recordTrialData` receives scenario start/end, robot start/end, question/reply choices, follow-ups, review events, video events/errors, robot identity and presentation position, elapsed times, and timeout/completion status.
- **questiondata.csv:** `recordUnstructuredData` receives consent, demographics, equipment-check responses, comprehension questions, all rating and authority questionnaire responses, open text, page questionnaire durations/status, and allocation metadata.
- The same server-provided `uniqueId` is used for both APIs. It is also saved explicitly as `participant_id`. No new live participant ID is generated by this app.
- psiTurk exports may wrap event objects as serialized JSON, depending on the installed version; see `docs/DATA_DICTIONARY.md`.
- Answers are checkpointed as they change. Data is sent at short intervals; final completion is gated on a successful save. A failed final save shows a retry button. Closing the tab during an outage can still lose unsent data.
- A same-tab session-storage cache supports refresh recovery. This is not cross-device or cross-tab recovery. Do not open two copies of the same participant assignment.

## 6. Demo checklist for Dr. Roy

- Agree and decline paths; ages outside 18–80 blocked.
- Required background questions saved in question data.
- Incorrect sound/video answers cannot pass; correct answers after playback pass.
- Screenshot displayed on instructions; correct first/second robot named.
- All four combinations demonstrated, including B-first versions.
- Same scenario and same question menu for both robots.
- Early completion and timeouts on every experimental page.
- Partial rating and written answers retained after timeout.
- Both CSVs contain the same participant ID.
- No demographics or rating rows mistakenly stored as trial events.
- Final save failure does not falsely complete the assignment.
- Final clips tested for audibility, loading, and timing.

Read `docs/PROTOCOL.md` for design rationale and `docs/TEST_REPORT.md` for exactly what was tested. Actual psiTurk server allocation and database CSV exports must also be checked in your course environment.

## Official implementation references

- https://psiturk.readthedocs.io/en/stable/api.html
- https://psiturk.readthedocs.io/en/stable/settings.html
- https://psiturk.readthedocs.io/en/latest/retrieving.html
- https://psiturk.readthedocs.io/en/latest/tutorials/example-project-stroop.html
