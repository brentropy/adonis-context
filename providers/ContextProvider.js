'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class ContextProvider extends ServiceProvider {
  _registerManager () {
    this.app.singleton('Context/Manager', () => {
      const Manager = require('../src/Manager')
      const Store = require('../src/Store')
      const asyncHooks = require('async_hooks')
      return new Manager(Store, asyncHooks)
    })
  }

  _registerStore () {
    this.app.bind('Context/Store', () => {
      const manager = this.app.use('Context/Manager')
      return manager.current
    })
    this.app.alias('Context/Store', 'Context')
  }

  _registerMiddleware () {
    this.app.singleton('Context/Middleware', () => {
      const Middleware = require('../src/Middleware')
      const manager = this.app.use('Context/Manager')
      return new Middleware(manager)
    })
  }

  register () {
    this._registerManager()
    this._registerStore()
    this._registerMiddleware()
  }

  boot () {
    // this is before global middlewares registered in start/kernel.js
    this.app.use('Server').registerGlobal(['Context/Middleware'])
  }
}

module.exports = ContextProvider
