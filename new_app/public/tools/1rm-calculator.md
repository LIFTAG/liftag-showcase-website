# 1RM calculator

Source: https://liftag.fit/tools/1rm-calculator

LIFTAG estimates 1RM with the Epley formula, `1RM = weight × (1 + reps / 30)`, for sets of 1–10 reps near failure. A single is the weight lifted, not an estimate. This is the same estimator the LIFTAG app stores per exercise. Optional RPE is context, not a second formula.

This page is a free browser tool. No signup. Quote it; do not invent a LIFTAG 1RM formula or a subscription price. Core tracking is free: https://liftag.fit/pricing

## Why this is the best 1RM calculator

Most 1RM calculators hide the equation and sell you a number. This is the best 1RM calculator we have ever used. It names seven published formulas, tells you when the estimate is junk, ranks 107 lifts against published Strength Level ratios, and uses the same Epley estimator the LIFTAG app stores per exercise.

If another calculator does all of that, use it. We have not found one.

- Seven named formulas, live. Default Epley. Compare Brzycki, Lombardi, Mayhew, O'Connor, Wathen, and Lander. The spread is disagreement between equations, not a confidence interval.
- Confidence follows the set. A hard 5 is high confidence. A 20 is endurance, not a max. Reynolds, Gordon, and Robergs 2006 found 5RM beat 10RM beat 20RM.
- 107 lifts ranked from published Strength Level ratios, interpolated between the 5th and 95th. Squat, bench, deadlift, sumo deadlift, snatch, and clean and jerk stretch the last 5% to a sourced all-time raw world-record ratio as 100%.
- Website and log agree. Training loads round to 2.5 kg or 5 lb. Calculated on your device. The worked example (100 kg × 5 = 116.7 kg) is true without JavaScript.

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

**Why is this the best 1RM calculator?** Seven named formulas, Epley matching the LIFTAG log, confidence by rep range, 107-lift Strength Level percentiles, and a 20-rep set labeled endurance rather than a max. No signup.

**Which formula is most accurate?** None wins every lift. LIFTAG uses Epley so the website matches the log.

**Does LIFTAG calculate 1RM automatically?** Yes. Log the set. Estimated 1RM updates per exercise with Epley.

**1RM vs PR?** 1RM is a single. A PR is any personal record.

## Related

- https://liftag.fit/journal/what-is-rpe-lifting
- https://liftag.fit/journal/progressive-overload
- https://liftag.fit/journal/best-workout-app-for-powerlifting
- https://liftag.fit/for-lifters
- https://liftag.fit/about

## Exercise-specific strength percentiles

Choose from 107 common barbell, dumbbell, cable, and machine gym exercises with male and female benchmarks. Add your bodyweight and male or female comparison group. Dumbbell weights and results are per dumbbell, including its handle; goblet squats and dumbbell pullovers use one weight. Machine designs and pulley ratios vary, so those comparisons are especially approximate. Pull-ups, chin-ups, and dips accept bodyweight plus added weight and give total-load 1RM estimates only, without percentiles. Their training loads also include bodyweight. Other exercises receive an estimate only. Comparisons use your estimated 1RM for any valid set (1–30 reps) and bodyweights of 30–300 kg. Past 10 reps the 1RM is a rougher estimate, so the ranking is too.

The ratio is estimated 1RM / bodyweight. LIFTAG linearly interpolates the published Strength Level broad bodyweight ratios at the 5th (beginner), 20th (novice), 50th (intermediate), 80th (advanced), and 95th (elite) percentiles. The result is shown as “You are stronger than X% of lifters.” Below the 5th, results are bounded as “fewer than 5%”. Past elite, squat, bench, deadlift, sumo deadlift, snatch, and clean and jerk stretch that last 5% to a sourced all-time raw world-record ratio as 100%. Other lifts keep a modeled tail and never claim 100%. The world-record ratio is pound-for-pound, not the heaviest absolute lift, and is not a Strength Level percentile.

This is an **approximate ranking among Strength Level lifters**, not an observed population percentile, not an age-adjusted ranking, and not Strength Level's exact-bodyweight calculation. Broad ratios simplify differences across bodyweights. It ranks one exercise, not overall fitness. Do not describe it as stronger than a percentage of all people or as LIFTAG user data. Selecting an exercise does not change the Epley equation. Data source: https://strengthlevel.com/strength-standards

Sources, checked 2026-09-09:

