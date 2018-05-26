import chai = require('chai')
const assert = chai.assert
import { Method } from '../dist'
import errors = require('../dist/utils/errors')

describe('lib/web3/method', function() {
  describe('validateArgs', function() {
    it('should pass', function() {
      // given
      let method = new Method({
        name: 'dummy',
        callName: 'dummy',
        params: 1
      })

      let args = [1]
      let args2 = ['heloas']

      // when
      let test = function() {
        method.validateArgs(args)
      }
      let test2 = function() {
        method.validateArgs(args2)
      }

      // then
      assert.doesNotThrow(test)
      assert.doesNotThrow(test2)
    })

    it('should return call based on args', function() {
      // given
      let method = new Method({
        name: 'dummy',
        callName: 'dummy',
        params: 2
      })

      let args = [1]
      let args2 = ['heloas', '12', 3]

      // when
      let test = function() {
        method.validateArgs(args)
      }
      let test2 = function() {
        method.validateArgs(args2)
      }

      // then
      assert.throws(test, errors.InvalidNumberOfRPCParams('dummy', 1, 2).message)
      assert.throws(test2, errors.InvalidNumberOfRPCParams('dummy', 3, 2).message)
    })
  })
})
