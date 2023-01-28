import expect from 'expect'
import { BigNumber } from '../src/utils/BigNumber'
import { AllSolidityEvents } from '../src/AllSolidityEvents'
import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

const provider = new FakeHttpProvider()

let name = 'event1'
let address = '0x1234567890123456789012345678901234567890'

let tests = [
  {
    abi: [
      {
        name: name,
        type: 'event' as const,
        inputs: [
          {
            name: 'a',
            type: 'int',
            indexed: false
          }
        ]
      }
    ],
    data: {
      logIndex: '0x1',
      transactionIndex: '0x10',
      transactionHash: '0x1234567890',
      address: address,
      blockHash: '0x1234567890',
      removed: false,
      blockNumber: '0x1',
      data:
        '0x' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '0000000000000000000000000000000000000000000000000000000000000004',
      topics: undefined
    },
    expected: {
      logIndex: 1,
      transactionIndex: 16,
      transactionHash: '0x1234567890',
      address: address,
      removed: false,
      blockHash: '0x1234567890',
      blockNumber: 1,
      data:
        '0x' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '0000000000000000000000000000000000000000000000000000000000000004',
      topics: undefined
    }
  },
  {
    abi: [
      {
        name: name,
        type: 'event' as const,
        anonymous: true,
        inputs: [
          {
            name: 'a',
            type: 'int',
            indexed: false
          }
        ]
      }
    ],
    data: {
      logIndex: '0x1',
      transactionIndex: '0x10',
      transactionHash: '0x1234567890',
      address: address,
      removed: false,
      blockHash: '0x1234567890',
      blockNumber: '0x1',
      data:
        '0x' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '0000000000000000000000000000000000000000000000000000000000000004',
      topics: []
    },
    expected: {
      logIndex: 1,
      transactionIndex: 16,
      transactionHash: '0x1234567890',
      address: address,
      removed: false,
      blockHash: '0x1234567890',
      blockNumber: 1,
      data:
        '0x' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '0000000000000000000000000000000000000000000000000000000000000004',
      topics: []
    }
  },
  {
    abi: [
      {
        name: name,
        type: 'event' as const,
        inputs: [
          {
            name: 'a',
            type: 'int',
            indexed: false
          },
          {
            name: 'b',
            type: 'int',
            indexed: true
          },
          {
            name: 'c',
            type: 'int',
            indexed: false
          },
          {
            name: 'd',
            type: 'int',
            indexed: true
          }
        ]
      }
    ],
    data: {
      logIndex: '0x1',
      transactionIndex: '0x10',
      transactionHash: '0x1234567890',
      address: address,
      blockHash: '0x1234567890',
      removed: false,
      blockNumber: '0x1',
      data:
        '0x' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '0000000000000000000000000000000000000000000000000000000000000004',
      topics: [
        '0x0e99121e9409665e680573fa7da0cb6651dbdcf10c95f585b92b2c9b9702cff9',
        '0x0000000000000000000000000000000000000000000000000000000000000010',
        '0x0000000000000000000000000000000000000000000000000000000000000002'
      ]
    },
    expected: {
      event: name,
      args: {
        a: new BigNumber(1),
        b: new BigNumber(16),
        c: new BigNumber(4),
        d: new BigNumber(2)
      },
      logIndex: 1,
      removed: false,
      transactionIndex: 16,
      data:
        '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004',
      topics: [
        '0x0e99121e9409665e680573fa7da0cb6651dbdcf10c95f585b92b2c9b9702cff9',
        '0x0000000000000000000000000000000000000000000000000000000000000010',
        '0x0000000000000000000000000000000000000000000000000000000000000002'
      ],
      transactionHash: '0x1234567890',
      address: address,
      blockHash: '0x1234567890',
      blockNumber: 1
    }
  }
]

describe('lib/web3/allevents', function () {
  describe('decode', function () {
    tests.forEach(function (tests, index) {
      it('tests no: ' + index, function () {
        let requestManager = new RequestManager(provider)
        let allEvents = new AllSolidityEvents(requestManager, tests.abi, address)
        let result = allEvents.decode(tests.data)
        expect(result).toEqual(tests.expected)
      })
    })
  })
})
