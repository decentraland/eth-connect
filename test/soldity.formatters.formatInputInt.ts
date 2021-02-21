import * as expect from 'expect'
import * as formatters from '../src/solidity/formatters'
import { SolidityParam } from '../src/solidity/param'

let tests = [
  { input: 1, result: new SolidityParam('0000000000000000000000000000000000000000000000000000000000000001') },
  { input: 1.1, result: new SolidityParam('0000000000000000000000000000000000000000000000000000000000000001') },
  { input: -1.1, result: new SolidityParam('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') },
  { input: -1, result: new SolidityParam('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') }
]

describe('formatters', function () {
  describe('inputAddressFormatter', function () {
    tests.forEach(function (test) {
      it('should return the correct value', function () {
        expect(formatters.formatInputInt(test.input)).toEqual(test.result)
      })
    })
  })
})
