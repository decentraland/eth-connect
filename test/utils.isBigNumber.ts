import * as chai from 'chai'
import * as utils from '../src/utils/utils'
import BigNumber from 'bignumber.js'
const assert = chai.assert

let tests = [
  {
    value: function() {
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

describe('lib/utils/utils', function() {
  describe('isBigNumber', function() {
    tests.forEach(function(test) {
      it('shoud test if value ' + test.value + ' is BigNumber: ' + test.is, function() {
        assert.equal(utils.isBigNumber(test.value), test.is)
      })
    })
  })
})
