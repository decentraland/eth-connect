import expect from 'expect'
import * as formatters from '../src/utils/formatters'

let tests = [
  { value: 'latest', expected: 'latest' },
  { value: 'pending', expected: 'pending' },
  { value: 'earliest', expected: 'earliest' },
  { value: 1, expected: '0x1' },
  { value: '0x1', expected: '0x1' }
]

describe('lib/web3/formatters', function () {
  describe('inputDefaultBlockNumberFormatter', function () {
    tests.forEach(function (test) {
      it('should turn ' + test.value + ' to ' + test.expected, function () {
        expect(formatters.inputDefaultBlockNumberFormatter(test.value as any)).toStrictEqual(test.expected)
      })
    })
  })
})
