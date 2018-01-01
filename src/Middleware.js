'use strict'

/**
 * Middleware executes the rest of the middleware stack in an async context
 */
class Middleware {
  /**
   * @param {Manager} manager
   */
  constructor (manager) {
    this.manager = manager
  }

  /**
   * Handle request
   *
   * @param {*}
   * @param {function(): Promise} next
   */
  async handle (_, next) {
    await this.manager.run(next)
  }
}

module.exports = Middleware
