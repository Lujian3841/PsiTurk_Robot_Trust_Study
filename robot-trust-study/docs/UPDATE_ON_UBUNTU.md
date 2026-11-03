# Updating the study on Ubuntu

The GitHub project includes the robot videos and their paths. Back up the installed study and database before copying an updated version into the VM.

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

Participants must be **18 or older**, with no upper age limit. The consent identifies Julian Arceo, Zachary Alexander, and Purdue Northwest. The contact text directs classroom participants to the study team. It can be changed to a university email in `static/js/content.js`.

Before presenting: complete a fresh run, try a wrong understanding answer, go back through setup, check sound in Firefox, and inspect exported question/trial data. The page layouts were checked at 1366×768 browser content pixels and 100% zoom. Use a large VM window; smaller windows retain scrolling rather than hiding content. The scripts and video paths match the existing recordings. Pilot the added instruction check for the 10–12 minute target.
