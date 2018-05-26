import chai = require('chai')
const assert = chai.assert
import { Method } from '../dist'

describe('lib/web3/method', function() {
  describe('formatOutput', function() {
    it('should format plain output', function() {
      // given
      let formatter = function(args) {
        return args.map(function(arg) {
          return arg + '*'
        })
      }

      let method = new Method({
        name: 'dummy',
        callName: 'dummy',
        params: 3,
        outputFormatter: formatter
      })
      let args = ['1', '2', '3']
      let expectedArgs = ['1*', '2*', '3*']

      // when
      let result = method.formatOutput(args)

      // then
      assert.deepEqual(result, expectedArgs)
    })

    it('should do nothing if there is no formatter', function() {
      // given
      let method = new Method({
        name: 'dummy',
        callName: 'dummy',
        params: 3
      })
      let args = [1, 2, 3]

      // when
      let result = method.formatOutput(args)

      // then
      assert.deepEqual(result, args)
    })
  })
})
