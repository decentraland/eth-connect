import expect from 'expect'
import { hexToBytes } from '../src'
import * as utils from '../src/utils/utf8'

let tests = [
  { value: '0x6d79537472696e67', expected: 'myString' },
  { value: '0x6d79537472696e6700', expected: 'myString\x00' },
  { value: hexToBytes('0x6d79537472696e6700'), expected: 'myString\x00' },
  { value: hexToBytes('6d79537472696e6700'), expected: 'myString\x00' },
  { value: '0x65787065637465642076616c75650000', expected: 'expected value\x00\x00' }
] as const

describe('lib/utils/utils', function () {
  describe('toUtf8', function () {
    tests.forEach(function (test) {
      it('should turn ' + test.value + ' to ' + test.expected, function () {
        expect(utils.bytesToUtf8String(test.value)).toEqual(test.expected)
      })
    })
  })
})
