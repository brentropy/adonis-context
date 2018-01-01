'use strict'

const test = require('japa')
const Store = require('../../src/Store')
const RuntimeException = require('../../src/RuntimeException')

test.group('Store', (group) => {
  let store

  group.beforeEach(() => {
    store = new Store()
  })

  test('getting a key without a value returns null', (assert) => {
    assert.strictEqual(store.get('notSet'), null)
  })

  test('getting a key without a value returns fallback', (assert) => {
    const fallback = 'fallback'
    assert.strictEqual(store.get('notSet', fallback), fallback)
  })

  test('getting a key returns the set value', (assert) => {
    const value = 'value'
    store.set('set', value)
    assert.strictEqual(store.get('set'), value)
    assert.strictEqual(store.get('set', 'fallback'), value)
  })

  test('getting a nested path returns the set value', (assert) => {
    const value = 'value'
    store.set('dot.separeted.path', value)
    assert.strictEqual(store.get('dot.separeted.path'), value)
  })

  test('getting a path with nested vaules returns the object', (assert) => {
    const value = 'value'
    store.set('dot.separeted.path', value)
    assert.deepEqual(store.get('dot.separeted'), { path: value })
  })

  test('setting a nested prop of a non-object throws', (assert) => {
    store.set('a.b', 123)
    assert.throws(() => store.set('a.b.c', 4), RuntimeException)
  })
})
