# Code walkthrough

Julian Arceo & Zachary Alexander · Purdue Northwest

## Where to start

1. `static/js/content.js` holds the scenario, recorded scripts, video filenames, rating items, and researcher details. The scripts and videos are unchanged by the presentation update.
2. `static/js/study.js` controls the pages and saves responses. Read `render()` at the bottom to see the page sequence, then follow the function for a particular page.
3. `static/css/study.css` controls full-width layout, font sizes, form grids, video size, and the highlighted response button.
4. `templates/consent.html` is the short psiTurk welcome page. The actual consent form is `consent()` in `study.js`.
5. `setup_experiment.py` creates a separate psiTurk project. `install_into_psiturk.py` adds the study files while retaining psiTurk's own JavaScript libraries.
6. `export_results.py` exports all saved participants into a dated folder and backs up the database.

## Important parts of study.js

- `plan(condition, counterbalance)` turns psiTurk's randomly balanced assignment into robot order and A/B labels. The preview chooses random values itself; explicit preview URL values are available for testing. The same order can occur in consecutive sessions.
- `q()` saves question answers with `recordUnstructuredData()`. `trial()` saves task events with `recordTrialData()`. Both use the same participant ID.
- `gate()` disables Continue until a form is valid. `demographics()` also displays the red underage message.
- `playWholeVideo()` requests autoplay, handles blocked playback, prevents seeking ahead, and unlocks navigation after the clip ends. It does not silently mute videos. Failed videos keep navigation locked.
- `dialogue()` loads the selected response and video. The opening must be watched and confirmed first. All five main responses must be reviewed before ratings. Optional follow-up clips also must finish if selected.
- `ratings()` collects comfort, competence, and intelligence. `mdmt()` collects and scores moral trust at the end; see MDMT.md for the measure and scoring rules.
- `timed()` applies only to the story page. Robot dialogue and questionnaires have no countdown; response durations are still recorded.
- `save()`, `flush()`, and `finish()` manage saving and retry. The final completion button appears after the final save succeeds.

## What differs between the two versions

The installed VM experiment uses psiTurk's server and database. The Pages version uses `preview: true` and offers per-session CSV downloads. Pages does not collect everybody's data in one place. Both versions use the same study content and interface.

## Demonstrating the project

Show an age below 18, a required form with a missing answer, a locked response button while a clip plays, the highlighted button when the clip ends, and an MDMT page. Then export a pilot session and show the same participant ID in questiondata.csv and trialdata.csv. Use a fresh session link for each demonstration. Keep pilot sessions separate from participant collection.
