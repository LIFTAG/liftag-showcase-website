#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export interface DailySearchMetric {
  date: string
  clicks: number
  impressions: number
}

export interface SearchPeriod {
  start: string
  end: string
  days: number
  clicks: number
  impressions: number
}

export interface MetricOutcome {
  baseline: number
  followup: number
  ratio: number | null
  percentChange: number | null
  atLeastDouble: boolean
  explanation: string
}

export interface TrafficComparison {
  generatedAt: string
  baseline: SearchPeriod
  followup: SearchPeriod
  outcomes: {
    clicks: MetricOutcome
    impressions: MetricOutcome
  }
  bothAtLeastDouble: boolean
  methodology: string[]
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index += 1 }
      else quoted = !quoted
    }
    else if (char === ',' && !quoted) { row.push(field); field = '' }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(field); field = ''
      if (row.some(value => value.trim())) rows.push(row)
      row = []
    }
    else field += char
  }
  if (quoted) throw new Error('CSV has an unterminated quoted field.')
  if (field || row.length) { row.push(field); if (row.some(value => value.trim())) rows.push(row) }
  return rows
}

function normalizedHeader(value: string): string {
  return value.trim().toLowerCase().replace(/^\ufeff/, '')
}

function metricNumber(value: string | undefined, field: string, row: number): number {
  const normalized = (value ?? '').trim().replaceAll(' ', '').replaceAll(',', '')
  if (!/^\d+$/.test(normalized)) throw new Error(`Row ${row}: ${field} must be a non-negative integer; got ${JSON.stringify(value ?? '')}.`)
  const number = Number(normalized)
  if (!Number.isFinite(number)) throw new Error(`Row ${row}: ${field} is not finite.`)
  return number
}

export function parseSearchConsoleCsv(text: string): DailySearchMetric[] {
  const rows = parseCsvRows(text)
  if (rows.length < 2) throw new Error('CSV must contain a header and at least one data row.')
  const headers = rows[0]!.map(normalizedHeader)
  const dateIndex = headers.indexOf('date')
  const clicksIndex = headers.indexOf('clicks')
  const impressionsIndex = headers.indexOf('impressions')
  if (dateIndex < 0 || clicksIndex < 0 || impressionsIndex < 0) throw new Error('CSV headers must include Date, Clicks, and Impressions. Export Search Console Performance with the Date dimension.')
  const byDate = new Map<string, DailySearchMetric>()
  for (const [offset, row] of rows.slice(1).entries()) {
    const rowNumber = offset + 2
    const date = (row[dateIndex] ?? '').trim()
    const timestamp = Date.parse(`${date}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) throw new Error(`Row ${rowNumber}: invalid ISO date ${JSON.stringify(date)}.`)
    if (byDate.has(date)) throw new Error(`Row ${rowNumber}: duplicate date ${date}. Use an unedited Search Console export grouped only by Date.`)
    byDate.set(date, {
      date,
      clicks: metricNumber(row[clicksIndex], 'Clicks', rowNumber),
      impressions: metricNumber(row[impressionsIndex], 'Impressions', rowNumber),
    })
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

function epochDay(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000
}

function summarize(rows: DailySearchMetric[], label: string): SearchPeriod {
  if (!rows.length) throw new Error(`${label} period has no daily rows.`)
  for (let index = 1; index < rows.length; index += 1) {
    if (epochDay(rows[index]!.date) - epochDay(rows[index - 1]!.date) !== 1) throw new Error(`${label} period is incomplete: missing one or more dates between ${rows[index - 1]!.date} and ${rows[index]!.date}.`)
  }
  return {
    start: rows[0]!.date,
    end: rows.at(-1)!.date,
    days: rows.length,
    clicks: rows.reduce((sum, row) => sum + row.clicks, 0),
    impressions: rows.reduce((sum, row) => sum + row.impressions, 0),
  }
}

export function compareMetric(baseline: number, followup: number): MetricOutcome {
  if (baseline === 0) {
    return {
      baseline,
      followup,
      ratio: null,
      percentChange: null,
      atLeastDouble: false,
      explanation: followup > 0
        ? 'The baseline was zero and the follow-up was positive. Growth occurred, but a numeric 2× claim is unproven because no finite ratio exists.'
        : 'Both periods are zero, so growth and a 2× result cannot be demonstrated.',
    }
  }
  const ratio = followup / baseline
  return {
    baseline,
    followup,
    ratio,
    percentChange: (ratio - 1) * 100,
    atLeastDouble: ratio >= 2,
    explanation: ratio >= 2 ? `Follow-up is ${ratio.toFixed(3)}× baseline.` : `Follow-up is ${ratio.toFixed(3)}× baseline; the 2× threshold was not reached.`,
  }
}

export function compareTraffic(baselineRows: DailySearchMetric[], followupRows: DailySearchMetric[]): TrafficComparison {
  const baseline = summarize(baselineRows, 'Baseline')
  const followup = summarize(followupRows, 'Follow-up')
  if (baseline.days !== followup.days) throw new Error(`Periods must have equal complete windows; baseline has ${baseline.days} days and follow-up has ${followup.days}.`)
  if (epochDay(followup.start) <= epochDay(baseline.end)) throw new Error('Follow-up must start after the baseline ends; overlapping periods are not comparable proof.')
  const clicks = compareMetric(baseline.clicks, followup.clicks)
  const impressions = compareMetric(baseline.impressions, followup.impressions)
  return {
    generatedAt: new Date().toISOString(),
    baseline,
    followup,
    outcomes: { clicks, impressions },
    bothAtLeastDouble: clicks.atLeastDouble && impressions.atLeastDouble,
    methodology: [
      'Google Search Console daily exports are aggregated by date.',
      'Both windows contain the same number of consecutive calendar days and do not overlap.',
      'Clicks and impressions are evaluated independently; both must reach at least 2.000× for the combined claim.',
      'Search Console data can lag and should be exported only after every day in the follow-up window is final.',
    ],
  }
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log('Usage: node --experimental-strip-types scripts/search-traffic-compare.ts --baseline baseline.csv --followup followup.csv [--output comparison.json]')
    return
  }
  const baselinePath = arg('--baseline')
  const followupPath = arg('--followup')
  if (!baselinePath || !followupPath) throw new Error('Both --baseline and --followup CSV files are required.')
  const comparison = compareTraffic(
    parseSearchConsoleCsv(await readFile(resolve(baselinePath), 'utf8')),
    parseSearchConsoleCsv(await readFile(resolve(followupPath), 'utf8')),
  )
  const json = `${JSON.stringify(comparison, null, 2)}\n`
  const output = arg('--output')
  if (output) await writeFile(resolve(output), json, 'utf8')
  console.log(`Clicks: ${comparison.outcomes.clicks.explanation}`)
  console.log(`Impressions: ${comparison.outcomes.impressions.explanation}`)
  console.log(`Both at least doubled: ${comparison.bothAtLeastDouble ? 'YES' : 'NO'}`)
  if (!output) process.stdout.write(json)
  if (!comparison.bothAtLeastDouble) process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main()
