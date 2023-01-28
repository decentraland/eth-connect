import expect from 'expect'
import * as utils from '../src/utils/utils'
import { BigNumber } from '../src/utils/BigNumber'

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
  { value: new String('hello'), is: false },
  { value: new BigNumber(0), is: true },
  { value: 132, is: false },
  { value: '0x12', is: false }
]

describe('lib/utils/utils', function () {
  describe('isBigNumber', function () {
    tests.forEach(function (tests) {
      it('shoud tests if value ' + tests.value + ' is BigNumber: ' + tests.is, function () {
        expect(utils.isBigNumber(tests.value)).toEqual(tests.is)
      })
    })
  })
})
