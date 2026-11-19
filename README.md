# Robot Trust Study

Julian Arceo & Zachary Alexander · Purdue Northwest

jjarceo@pnw.edu · alexandz@pnw.edu

Participants meet two robot characters facing the same flood rescue problem. One saves five people; the other keeps a promise to one person. Participants watch recorded replies, choose questions, rate both robots, and decide which robot they would put in charge of business, family, government, and rescue decisions.

[Live preview](https://lujian3841.github.io/PsiTurk_Robot_Trust_Study/)

The Pages preview downloads CSVs for one session. The installed psiTurk version saves multiple participants to the VM database. Use psiTurk for collecting the study data.

## Files

All study files are under `robot-trust-study/`:

| File | Purpose |
| --- | --- |
| `static/js/content.js` | Scenario, scripts, video filenames, questions, and contacts |
| `static/js/study.js` | Page sequence, participant state, scoring, and saving |
| `static/js/helpers.js` | Shared form controls, video playback, and CSV formatting |
| `static/css/study.css` | Layout and styles |
| `static/media/` | The 22 robot videos, sound check, and instruction screenshot |
| `templates/` | psiTurk welcome and advertisement pages |
| `preview.html` | Local browser preview |
| `setup_experiment.py` | Creates a new psiTurk project |
| `install_into_psiturk.py` | Installs or updates study files in an existing project |
| `export_results.py` | Exports responses and a database backup |

The root `index.html` loads the same study for GitHub Pages. There is no build step.

## Update the VM without losing demo data

Finish or close any active session first. In the Ubuntu terminal:

```bash
source ~/psiturk-work/.venv/bin/activate
cd ~/robot-study-project/Robot_Study_Presentation
psiturk server off
python export_results.py
cp -a "$HOME/robot-study-project/Robot_Study_Presentation" "$HOME/robot-study-project/Robot_Study_Presentation-backup-$(date +%Y%m%d-%H%M%S)"

cd ~/Downloads/robot-study-experiment-source
git switch psiturk-experiment
git pull --ff-only origin psiturk-experiment
python robot-trust-study/install_into_psiturk.py ~/robot-study-project/Robot_Study_Presentation

cd ~/robot-study-project/Robot_Study_Presentation
psiturk server on
psiturk debug -p
```

If an export, backup, or Git command fails, stop and resolve it before installing. The installer copies program files and keeps the configured database path, port, and existing participant records. It does not delete old files from the installed project. The repository cleanup therefore does not delete the VM's results or local backups. Keep the backup outside the submission folder.

Open the complete new URL in Firefox inside the VM. Generate a new URL with `psiturk debug -p` for each participant. Do not reuse a previous participant's link. Use Ctrl+Shift+R if the browser displays an older interface.

The cleanup preserves the version 1.3.0 questions, field names, scoring, condition mapping, and data formats. Earlier records retain the version saved when they were collected. Do not rewrite old responses or combine older generic trust ratings with MDMT scores as though they were the same measure.

## First installation

If you do not already have the source folder:

```bash
source ~/psiturk-work/.venv/bin/activate
cd ~/Downloads
git clone --branch psiturk-experiment --single-branch https://github.com/Lujian3841/PsiTurk_Robot_Trust_Study.git robot-study-experiment-source
```

Create a new installation only if the destination does not exist:

```bash
python ~/Downloads/robot-study-experiment-source/robot-trust-study/setup_experiment.py ~/robot-study-project/Robot_Study_Presentation --port 22366
cd ~/robot-study-project/Robot_Study_Presentation
psiturk server on
psiturk debug -p
```

This creates an independent database. Do not use fresh setup to replace an existing collection folder. The installed database path is absolute, so do not rename the installed project afterward.

## Export results

From the installed project folder, run `python export_results.py`. Each run creates a dated folder under `exports/` containing:

- `trialdata.csv`: dialogue choices, video events, order, and timing.
- `questiondata.csv`: consent, demographics, checks, ratings, MDMT answers and scores, authority choices, and reflection.
- `eventdata.csv`: psiTurk events.
- `participants.db`: a consistent SQLite backup.

Native psiTurk CSVs have no header row. Question columns are participant ID, question name, and answer. Trial columns are participant ID, trial number, timestamp, and JSON event content. Both use the same participant ID. Exports include completed and partial sessions; the `completed` question identifies finished responses. Preview CSVs have headers and a different layout.

Submit the source files, live preview link, and the original CSV exports privately to the professor. Keep participant data out of the public repository. Exporting again does not remove older records or exports.

## Procedure and scoring

This is a within-subject study. Both robots use the same scenario and question menu. psiTurk uses two order conditions and two label assignments, chosen through balanced random assignment. Consecutive sessions may have the same order. The preview randomizes locally; explicit `condition` and `counterbalance` URL parameters are available for checking all four combinations.

Participants must be 18 or older. Required forms disable Continue until complete. Every selected video must finish before moving on. Autoplay is requested with sound; browser restrictions may require pressing Play. Only the story page has a 60-second timer. Dialogue and questionnaires are untimed. Allow 15–20 minutes and check the actual duration with a pilot.

Comfort, competence, and intelligence each use two study-specific 1–7 items. Moral trust uses the 12-item Moral Trust subset of MDMT v2 (September 1, 2025), presented for each robot after both conversations. It uses 0–7 ratings and a Does Not Fit response. The items are split into two balanced screens of six.

MDMT dimension means use available numeric responses; Does Not Fit is missing, not zero. An entirely missing dimension has a null mean. Moral trust is the mean of valid Ethical, Sincere, and Benevolent dimension means, calculated only when at least two dimensions have a score. The implementation permits a dimension score when at least one item is numeric and saves the valid counts. Raw items and scores use `robot_outcome_mdmt_` and `robot_care_mdmt_` prefixes in question data.

[MDMT scale and scoring instructions](https://research.clps.brown.edu/SocCogSci/Measures/MDMT_v2_%282025%29_Full_scale.pdf). The scale is free for research use; the authors request notification at scsrc@brown.edu and citation of their work:

- Malle, B. F., & Ullman, D. (2021). A multi-dimensional conception and measure of human-robot trust. In *Trust in human-robot interaction: Research and applications*, 3–25. Elsevier.
- Malle, B. F., & Ullman, D. (2023). *Measuring human-robot trust with the MDMT*. https://arxiv.org/abs/2311.14887
- Ullman, D. (2021). *Developing a multi-dimensional model and measure of human-robot trust*. Brown University dissertation.
- Ullman, D., & Malle, B. F. (2019). Measuring gains and losses in human-robot trust: Evidence for differentiable components of trust. *HRI 2019*, 618–619.

## Checks before presenting

Complete a Firefox pilot on the VM, including sound, both robot conversations, final saving, and CSV export. Check the underage warning, disabled controls, randomized order, and a missing MDMT response. Automated checks cover the page flow and native psiTurk saving, but do not confirm playback on every VM. The reported Firefox corrupted-video error remains a machine-specific issue to diagnose; this code cleanup does not replace or re-encode the active video files.
