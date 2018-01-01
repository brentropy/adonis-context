'use strict'

const test = require('japa')
const Manager = require('../../src/Manager')

test.group('Manager', (group) => {
  let Store, manager, asyncHooks, hook

  group.beforeEach(() => {
    Store = class { set () {} }
    hook = { enable: () => hook, disable: () => hook }
    asyncHooks = { createHook: () => hook }
    manager = new Manager(Store, asyncHooks)
  })

  test('creates a default store', (assert) => {
    assert.instanceOf(manager.default, Store)
  })

  test('sets current to default', (assert) => {
    assert.equal(manager.current, manager.default)
  })

  test('registers async hooks', (assert) => {
    assert.plan(2)
    asyncHooks.createHook = (hooks) => {
      assert.deepEqual()
      return hook
    }
    const manager = new Manager(Store, asyncHooks, () => {})
    assert.equal(manager.hook, hook)
  })

  test('is enabled by default', (assert) => {
    assert.plan(1)
    hook.enable = () => {
      assert.ok(true)
    }
    new Manager(Store, asyncHooks, () => {}) // eslint-disable-line no-new
  })

  test('run executes next with a new current context', async (assert) => {
    assert.plan(1)
    await manager.run(async () => {
      assert.notEqual(manager.current, manager.default)
    })
  })

  test('run sets current context back after next', async (assert) => {
    const current = {}
    manager.current = current
    await manager.run(async () => {})
    assert.equal(manager.current, current)
  })

  test('can be enabled', (assert) => {
    assert.plan(1)
    hook.enable = () => {
      assert.ok(true)
    }
    manager.enable()
  })

  test('can be disabled', (assert) => {
    assert.plan(1)
    hook.disable = () => {
      assert.ok(true)
    }
    manager.disable()
  })
})

test.group('Manager Hooks', (group) => {
  let manager, hooks, id

  group.beforeEach(() => {
    id = 123
    manager = new Manager(class {}, {
      createHook (obj) {
        hooks = obj
        return { enable () {} }
      }
    })
  })

  test('init maps current context to id', (assert) => {
    manager.current = {}
    hooks.init(id)
    assert.strictEqual(manager.contexts.get(id), manager.current)
  })

  test('before sets current to context mapped to id', (assert) => {
    manager.contexts.set(id, {})
    hooks.before(id)
    assert.strictEqual(manager.current, manager.contexts.get(id))
  })

  test('after sets current context to default context', (assert) => {
    manager.default = {}
    hooks.after(id)
    assert.strictEqual(manager.current, manager.default)
  })

  test('destroy deletes id from context map', (assert) => {
    manager.contexts.set(id, 'context')
    hooks.destroy(id)
    assert.strictEqual(manager.contexts.get(id), undefined)
  })
})
