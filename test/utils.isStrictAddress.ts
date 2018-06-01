import chai = require('chai')
import utils = require('../src/utils/utils')
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
  { value: '0xc6d9d2cd449a754c494264e1809c50e34d64562b', is: true },
  { value: 'c6d9d2cd449a754c494264e1809c50e34d64562b', is: false }
]

describe('lib/utils/utils', function() {
  describe('isStrictAddress', function() {
    tests.forEach(function(test) {
      it('shoud test if value ' + test.value + ' is address: ' + test.is, function() {
        assert.equal(utils.isStrictAddress(test.value), test.is)
      })
    })
  })
})
