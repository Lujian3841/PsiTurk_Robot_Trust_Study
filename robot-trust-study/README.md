# Robot Trust Study

**Julian Arceo and Zachary Alexander**  
**Purdue Northwest**

Our study asks how a robot's moral decisions affect trust. Participants meet two robot characters facing the same flood rescue problem. One chooses to save five people. The other chooses to keep a promise to one person.

Everyone meets both robots. Participants choose questions to learn each robot's reasons, rate both robots, and decide which they would trust with decisions about business, family, government, and rescue operations.

For the professor walkthrough, see [CODE_WALKTHROUGH.md](docs/CODE_WALKTHROUGH.md). Current measures and scoring are in [MDMT.md](docs/MDMT.md).

## Running the study

For a fresh installation, follow [RUN_EXPERIMENT.md](docs/RUN_EXPERIMENT.md). After installation, start the study in the Ubuntu VM:

```bash
source ~/psiturk-work/.venv/bin/activate
cd ~/robot-study-project/Robot_Study_Experiment
psiturk server on
psiturk debug -p
```

Open the printed debug link in Firefox inside the VM. [Experiment installation and collection](docs/RUN_EXPERIMENT.md) covers the separate project, pilot sessions, and exports.

For a preview without psiTurk, run this from the `robot-trust-study` folder:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/preview.html. The preview offers CSV downloads at the end but does not save to the psiTurk database.

## Project files

| File or folder | Purpose |
|---|---|
| `static/js/content.js` | Scenario, robot scripts, video paths, ratings, and study details |
| `static/js/study.js` | Page flow, forms, timers, condition assignment, and data recording |
| `static/css/study.css` | Page layout and styling |
| `static/media/` | Robot videos, audio files, equipment check, and task screenshot |
| `templates/` | psiTurk introduction pages |
| `install_into_psiturk.py` | Copies the study into a psiTurk project |
| `tests/` | Browser tests |
| `docs/` | Protocol, scripts, data fields, testing, and VM instructions |

## Conditions and videos

The study uses two order conditions and two label assignments. The psiTurk configuration is:

```ini
[Task Parameters]
num_conds = 2
num_counters = 2
experiment_code_version = robot-trust-experiment-1.3.0
```

Participants see neutral labels, Robot A and Robot B. The order and labels can repeat across sessions. The four preview combinations can be opened by adding `?condition=0&counterbalance=0`, `?condition=0&counterbalance=1`, `?condition=1&counterbalance=0`, or `?condition=1&counterbalance=1` to the preview URL. These links check the interface; live assignment comes from psiTurk.

The 22 robot clips are already linked in `content.js`. The study uses the `-final.webm` files. The other media files remain in the project. Transcripts match the recorded replies and stay visible during the task. The [recording scripts](docs/RECORDING_SCRIPT.md) list the filenames and replies.

## Participant flow

Consent → background questions → sound/video check → instructions → understanding check → rescue scenario → first robot and ratings → second robot and ratings → MDMT moral trust for both robots → authority choices → final comment → closing explanation.

Participants must be 18 or older. Required forms keep Continue disabled until answers are complete. Setup pages have Previous buttons and retain answers. The instruction check requires correct answers before the timed task starts.

Only the rescue story has a 60-second timer. Robot dialogue, ratings, moral-trust questions, authority choices, and final comments are untimed. Each selected clip must finish before the participant can continue. Videos request autoplay with sound; if the browser blocks this, the participant presses Play. The red underage message appears for ages below 18.

Allow 15–20 minutes and verify the duration with a pilot. Optional follow-ups and untimed responses can extend it. The two generic trust questions from earlier versions are replaced by the 12-item MDMT v2 Moral Trust subset for each robot at the end. Comfort, competence, and intelligence remain separate ratings.

## Data

- `trialdata.csv`: dialogue choices, video events, timing, order, and completion events.
- `questiondata.csv`: consent, demographics, understanding checks, ratings, authority choices, and comments.
- Both use the same psiTurk participant ID. Unanswered timed questions remain missing rather than being scored as zero.
- Final completion requires a successful save. A failed save shows a retry button.
- Reload recovery uses the same browser tab's session storage.

The [data dictionary](docs/DATA_DICTIONARY.md) describes the fields. The [protocol](docs/PROTOCOL.md) explains the design and planned analysis. The [test report](docs/TEST_REPORT.md) separates completed checks from the remaining VM checks.

## Presentation checks

Before presenting, check Firefox sound, complete a new debug session, try the Previous buttons and an incorrect understanding answer, and inspect the exported files. Check the robot order across fresh sessions. The layout was tested at 1366×768 browser content pixels at 100% zoom; smaller windows may scroll.

The contact line currently directs classroom participants to Julian or Zachary. An email can be entered in `content.js` if needed. `demoMode` controls the classroom banner, not data saving.

## psiTurk references

- https://psiturk.readthedocs.io/en/stable/api.html
- https://psiturk.readthedocs.io/en/stable/settings.html
- https://psiturk.readthedocs.io/en/latest/retrieving.html
