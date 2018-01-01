'use strict'

const RuntimeException = require('./RuntimeException')

/**
 * Store nested keys and values for an asynchronous context.
 */
class Store {
  constructor () {
    this._store = {}
  }

  /**
   * Set a value in the context store.
   *
   * @param {string} key nested keys are seperated by dots
   * @param {*} value
   * @throws {RuntimeException}
   */
  set (key, value) {
    const path = this._path(key)
    const lastProp = path.pop()
    let store = this._store
    for (let prop of path) {
      if (store[prop] == null) {
        store[prop] = {}
      } else if (typeof store[prop] !== 'object') {
        throw RuntimeException.setPropNonObject(prop)
      }
      store = store[prop]
    }
    store[lastProp] = value
  }

  /**
   * Get the value of a key form the context store.
   *
   * @param {string} key nested keys are seperated by dots
   * @param {*} [fallback] the value to return if the key is not set
   * @return {*}
   */
  get (key, fallback = null) {
    return this._get(key) || fallback
  }

  /**
   * @private
   * @param {string} key
   * @return {*}
   */
  _get (key) {
    const path = this._path(key)
    let value = this._store
    for (let prop of path) {
      if (value[prop] == null) {
        return null
      }
      value = value[prop]
    }
    return value
  }

  /**
   * @private
   * @param {string} key
   * @return {string[]}
   */
  _path (key) {
    return key.split('.')
  }
}

module.exports = Store
