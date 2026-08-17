import assert from 'node:assert/strict'
import { test } from 'node:test'
import { faqIndexLabel, faqPanelStyle, nextOpenFaq } from '../utils/faqAccordion.ts'

test('toggles the open item off when it is clicked again', () => {
  assert.equal(nextOpenFaq(2, 2), -1)
})

test('opens a different item and leaves only that one selected', () => {
  assert.equal(nextOpenFaq(0, 3), 3)
})

test('numbers items from 01', () => {
  assert.equal(faqIndexLabel(0), '01')
  assert.equal(faqIndexLabel(9), '10')
})

test('holds the panel closed until heights are measured', () => {
  assert.equal(faqPanelStyle(false, true, 120), undefined)
})

test('animates an open panel to its measured height', () => {
  assert.deepEqual(faqPanelStyle(true, true, 164), { gridTemplateRows: '164px' })
})

test('collapses a measured panel to zero rows', () => {
  assert.deepEqual(faqPanelStyle(true, false, 164), { gridTemplateRows: '0px' })
  assert.deepEqual(faqPanelStyle(true, true, 0), { gridTemplateRows: '0px' })
})
