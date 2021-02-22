import * as expect from 'expect'
import * as utils from '../src/utils/utils'

let tests = [
  {
    value: function () {
      /* stub */
    },
    is: false
  },
  { value: new Function(), is: false },
  { value: 'function', is: true },
  { value: {}, is: false },
  { value: new String('hello'), is: true }
]

describe('lib/utils/utils', function () {
  describe('isString', function () {
    tests.forEach(function (test) {
      it('shoud test if value ' + test.value + ' is string: ' + test.is, function () {
        expect(utils.isString(test.value)).toEqual(test.is)
      })
    })
  })
})
