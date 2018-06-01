import chai = require('chai')
import utils = require('../src/utils/utils')
const assert = chai.assert

let tests = [
  { value: '0x6d79537472696e67', expected: 'myString' },
  { value: '0x6d79537472696e6700', expected: 'myString' },
  { value: '0x65787065637465642076616c7565000000000000000000000000000000000000', expected: 'expected value' }
]

describe('lib/utils/utils', function() {
  describe('toUtf8', function() {
    tests.forEach(function(test) {
      it('should turn ' + test.value + ' to ' + test.expected, function() {
        assert.strictEqual(utils.toUtf8(test.value), test.expected)
      })
    })
  })
})
