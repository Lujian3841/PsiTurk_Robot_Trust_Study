# Running the robot trust study

Julian Arceo & Zachary Alexander · Purdue Northwest

This branch is the local psiTurk collection copy. Videos and dialogue are included. The installed experiment saves to psiTurk's database; opening preview.html or the GitHub Pages link does not collect responses centrally.

## Install a new copy on Ubuntu

Run these commands in the Ubuntu VM terminal. This downloads the project directly into the VM.

```bash
source ~/psiturk-work/.venv/bin/activate
cd ~/Downloads
git clone --branch psiturk-experiment --single-branch https://github.com/Lujian3841/PsiTurk_Robot_Trust_Study.git robot-study-experiment-source
python ~/Downloads/robot-study-experiment-source/robot-trust-study/setup_experiment.py ~/robot-study-project/Robot_Study_Experiment
cd ~/robot-study-project/Robot_Study_Experiment
psiturk server on
psiturk debug -p
```

Open the printed URL in Firefox inside the VM. Keep the complete URL, including its IDs. A fresh installation uses localhost port 22364 and its own participants.db. The installer refuses an existing destination and does not change earlier study folders. Do not rename the installed folder afterward: its database path is absolute.

The `debug` command is psiTurk's local session launcher, not an offline preview. Responses go to the configured database. Records have mode `debug`, and psiTurk may show a debug completion page. This setup is for supervised local sessions without Mechanical Turk or AWS credentials. It is not a public internet deployment or paid MTurk collection.

## Pilot before collection

Use a separate pilot project so practice answers do not mix with study answers:

```bash
python ~/Downloads/robot-study-experiment-source/robot-trust-study/setup_experiment.py ~/robot-study-project/Robot_Study_Pilot --port 22365
cd ~/robot-study-project/Robot_Study_Pilot
psiturk server on
psiturk debug -p
```

Complete a pilot on the VM, checking sound, every video, page layout, timing, and the final save. Run `python export_results.py` and inspect both CSV files. Run several fresh sessions to see both robot orders and both label assignments. Assignment is balanced randomly, not a strict alternating sequence; repeats can occur.

## Each collection session

```bash
source ~/psiturk-work/.venv/bin/activate
cd ~/robot-study-project/Robot_Study_Experiment
psiturk server on
psiturk debug -p
```

If the server is already running, only generate the new URL. Run `psiturk debug -p` for **each new participant**. Never reuse another participant's URL. Refreshing a session is intended to resume that participant, not create a new record. Wait for the saved confirmation and use the completion button before closing the tab. If saving fails, keep the tab open and retry.

All participants on this server share one database, with separate IDs. Separate VM copies have separate databases. The localhost URL only opens on the VM; participants using their own computers need a reachable hosted psiTurk server.

## Export and back up responses

From the installed project folder:

```bash
python export_results.py
```

Each export creates a new dated folder under `exports/` containing:

- `trialdata.csv`: timed experimental events.
- `questiondata.csv`: consent, demographics, checks, ratings, authority choices, and reflection.
- `eventdata.csv`: psiTurk platform events.
- `participants.db`: a consistent backup of the SQLite database.

These are native psiTurk CSVs without a header row. Column 1 is the same participant ID in both required files. Trial columns are ID, trial number, timestamp, and JSON trial content. Question columns are ID, question key, and answer. Filter using the `completed` question to distinguish finished from partial sessions. Export includes all saved participants, not just the latest person.

You can also use `psiturk download_datafiles`; it writes the three CSVs into the current project folder and replaces previous exports there. Exporting does not delete database records.

Keep data and backups private; do not commit participant files to the public repository. Copy the dated export folder out of the VM after collection using your VM's shared folder or file transfer.

## Editing and updates

Installed content is in `static/js/content.js`; behavior is in `static/js/study.js`; layout is in `static/css/study.css`; videos are in `static/media/`; introductory templates are in `templates/`. The installed `templates/exp.html` loads the native psiTurk connection.

Freeze the study version once collection starts. Do not rerun setup over the collection folder, replace its database, or switch code versions midway through a group. For a revised study, create a new project and port, pilot it, and retain the earlier data. Main and this branch are separate: later partner changes on main do not automatically enter this copy.

To stop the server, run `psiturk server off` from the relevant project folder.