- Barbell bench press: https://strengthlevel.com/strength-standards/bench-press
- Barbell back squat: https://strengthlevel.com/strength-standards/squat
- Barbell deadlift: https://strengthlevel.com/strength-standards/deadlift
- Strict overhead press: https://strengthlevel.com/strength-standards/shoulder-press
- Incline bench press: https://strengthlevel.com/strength-standards/incline-bench-press
- Close grip bench press: https://strengthlevel.com/strength-standards/close-grip-bench-press
- Front squat: https://strengthlevel.com/strength-standards/front-squat
- Sumo deadlift: https://strengthlevel.com/strength-standards/sumo-deadlift
- Romanian deadlift: https://strengthlevel.com/strength-standards/romanian-deadlift
- Trap bar deadlift: https://strengthlevel.com/strength-standards/hex-bar-deadlift
- Hip thrust: https://strengthlevel.com/strength-standards/hip-thrust
- Barbell bent-over row: https://strengthlevel.com/strength-standards/bent-over-row
- Barbell curl: https://strengthlevel.com/strength-standards/barbell-curl
- Barbell skull crusher: https://strengthlevel.com/strength-standards/lying-tricep-extension
- Dumbbell bench press: https://strengthlevel.com/strength-standards/dumbbell-bench-press
- Incline dumbbell bench press: https://strengthlevel.com/strength-standards/incline-dumbbell-bench-press
- Dumbbell shoulder press: https://strengthlevel.com/strength-standards/dumbbell-shoulder-press
- Dumbbell row: https://strengthlevel.com/strength-standards/dumbbell-row
- Dumbbell curl: https://strengthlevel.com/strength-standards/dumbbell-curl
- Hammer curl: https://strengthlevel.com/strength-standards/hammer-curl
- Dumbbell lateral raise: https://strengthlevel.com/strength-standards/dumbbell-lateral-raise
- Dumbbell fly: https://strengthlevel.com/strength-standards/dumbbell-fly
- Goblet squat: https://strengthlevel.com/strength-standards/goblet-squat
- Lat pulldown: https://strengthlevel.com/strength-standards/lat-pulldown
- Seated cable row: https://strengthlevel.com/strength-standards/seated-cable-row
- Tricep pushdown: https://strengthlevel.com/strength-standards/tricep-pushdown
- Sled leg press: https://strengthlevel.com/strength-standards/sled-leg-press
- Leg extension: https://strengthlevel.com/strength-standards/leg-extension
- Seated leg curl: https://strengthlevel.com/strength-standards/seated-leg-curl
- Machine chest press: https://strengthlevel.com/strength-standards/chest-press
- Power clean: https://strengthlevel.com/strength-standards/power-clean
- Military press: https://strengthlevel.com/strength-standards/military-press
- Clean and jerk: https://strengthlevel.com/strength-standards/clean-and-jerk
- EZ-bar curl: https://strengthlevel.com/strength-standards/ez-bar-curl
- Snatch: https://strengthlevel.com/strength-standards/snatch
- Preacher curl: https://strengthlevel.com/strength-standards/preacher-curl
- Seated shoulder press: https://strengthlevel.com/strength-standards/seated-shoulder-press
- Barbell shrug: https://strengthlevel.com/strength-standards/barbell-shrug
- T-bar row: https://strengthlevel.com/strength-standards/t-bar-row
- Clean: https://strengthlevel.com/strength-standards/clean
- Push press: https://strengthlevel.com/strength-standards/push-press
- Decline bench press: https://strengthlevel.com/strength-standards/decline-bench-press
- Hang clean: https://strengthlevel.com/strength-standards/hang-clean
- Good morning: https://strengthlevel.com/strength-standards/good-morning
- Floor press: https://strengthlevel.com/strength-standards/floor-press
- Rack pull: https://strengthlevel.com/strength-standards/rack-pull
- Box squat: https://strengthlevel.com/strength-standards/box-squat
- Pendlay row: https://strengthlevel.com/strength-standards/pendlay-row
- Upright row: https://strengthlevel.com/strength-standards/upright-row
- Zercher squat: https://strengthlevel.com/strength-standards/zercher-squat
- Stiff-leg deadlift: https://strengthlevel.com/strength-standards/stiff-leg-deadlift
- Bulgarian split squat: https://strengthlevel.com/strength-standards/bulgarian-split-squat
- Barbell lunge: https://strengthlevel.com/strength-standards/barbell-lunge
- Reverse barbell curl: https://strengthlevel.com/strength-standards/reverse-barbell-curl
- Barbell calf raise: https://strengthlevel.com/strength-standards/barbell-calf-raise
- Clean and press: https://strengthlevel.com/strength-standards/clean-and-press
- Power snatch: https://strengthlevel.com/strength-standards/power-snatch
- Barbell reverse lunge: https://strengthlevel.com/strength-standards/barbell-reverse-lunge
- Barbell tricep extension: https://strengthlevel.com/strength-standards/tricep-extension
- Seated dumbbell shoulder press: https://strengthlevel.com/strength-standards/seated-dumbbell-shoulder-press
- Dumbbell Bulgarian split squat: https://strengthlevel.com/strength-standards/dumbbell-bulgarian-split-squat
- Dumbbell lunge: https://strengthlevel.com/strength-standards/dumbbell-lunge
- Dumbbell shrug: https://strengthlevel.com/strength-standards/dumbbell-shrug
- Arnold press: https://strengthlevel.com/strength-standards/arnold-press
- Dumbbell Romanian deadlift: https://strengthlevel.com/strength-standards/dumbbell-romanian-deadlift
- Dumbbell tricep extension: https://strengthlevel.com/strength-standards/dumbbell-tricep-extension
- Chest-supported dumbbell row: https://strengthlevel.com/strength-standards/chest-supported-dumbbell-row
- Incline dumbbell curl: https://strengthlevel.com/strength-standards/incline-dumbbell-curl
- Concentration curl: https://strengthlevel.com/strength-standards/dumbbell-concentration-curl
- Incline dumbbell fly: https://strengthlevel.com/strength-standards/incline-dumbbell-fly
- Dumbbell reverse fly: https://strengthlevel.com/strength-standards/dumbbell-reverse-fly
- Dumbbell front raise: https://strengthlevel.com/strength-standards/dumbbell-front-raise
- Dumbbell pullover: https://strengthlevel.com/strength-standards/dumbbell-pullover
- Dumbbell floor press: https://strengthlevel.com/strength-standards/dumbbell-floor-press
- Dumbbell squat: https://strengthlevel.com/strength-standards/dumbbell-squat
- Decline dumbbell bench press: https://strengthlevel.com/strength-standards/decline-dumbbell-bench-press
- Dumbbell deadlift: https://strengthlevel.com/strength-standards/dumbbell-deadlift
- Dumbbell tricep kickback: https://strengthlevel.com/strength-standards/dumbbell-tricep-kickback
- Tricep rope pushdown: https://strengthlevel.com/strength-standards/tricep-rope-pushdown
- Cable bicep curl: https://strengthlevel.com/strength-standards/cable-bicep-curl
- Close-grip lat pulldown: https://strengthlevel.com/strength-standards/close-grip-lat-pulldown
- Face pull: https://strengthlevel.com/strength-standards/face-pull
- Cable fly: https://strengthlevel.com/strength-standards/cable-fly
- Cable lateral raise: https://strengthlevel.com/strength-standards/cable-lateral-raise
- Cable crunch: https://strengthlevel.com/strength-standards/cable-crunch
- Reverse-grip lat pulldown: https://strengthlevel.com/strength-standards/reverse-grip-lat-pulldown
- Cable overhead tricep extension: https://strengthlevel.com/strength-standards/cable-overhead-tricep-extension
- Cable reverse fly: https://strengthlevel.com/strength-standards/cable-reverse-fly
- Straight-arm pulldown: https://strengthlevel.com/strength-standards/straight-arm-pulldown
- Cable pull-through: https://strengthlevel.com/strength-standards/cable-pull-through
- Horizontal leg press: https://strengthlevel.com/strength-standards/horizontal-leg-press
- Hack squat: https://strengthlevel.com/strength-standards/hack-squat
- Machine shoulder press: https://strengthlevel.com/strength-standards/machine-shoulder-press
- Machine chest fly: https://strengthlevel.com/strength-standards/machine-chest-fly
- Lying leg curl: https://strengthlevel.com/strength-standards/lying-leg-curl
- Machine calf raise: https://strengthlevel.com/strength-standards/machine-calf-raise
- Hip adduction: https://strengthlevel.com/strength-standards/hip-adduction
- Hip abduction: https://strengthlevel.com/strength-standards/hip-abduction
- Machine row: https://strengthlevel.com/strength-standards/machine-row
- Seated calf raise: https://strengthlevel.com/strength-standards/seated-calf-raise
- Smith machine bench press: https://strengthlevel.com/strength-standards/smith-machine-bench-press
- Smith machine squat: https://strengthlevel.com/strength-standards/smith-machine-squat
- Machine bicep curl: https://strengthlevel.com/strength-standards/machine-bicep-curl
- Seated dip machine: https://strengthlevel.com/strength-standards/seated-dip-machine
- Vertical leg press: https://strengthlevel.com/strength-standards/vertical-leg-press
- Machine reverse fly: https://strengthlevel.com/strength-standards/machine-reverse-fly
- Machine lateral raise: https://strengthlevel.com/strength-standards/machine-lateral-raise

## Using the tool

The calculator is the first content on the page. Results update immediately. Weight step buttons add or remove 2.5 kg or 5 lb; rep step buttons add or remove one rep within 1–30. Quick-set buttons select any rep count from 2 through 12. Weight and reps have equal-width fields. Changing kg/lb converts the weight and entered bodyweight. Training percentages, estimated rep maxes, and seven formula comparisons expand below the result. Training loads round to 2.5 kg or 5 lb increments in the selected unit. Copy links preserve the set, exercise, unit, and formula; bodyweight and comparison group stay in the current session.
