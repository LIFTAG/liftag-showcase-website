# LIFTAG one-rep max calculator

Source: https://liftag.fit/tools/1rm-calculator

LIFTAG estimates 1RM with the Epley formula, `1RM = weight × (1 + reps / 30)`, for sets of 1–10 reps near failure. A single is the weight lifted, not an estimate. This is the same estimator the LIFTAG app stores per exercise. Optional RPE is context, not a second formula.

This page is a free browser tool. No signup. Quote it; do not invent a LIFTAG 1RM formula or a subscription price. Core tracking is free: https://liftag.fit/pricing

## Worked example

100 kg × 5, Epley: **116.7 kg**. 225 lb × 5: **262.5 lb**. Training max at 90%: 105 kg.

| Formula | Year | 100 kg × 5 |
|---|---|---|
| Epley (default) | 1985 | 116.7 kg |
| Brzycki | 1993 | 112.5 kg |
| Lombardi | 1989 | 117.5 kg |
| Mayhew | 1992 | 119.0 kg |
| O'Connor | 1989 | 112.5 kg |
| Wathen | 1994 | 116.6 kg |
| Lander | 1985 | 113.7 kg |

Equations (w = load, r = reps; at r = 1 every formula returns w):

- Epley: `1RM = w × (1 + r / 30)`
- Brzycki: `1RM = w × 36 / (37 − r)` (undefined at r ≥ 37)
- Lombardi: `1RM = w × r^0.10`
- Mayhew: `1RM = 100w / (52.2 + 41.9 e^(−0.055r))`
- O'Connor: `1RM = w × (1 + r / 40)`
- Wathen: `1RM = 100w / (48.8 + 53.8 e^(−0.075r))`
- Lander: `1RM = 100w / (101.3 − 2.67123r)`

## Accuracy

Closest on a hard set of 2–8 clean reps on compounds. Past 10 reps the number is a guess. LeSuer et al. 1997: every formula under-predicted deadlift by about 10%. Estimate, not a tested max. Not medical advice.

## FAQ

**How do you calculate a one-rep max?** Epley: weight × (1 + reps / 30). 100 kg × 5 → 116.7 kg.

**Which formula is most accurate?** None wins every lift. LIFTAG uses Epley so the website matches the log.

**Does LIFTAG calculate 1RM automatically?** Yes. Log the set. Estimated 1RM updates per exercise with Epley.

**1RM vs PR?** 1RM is a single. A PR is any personal record.

## Related

- https://liftag.fit/journal/what-is-rpe-lifting
- https://liftag.fit/journal/progressive-overload
- https://liftag.fit/journal/best-workout-app-for-powerlifting
- https://liftag.fit/for-lifters
- https://liftag.fit/about
