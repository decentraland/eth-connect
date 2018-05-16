import chai = require('chai')
const assert = chai.assert
import { Method } from '../dist'

describe('lib/web3/method', function() {
  describe('formatInput', function() {
    it('should format plain input', function() {
      // given
      let star = function(arg) {
        return arg + '*'
      }

      let method = new Method({
        name: 'dummy',
        call: 'dummy',
        inputFormatter: [star, star, star],
        params: 3
      })

      let args = ['1', '2', '3']
      let expectedArgs = ['1*', '2*', '3*']

      // when
      let result = method.formatInput(args)

      // then
      assert.deepEqual(result, expectedArgs)
    })

    it('should do nothing if there is no formatter', function() {
      // given
      let method = new Method({
        call: 'dummy',
        name: 'dummy',
        params: 3
      })
      let args = [1, 2, 3]

      // when
      let result = method.formatInput(args)

      // then
      assert.deepEqual(result, args)
    })
  })
})
