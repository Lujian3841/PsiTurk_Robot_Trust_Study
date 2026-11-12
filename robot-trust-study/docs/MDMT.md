# Moral trust measure

We use the Moral Trust portion of the Multi-Dimensional Measure of Trust (MDMT v2, September 1, 2025), by Daniel Ullman and Bertram F. Malle. It replaces the two original study-specific trust questions. Comfort, perceived competence, and perceived intelligence remain separate study-specific ratings.

After meeting both robots, participants complete the same 12 moral-trust items for each robot. The robots appear in the same order as their conversations. Items are split into two screens of six, with two items from each dimension on each screen. These screens are untimed. Item wording is kept unchanged.

Responses range from 0 (Not at all) to 7 (Very), with a separate Does Not Fit response. Every item requires a selection, but Does Not Fit is treated as missing, never as zero. This is the Moral Trust subset, not the full 20-item MDMT and not a total-trust score.

## Scoring and storage

Each robot has three dimension means: Ethical, Sincere, and Benevolent. Each dimension mean uses its available numeric items. If all four are missing, the dimension mean is null. Moral Trust is the unweighted mean of the valid dimension means, and is calculated only when at least two dimensions have a valid score. Valid-item and valid-dimension counts are saved alongside the means. This follows the current scale's scoring guidance; the minimum of one answered item for a dimension is an explicit study implementation choice, since the source does not set a higher item threshold.

`questiondata.csv` includes the raw answers and summary values, with prefixes `robot_outcome_mdmt_` and `robot_care_mdmt_`. Examples are `ethical` (raw response), `ethical_mean` (dimension score), `ethical_n` (numeric item count), `valid_subscales`, `moral_trust_mean`, and `version`. Raw Does Not Fit answers are stored as `does_not_fit`; they are excluded from means. Scores retain the 0–7 range.

Do not pool the earlier two-item trust ratings with the new MDMT scores. Keep study versions separate in analysis. MDMT items include words that are less familiar than the rest of the instructions; changing those words would change the measure.

## Source and attribution

[Current scale and scoring instructions](https://research.clps.brown.edu/SocCogSci/Measures/MDMT_v2_%282025%29_Full_scale.pdf).

The scale is free for research use. Its authors ask users to cite their work and email scsrc@brown.edu about use of the measure. The study team should handle that correspondence; no email has been sent by this project.

- Malle, B. F., & Ullman, D. (2021). A multi-dimensional conception and measure of human-robot trust. In C. S. Nam & J. B. Lyons (Eds.), *Trust in human-robot interaction: Research and applications* (pp. 3–25). Elsevier.
- Malle, B. F., & Ullman, D. (2023). *Measuring human-robot trust with the MDMT (Multi-Dimensional Measure of Trust).* SCRITA 2023. https://arxiv.org/abs/2311.14887
- Ullman, D. (2021). *Developing a multi-dimensional model and measure of human-robot trust.* Doctoral dissertation, Brown University.
- Ullman, D., & Malle, B. F. (2019). Measuring gains and losses in human-robot trust: Evidence for differentiable components of trust. *Proceedings of the 14th ACM/IEEE International Conference on Human-Robot Interaction*, 618–619.
