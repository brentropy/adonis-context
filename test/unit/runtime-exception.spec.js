'use strict'

const test = require('japa')
const RuntimeException = require('../../src/RuntimeException')

test.group('RuntimeException', (group) => {
  test('setPropNonObject creates correct runtime exception', (assert) => {
    const key = 'testkey'
    const err = RuntimeException.setPropNonObject(key)
    assert.include(err.message, key)
    assert.strictEqual(err.status, 500)
    assert.strictEqual(err.code, 'E_SET_NON_OBJECT')
  })
})
