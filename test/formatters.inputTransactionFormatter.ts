import * as expect from 'expect'
import * as formatters from '../src/utils/formatters'
import { BigNumber } from '../src'

let tests = [
  {
    input: {
      data: '0x34234bf23bf4234',
      value: new BigNumber(100),
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      nonce: 1000,
      gas: 1000,
      gasPrice: new BigNumber(1000)
    },
    result: {
      data: '0x34234bf23bf4234',
      value: '0x64',
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      nonce: '0x3e8',
      gas: '0x3e8',
      gasPrice: '0x3e8'
    }
  },
  {
    input: {
      data: '0x34234bf23bf4234',
      value: new BigNumber(100),
      from: '00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '00c5496aee77c1ba1f0854206a26dda82a81d6d8'
    },
    result: {
      data: '0x34234bf23bf4234',
      value: '0x64',
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8'
    }
  },
  {
    input: {
      data: '0x34234bf23bf4234',
      value: new BigNumber(100),
      from: '00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      gas: '1000',
      gasPrice: new BigNumber(1000)
    },
    result: {
      data: '0x34234bf23bf4234',
      value: '0x64',
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      gas: '0x3e8',
      gasPrice: '0x3e8'
    }
  },
  {
    input: {
      data: '0x34234bf23bf4234',
      value: new BigNumber(100),
      from: '00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      gas: '1000',
      gasPrice: new BigNumber(1000)
    },
    result: {
      data: '0x34234bf23bf4234',
      value: '0x64',
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      gas: '0x3e8',
      gasPrice: '0x3e8'
    }
  },
  {
    input: {
      data: '0x34234bf23bf4234',
      value: new BigNumber(100),
      from: '00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      gas: '1000',
      gasPrice: new BigNumber(1000)
    },
    result: {
      data: '0x34234bf23bf4234',
      value: '0x64',
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      gas: '0x3e8',
      gasPrice: '0x3e8'
    }
  }
]

describe('formatters', function() {
  describe('inputTransactionFormatter', function() {
    tests.forEach(function(test, i) {
      it('should return the correct value: ' + i, function() {
        expect(formatters.inputTransactionFormatter(test.input)).toEqual(test.result)
      })
    })
  })
})
