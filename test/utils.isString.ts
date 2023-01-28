import expect from 'expect'
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
    tests.forEach(function (tests) {
      it('shoud tests if value ' + tests.value + ' is string: ' + tests.is, function () {
        expect(utils.isString(tests.value)).toEqual(tests.is)
      })
    })
  })
})
