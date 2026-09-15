import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, effectScope, nextTick, reactive, shallowRef, watch, type Ref } from 'vue'
import { parse } from 'vue/compiler-sfc'

const { descriptor } = parse(readFileSync(new URL('../components/tools/OneRmDial.vue', import.meta.url), 'utf8'))
const script = ts.transpileModule(descriptor.scriptSetup!.content + '\nexports.dial = { direction, columns };', {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

test('localized result digits use numerical direction and keep the decimal column anchored', async t => {
  const props = reactive({ value: '62,5', numericValue: 62.5, decimalSeparator: ',' })
  const exports = {} as { dial: { direction: Ref<number>; columns: Ref<Array<{ character: string; place: number }>> } }
  const scope = effectScope()
  t.after(() => scope.stop())
  scope.run(() => runInNewContext(script, {
    exports, computed, shallowRef, watch, defineProps: () => props, withDefaults: (value: unknown) => value,
  }))
  assert.equal(exports.dial.columns.value.find(c => c.character === ',')!.place, 0)
  props.value = '70'; props.numericValue = 70
  await nextTick()
  assert.equal(exports.dial.direction.value, 1)
  props.value = '62,5'; props.numericValue = 62.5
  await nextTick()
  assert.equal(exports.dial.direction.value, -1)
  props.value = '1\u00a0000,5'; props.numericValue = 1000.5
  await nextTick()
  assert.equal(exports.dial.direction.value, 1)
  assert.equal(exports.dial.columns.value.find(c => c.character === ',')!.place, 0)
  props.value = '1,000.5'; props.decimalSeparator = '.'
  await nextTick()
  assert.equal(exports.dial.columns.value.find(c => c.character === '.')!.place, 0)
})
