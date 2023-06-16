import { Method } from '../src'
import * as errors from '../src/utils/errors'

describe('lib/web3/method', function () {
  describe('validateArgs', function () {
    it('should pass', function () {
      // given
      let method = new Method({
        callName: 'dummy',
        params: 1,
        inputFormatter: [null],
        outputFormatter: (x) => x
      })

      let args = [1]
      let args2 = ['heloas']

      // when
      let test = function () {
        method.validateArgs(args)
      }
      let test2 = function () {
        method.validateArgs(args2)
      }

      // then
      expect(test).not.toThrow()
      expect(test2).not.toThrow()
    })

    it('should return call based on args', function () {
      // given
      let method = new Method<any>({
        callName: 'dummy',
        params: 2,
        inputFormatter: [null, null],
        outputFormatter: (x) => x
      })

      let args = [1]
      let args2 = ['heloas', '12', 3]

      // when
      let test = function () {
        method.validateArgs(args)
      }
      let test2 = function () {
        method.validateArgs(args2)
      }

      // then
      expect(test).toThrow(errors.InvalidNumberOfRPCParams('dummy', 1, 2).message)
      expect(test2).toThrow(errors.InvalidNumberOfRPCParams('dummy', 3, 2).message)
    })
  })
})
