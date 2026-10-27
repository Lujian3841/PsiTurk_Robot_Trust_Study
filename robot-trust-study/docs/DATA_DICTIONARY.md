# Data dictionary

## Participant linkage and file formats

The app uses the same psiTurk object, initialized with the server's `uniqueId`, for trial and questionnaire recording. Native exports include psiTurk's identifier columns; `participant_id` is also explicit in every trial object and as a question-data field. Preview IDs begin `preview-` and must never be treated as research participants.

The preview downloads use a wide event table and a long question table (`participant_id,key,value`). Native psiTurk CSVs may store a trial object's JSON in an outer column or expose its fields, depending on version. Inspect the headers before analysis. Do not rename or reorder native identifier columns blindly. Data is committed to psiTurk's database first; `download_datafiles` produces CSVs afterward.

## trialdata.csv: experiment events

| Field | Meaning |
|---|---|
| participant_id | Server `uniqueId`, or separate preview ID |
| version | Script version |
| condition | 0 outcome first; 1 care first |
| counterbalance | 0 outcome=A; 1 outcome=B |
| seq | Zero-based app event sequence |
| event | Event type below |
| elapsed_ms | Milliseconds since consent |
| robot_style | outcome / care; only for robot events |
| robot_label | A / B |
| position | 1 or 2 |
| reply | opening, main question key, or key ending `_follow` |
| question | Main question key for follow-up selection |
| has_video | Whether a video path was configured |
| duration_ms | Time spent on the completed page |
| completion_reason | completed / timeout |
| main_responses_reviewed | Array of the main question IDs marked reviewed |
| replies_opened | Array of reply selections; repeats retained |
| active_reply | Displayed reply at page exit |

Events: `scenario_start`, `scenario_end`, `robot_start`, `reply_opened`, `followup_selected`, `reply_reviewed`, `video_play`, `video_ended`, `video_error`, `robot_end`.

## questiondata.csv: background and questionnaires

| Key or prefix | Meaning |
|---|---|
| participant_id | Same ID as trial events |
| consent | true after explicit agreement |
| age | Integer entry, 18–80; stored as form string |
| gender | Selected category including prefer not to answer |
| psiturk_before / robots_before | Yes / No / Not sure |
| robot_familiarity | Familiarity category |
| condition / counterbalance / robot_order / first_robot_label | Allocation record |
| study_version / preview / demo_mode / cache_available | Session metadata |
| av_clip_finished / av_attempts / av_last_tones / av_last_shape / av_passed | Equipment check |
| screenout_reason | media_check_failed when applicable |
| instructions_completed | Instructions were completed |
| understanding_rescues / understanding_promise | Dilemma comprehension responses |
| comprehension_correct / comprehension_completion_reason | Accuracy and completion status |
| robot_outcome_* / robot_care_* | Eight ratings and rating page status below |
| authority_business / authority_family / authority_government / authority_rescue | Displayed choice, null, or skip |
| authority_*_style | Choice translated to outcome/care, or retained non-choice category |
| reflection | Optional open text (max 3,000 characters) |
| study_duration_ms | Consent to final response completion |
| completed | Reached end; final server save still must succeed |
| withdrawn / withdrawn_at_step | Participant stopped; partial records remain |

Rating suffixes: `trust_1`, `trust_2`, `comfort_1`, `comfort_2`, `competence_1`, `competence_2`, `intelligence_1`, `intelligence_2`. Values are strings `1`–`7`, `skip`, or null. Convert only numeric values to numbers.

Each robot rating page has `_completion_reason` and `_duration_ms` suffixes. Authority and reflection use their own page-prefixed metadata (see app version). An unanswered item on timeout is null; a blank optional reflection is an empty string. Trial events are not a questionnaire export.

Session caching is limited to the same browser tab. Preview sessions intentionally reset on reload. Native psiTurk lifecycle events may also appear in `eventdata.csv`; these are separate from this study's questionnaire and interaction records.
