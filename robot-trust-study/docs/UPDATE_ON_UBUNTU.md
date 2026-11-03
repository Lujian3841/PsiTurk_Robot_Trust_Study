# Apply the presentation revisions without rebuilding the study

This update starts from the latest GitHub project, including Zachary's videos. It preserves all audio/video files and all 22 video mappings. Your installed psiTurk project and its database should be backed up before applying an update.

After this pull request is merged, run in the Ubuntu VM:

```bash
source ~/psiturk-work/.venv/bin/activate
cd ~/robot-study-project/Robot_Study_Revised
psiturk server off
cp -a ~/robot-study-project/Robot_Study_Revised ~/robot-study-project/Robot_Study_Revised_backup_$(date +%Y%m%d_%H%M%S)
cd ~/Downloads
git clone https://github.com/Lujian3841/PsiTurk_Robot_Trust_Study.git robot-study-presentation-update
python ~/Downloads/robot-study-presentation-update/robot-trust-study/install_into_psiturk.py ~/robot-study-project/Robot_Study_Revised
cd ~/robot-study-project/Robot_Study_Revised
psiturk server on
psiturk debug -p
```

If the clone folder already exists, use `git -C ~/Downloads/robot-study-presentation-update pull --ff-only` instead of cloning again. Open the newly printed debug URL in Firefox inside the VM; use Ctrl+Shift+R if old pages appear.

The installer copies the repository's interface and media files into the installed project. It does not remove extra media files or replace the database. If you made changes only in the VM after the GitHub upload, compare the backup first: files with the same names are replaced by the repository version.

The age rule is now **18 or older**, with no upper limit. This treats the professor's “over 18” note as adult eligibility including age 18. The consent lists Julian Arceo, Zachary Alexander, and Purdue Northwest. The contact text asks classroom participants to speak to the study team; add a university email to `static/js/content.js` if the professor requires one.

Before presenting: complete a fresh run, try a wrong understanding answer, go back through setup, check sound in Firefox, and inspect exported question/trial data. The page layouts were checked at 1366×768 browser content pixels and 100% zoom. Use a large VM window; smaller windows retain scrolling rather than hiding content. The prerecorded robot wording is unchanged so you do not need to record new clips. Pilot the added instruction check for the 10–12 minute target.
