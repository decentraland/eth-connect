import * as expect from 'expect'
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
    tests.forEach(function (test) {
      it('shoud test if value ' + test.func + ' is function: ' + test.is, function () {
        expect(utils.isFunction(test.func)).toEqual(test.is)
      })
    })
  })
})
