'use strict'

const test = require('japa')
const Middleware = require('../../src/Middleware')

test.group('Middleware', (group) => {
  let manager, middleware

  group.beforeEach(() => {
    manager = {}
    middleware = new Middleware(manager)
  })

  test('awaits running next with manager', async (assert) => {
    assert.plan(1)
    const next = () => Promise.resolve()
    manager.run = (fn) => {
      assert.equal(fn, next)
    }
    await middleware.handle({}, next)
  })
})
