'use strict'

const NE = require('node-exceptions')

/**
 * Wrapper for runtime exceptions
 */
class RuntimeException extends NE.RuntimeException {
  /**
   * Create exception for setting a property of a non-object in a store
   *
   * @param {string} key
   * @return {RuntimeException}
   */
  static setPropNonObject (key) {
    const msg = `Cannot set property of ${key} (not an object)`
    return new this(msg, 500, 'E_SET_NON_OBJECT')
  }
}

module.exports = RuntimeException
