import expect from 'expect'
import { Method } from '../src'

describe('lib/web3/method', function () {
  describe('formatOutput', function () {
    it('should format plain output', function () {
      // given
      let formatter = function (args) {
        return args.map(function (arg) {
          return arg + '*'
        })
      }

      let method = new Method<string[]>({
        callName: 'dummy',
        params: 3,
        inputFormatter: [null, null, null],
        outputFormatter: formatter
      })
      let args = ['1', '2', '3']
      let expectedArgs = ['1*', '2*', '3*']

      // when
      let result = method.formatOutput(args)

      // then
      expect(result).toEqual(expectedArgs)
    })
  })
})
