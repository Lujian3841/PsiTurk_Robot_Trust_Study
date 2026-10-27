# Study protocol

## Research question

How does a robot's scripted moral approach affect perceived trust, comfort, competence, intelligence, and willingness to grant it authority across business, family, government, and rescue settings?

## Design

Within-subject: all participants see both characters. The outcome-focused robot saves five people; the care/commitment-focused robot returns for the individual it promised to rescue. Both confront the same fixed dilemma and receive identical question menus. Optional follow-ups create bounded, participant-directed dialogue.

| Server condition | Counterbalance | First | Second |
|---:|---:|---|---|
| 0 | 0 | A: outcome | B: care |
| 0 | 1 | B: outcome | A: care |
| 1 | 0 | B: care | A: outcome |
| 1 | 1 | A: care | B: outcome |

The two moral approaches are the within-subject conditions. The four rows are allocation/order combinations, not four different moral scenarios. psiTurk's balanced random assignment can repeat combinations back-to-back. Demonstrate fresh assignments until all combinations are observed, or use the four forced preview links for an explicit interface demonstration. Do not claim the preview links verify the server's allocation algorithm.

## Participants and procedure

Adults aged 18–80. Voluntary consent; required age and demographic fields before the task. Gender includes a nonresponse option. No names, email addresses, video recordings, or voice recordings are requested. A coded psiTurk ID links records, and platform-level metadata may exist, so avoid claiming the system is completely anonymous.

Sequence: consent → demographics → audio/video check → condition-specific instructions and screenshot → dilemma plus comprehension questions → first robot dialogue → first robot ratings → second robot dialogue → second robot ratings → authority preferences → optional open-ended response → debrief.

The comprehension questions are recorded without feedback and do not block task entry after timeout. Include their correctness as a data-quality flag, rather than changing the moral scenario or silently excluding participants. The equipment check must pass; inability to hear or see the check ends the task before exposure. No experimental timeout bypasses consent or eligibility.

## Stimulus control

Use the same Optimus appearance, video framing, camera, audio level, speaking pace, and movement style in both conditions. Scripts identify each philosophy only to the researcher; participant labels remain A/B. The provided transcripts remain visible with the recordings for accessibility and consistent information access. This tests audiovisual presentation with transcripts, not audio-only processing.

The care-focused robot prioritizes promise-keeping and relational responsibility. It does not simply minimize all suffering, since its choice leaves five people without rescue. Consequently, the study contrasts these two specific moral policies; do not frame it as one objectively correct robot versus an irrational or universally humane robot.

Decision outcome and explanation are deliberately linked. The design cannot isolate the effect of explanation wording from the effect of choosing a different rescue. Optional dialogue exposure also varies, so record viewed/reviewed replies and total interaction time. A selected or marked-reviewed response is not evidence of attentive reading. Timeouts and failed videos should be reported.

## Measures

Eight custom 1–7 items per robot: two each for trust, comfort, perceived competence, and perceived intelligence. They are exploratory study-specific items, not a validated psychometric instrument. Scale anchors: 1 strongly disagree; 4 neither agree nor disagree; 7 strongly agree. “Prefer not to answer” is separate from the numeric scale.

Four authority preferences: Robot A, Robot B, no preference, neither robot, or prefer not to answer. Human override is held constant. Save both the displayed label and the underlying moral approach.

A final optional open-ended prompt asks what shaped trust and differences across authority domains. No text is sent to a language model; replies are prerecorded.

## Analysis plan for a class report

1. Describe the sample using age, gender, and prior psiTurk/robot experience.
2. Report completion, media failures, timeouts, comprehension accuracy, and dialogue exposure before outcome comparisons.
3. Code skipped, absent, and timed-out items as missing. Do not turn these into zeros or scale midpoints.
4. Compute a two-item mean for each construct only when both items are numeric. Inspect item relationships and describe the measures as exploratory.
5. Compare paired ratings between philosophies, reporting paired differences and uncertainty if an actual sample is collected. Select the inferential method with the instructor; avoid treating eight individual items as eight independent participants.
6. Summarize authority choices separately by domain. A participant contributes four linked preferences, so do not assume those choices are independent observations.
7. Inspect order/label effects and report any imbalance. With a tiny classroom sample, focus on descriptive results rather than unsupported generalization.
8. Code open comments for themes such as lives saved, responsibility, dependability, individual care, competence, and reluctance to delegate. Allow themes beyond this initial list.

The rescue scenario directly demonstrates rescue reasoning; judgments about family, business, and government measure transfer beyond the demonstrated context. A single dilemma and one robot embodiment limit generalization.

## Hypotheses (proposed, not established facts)

- Outcome-focused reasoning may receive higher competence ratings.
- Care/commitment-focused reasoning may receive higher comfort ratings.
- Authority preferences may differ across domains; keep this exploratory unless a specific directional prediction is justified before collecting data.
- Trust and intelligence differences are open questions.

Do not invent participant results. This package contains scripts and tests, not human study data.
