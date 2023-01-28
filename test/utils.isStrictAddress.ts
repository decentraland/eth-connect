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
  { value: 'function', is: false },
  { value: {}, is: false },
  { value: '0xc6d9d2cd449a754c494264e1809c50e34d64562b', is: true },
  { value: 'c6d9d2cd449a754c494264e1809c50e34d64562b', is: false }
]

describe('lib/utils/utils', function () {
  describe('isStrictAddress', function () {
    tests.forEach(function (tests) {
      it('shoud tests if value ' + tests.value + ' is address: ' + tests.is, function () {
        expect(utils.isStrictAddress(tests.value)).toEqual(tests.is)
      })
    })
  })
})
