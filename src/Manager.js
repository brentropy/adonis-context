'use strict'

/**
 * Manages async hooks for tracking context
 */
class Manager {
  /**
   * @param {function(new:Store)} Store
   * @param {creatHook: function} asyncHooks
   * @param {function(): string} generateId
   */
  constructor (Store, { createHook }, generateId) {
    this.contexts = new Map()
    this.Store = Store
    this.default = new Store()
    this.current = this.default
    this.hook = createHook(this._hooks()).enable()
  }

  /**
   * Run an async function inside a new context.
   *
   * @param {function(): Promise} next
   * @return {Promise}
   */
  run (next) {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        const outer = this.current
        this.current = new this.Store()
        next().then(resolve, reject)
        this.current = outer
      })
    })
  }

  /**
   * Enable async hooks
   *
   * Hooks are enabled by default.
   */
  enable () {
    this.hook.enable()
  }

  /**
   * Disable async hooks
   *
   * Context will not be maintained in future event loop
   * iterations.
   */
  disable () {
    this.hook.disable()
  }

  /**
   * @private
   */
  _hooks () {
    return {
      init: (id) => {
        this.contexts.set(id, this.current)
      },

      before: (id) => {
        this.current = this.contexts.get(id)
      },

      after: () => {
        this.current = this.default
      },

      destroy: (id) => {
        this.contexts.delete(id)
      }
    }
  }
}

module.exports = Manager
