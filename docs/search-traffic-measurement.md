# Organic search 2× measurement protocol

Doubling clicks or impressions is an observed outcome, not something a code change can guarantee. The repository includes a comparator that will make the claim only from equal, complete Google Search Console windows. It evaluates clicks and impressions independently and requires both outcomes for the combined 2× claim.

## Establish the baseline

Before deployment, open Google Search Console **Performance → Search results** for the `liftag.fit` property. Keep the default Web search type, use no query/page/country/device filters, select the **Date** dimension, and export daily CSV data for a fixed period such as the latest complete 28 days. Save the unedited export outside Git as `baseline.csv`. Record the deployment date and any major campaigns or outages separately.

Search Console commonly has a data delay. Do not include partial recent dates. Keep the same property, search type, and filters for every export. If seasonality is material, also compare the same dates year over year; the script's equal adjacent-window result is evidence of change, not proof that SEO work alone caused it.

## Measure the follow-up

After deployment and enough time for recrawling, export the same number of complete daily rows for a non-overlapping follow-up window. A 28-day baseline and 28-day follow-up is the minimum recommended operational check; retain longer 56- or 84-day views for noisy, low-volume traffic.

Run:

```bash
cd new_app
node --experimental-strip-types scripts/search-traffic-compare.ts \
  --baseline /path/to/baseline.csv \
  --followup /path/to/followup.csv \
  --output /path/to/search-comparison.json
```

The command rejects missing calendar dates, duplicate dates, unequal windows, overlapping periods, negative values, and exports without `Date`, `Clicks`, and `Impressions`. Duplicate dates usually mean that an extra dimension was exported; use an unedited report grouped only by Date.

The JSON records exact dates, day counts, totals, ratios, percentage changes, and separate pass/fail results. When a baseline is zero, it never invents an infinity ratio or percentage. Even a positive follow-up leaves the numeric 2× claim unproven because no finite ratio exists; zero followed by zero also cannot demonstrate growth.

## What counts as proof

The claim “organic clicks and impressions at least doubled” is supported only when:

1. the deployed technical audit has no errors;
2. the follow-up window is final and uses the same Search Console scope as the baseline;
3. `bothAtLeastDouble` is `true` in the generated comparison;
4. the underlying Search Console exports and comparison JSON are retained as evidence.

Until an actual Search Console baseline export and matching follow-up exist, report the work as an SEO implementation with a measurement plan. Do not imply that a traffic baseline has been registered from the repository audit, and do not project, extrapolate, or fabricate a 2× result.
