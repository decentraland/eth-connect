import expect from 'expect'
import * as utils from '../src/utils/utils'

let tests = [
  {
    func: function () {
      /* */
    },
    is: true
  },
  { func: () => void 0, is: true },
  { func: new Function(), is: true },
  { func: 'function', is: false },
  { func: {}, is: false }
]

describe('lib/utils/utils', function () {
  describe('isFunction', function () {
    tests.forEach(function (tests) {
      it('shoud tests if value ' + tests.func + ' is function: ' + tests.is, function () {
        expect(utils.isFunction(tests.func)).toEqual(tests.is)
      })
    })
  })
})
