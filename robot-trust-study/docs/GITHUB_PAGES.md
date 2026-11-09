# GitHub Pages

The repository root contains `index.html`, which loads the existing study in preview mode. Relative asset paths keep scripts, styles, screenshots, and videos under the repository URL. `.nojekyll` serves the project as static files.

In the repository Settings → Pages, select **Deploy from a branch**, **main**, and **/(root)**, then Save. The public URL is https://lujian3841.github.io/PsiTurk_Robot_Trust_Study/ . Publishing can take several minutes.

This is a public demonstration, not a hosted psiTurk server. Each session runs in the visitor’s browser. At the end, the visitor can download trialdata.csv and questiondata.csv for that session. Responses are not sent to the researchers or to the Ubuntu VM. Reloading starts a new preview. Use the psiTurk deployment for centralized participant data collection.

The root entry page reuses the study files, so updates to robot-trust-study/static appear in the public version after Pages redeploys. The Ubuntu installer and psiTurk templates are unchanged.
