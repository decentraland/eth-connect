import chai = require('chai')
const assert = chai.assert
import * as formatters from '../src/utils/formatters'
import { Quantity, Tag } from '../src/Schema';

let tests: { value: Quantity | Tag, expected: any }[] = [
  { value: 'latest', expected: 'latest' },
  { value: 'pending', expected: 'pending' },
  { value: 'earliest', expected: 'earliest' },
  { value: 1, expected: '0x1' },
  // FIXME: should we support this?
  { value: '0x1' as any, expected: '0x1' }
]

describe('lib/web3/formatters', function () {
  describe('inputDefaultBlockNumberFormatter', function () {
    tests.forEach(function (test) {
      it('should turn ' + test.value + ' to ' + test.expected, function () {
        assert.strictEqual(formatters.inputDefaultBlockNumberFormatter(test.value), test.expected)
      })
    })
  })
})
