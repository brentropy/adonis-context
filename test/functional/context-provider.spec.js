'use strict'

const test = require('japa')
const Ioc = require('@adonisjs/fold/src/Ioc')
const Registrar = require('@adonisjs/fold/src/Registrar')
const { join } = require('path')

test.group('ContextProvider', (group) => {
  let ioc, registrar

  group.beforeEach(() => {
    ioc = new Ioc()
    registrar = new Registrar(ioc)
    registrar.providers([
      join(__dirname, '..', '..', 'providers', 'ContextProvider')
    ])
    registrar.register()
  })

  test('context persists across async continuation', async (assert) => {
    assert.plan(2)
    const middleware = ioc.use('Context/Middleware')
    await Promise.all([
      middleware.handle({}, async () => {
        ioc.use('Context').set('key', 'value')
        await new Promise(resolve => setImmediate(resolve))
        assert.strictEqual(ioc.use('Context').get('key'), 'value')
      }),
      middleware.handle({}, async () => {
        assert.strictEqual(ioc.use('Context').get('key'), null)
      })
    ])
  })

  test('registers global middleware on boot', async (assert) => {
    assert.plan(1)
    ioc.fake('Server', () => {
      return {
        registerGlobal (namespaces) {
          assert.deepEqual(namespaces, ['Context/Middleware'])
        }
      }
    })
    await registrar.boot()
  })
})
