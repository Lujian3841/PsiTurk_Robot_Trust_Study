# Study protocol

Julian Arceo and Zachary Alexander · Purdue Northwest

## Research question

How do a robot's moral decisions affect trust, comfort, perceived competence, perceived intelligence, and willingness to put it in charge?

## Design

This is a within-subject study: each participant meets both robots. Both face the same flood rescue problem and answer the same questions. The outcome-focused robot saves five people at Building B. The promise-focused robot returns for one person at Building A.

| Condition | Counterbalance | First robot | Second robot |
|---:|---:|---|---|
| 0 | 0 | A: outcome | B: promise |
| 0 | 1 | B: outcome | A: promise |
| 1 | 0 | B: promise | A: outcome |
| 1 | 1 | A: promise | B: outcome |

The code uses `outcome` and `care` as internal names. Participants only see A and B. The four rows change order and labels, not the scenario. psiTurk assigns these values, and the same combination can appear in consecutive sessions.

## Participants and procedure

Participants must be 18 or older and agree to take part. Background questions cover age, gender, previous psiTurk use, previous work with robots, and familiarity with humanoid robots.

The sequence is consent, background questions, equipment check, instructions, instruction check, scenario, first robot and ratings, second robot and ratings, authority choices, final comment, and closing explanation.

The three instruction questions require correct answers and allow retries with feedback. Every submitted attempt is saved in question data. The two scenario questions record understanding of the rescue problem. They are timed, and unanswered or incorrect responses are retained for analysis.

The equipment check requires video completion and correct answers about the tones and shape. Participants who cannot complete it leave before the robot task.

Participation is voluntary. Participants can stop at any time. The study requests non-identifiable responses, not names or contact information. A coded psiTurk ID links the records. This does not mean all platform metadata is anonymous.

## Robot presentation

The robot replies are prerecorded, with matching transcripts. Participants choose five main questions and can select optional follow-ups. Both characters use the same question menu. Visual appearance, voice, pacing, framing, and sound level should be kept consistent so they do not introduce additional differences.

The promise-focused robot does not minimize all harm: its choice leaves five people without rescue. The comparison is between saving more lives and keeping a specific promise. Neither is described to participants as the correct moral answer.

The decision and explanation differ together. This design cannot tell us whether a rating difference comes from the decision alone or its explanation. Follow-up choices also change how much information each participant sees. The logs record these choices, but marking a response reviewed does not prove it was read or heard.

## Measures

Each robot receives eight ratings on a 1–7 scale: two each for trust, comfort, competence, and intelligence. These are study-specific questions, not a validated questionnaire. The scale runs from strongly disagree to strongly agree, with a separate option not to answer.

Participants choose Robot A, Robot B, no preference, neither robot, or prefer not to answer for four areas: business, family, government, and rescue. Each choice assumes that a human can override the robot. Both the displayed label and its matching robot type are saved.

The final optional comment asks what shaped trust and why choices stayed the same or differed across areas.

## Planned analysis

1. Describe participant backgrounds and completion rates.
2. Report failed media, timeouts, understanding scores, and dialogue exposure.
3. Treat skipped and unanswered items as missing.
4. Calculate a two-item average for each rating category when both answers are numeric.
5. Compare each participant's ratings of the two robots. Choose any statistical test with the instructor based on the sample.
6. Report authority choices separately for each area. The four choices from one participant are related observations.
7. Check whether robot order or label assignment affected responses.
8. Group final comments by themes such as lives saved, keeping promises, dependability, and reluctance to give robots authority.

We expect the outcome-focused robot may receive higher competence ratings and the promise-focused robot may receive higher comfort ratings. Differences in trust, intelligence, and authority choices remain open questions.

The scenario directly shows a rescue decision. Responses about business, family, and government concern situations the robots have not demonstrated. One scenario and one robot appearance limit how broadly the findings can apply. Preview sessions and automated test responses are not participant results.
