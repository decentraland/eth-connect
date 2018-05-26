import chai = require('chai')
const assert = chai.assert
import { RequestManager, ContractFactory } from '../dist'
import { future } from '../dist/utils/future'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { FakeHttpProvider2 } from './helpers/FakeHttpProvider2'

import BigNumber from 'bignumber.js'
import { sha3 } from '../dist/utils/utils'

let desc = [
  {
    name: 'balance(address)',
    type: 'function',
    inputs: [
      {
        name: 'who',
        type: 'address'
      }
    ],
    constant: true,
    outputs: [
      {
        name: 'value',
        type: 'uint256'
      }
    ]
  },
  {
    name: 'send(address,uint256)',
    type: 'function',
    inputs: [
      {
        name: 'to',
        type: 'address'
      },
      {
        name: 'value',
        type: 'uint256'
      }
    ],
    outputs: [],
    payable: true
  },
  {
    name: 'testArr(int[])',
    type: 'function',
    inputs: [
      {
        name: 'value',
        type: 'int[]'
      }
    ],
    constant: true,
    outputs: [
      {
        name: 'd',
        type: 'int'
      }
    ]
  },
  {
    name: 'Changed',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: true },
      { name: 't1', type: 'uint256', indexed: false },
      { name: 't2', type: 'uint256', indexed: false }
    ]
  }
]

let address = '0x1234567890123456789012345678901234567891'

describe('contract', function() {
  describe('event', function() {
    it('should create event filter', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      rm.debug = false
      let signature = 'Changed(address,uint256,uint256,uint256)'

      const newFilterFuture = provider.mockNewFilter({
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x000000000000000000000000000000000000000000000000000000000000000a'
        ],
        address: '0x1234567890123456789012345678901234567891'
      })

      const getFilterLogs = provider.mockGetFilterLogs([
        {
          address: address,
          topics: [
            '0x' + sha3(signature),
            '0x0000000000000000000000001234567890123456789012345678901234567891',
            '0x0000000000000000000000000000000000000000000000000000000000000001'
          ],
          number: 2,
          data:
            '0x0000000000000000000000000000000000000000000000000000000000000001' +
            '0000000000000000000000000000000000000000000000000000000000000008'
        }
      ])

      const batchResults = provider.mockGetFilterChanges({
        address,
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001'
        ]
      })

      const uninstallFilerCalled = provider.mockUninstallFilter()
      let contract = await new ContractFactory(rm, desc).at(address)

      let res = 0
      const done = future()

      let event = await contract.events.Changed({ from: address, amount: 10 })

      await event.getLogs()

      await event.watch(function(result: any) {
        try {
          assert.equal(result.args.from, address)
          assert.equal(result.args.amount, 1)
          assert.equal(result.args.t1, 1)
          assert.equal(result.args.t2, 8)
          res++
          if (res === 2) {
            done.resolve(1)
          }
        } catch (e) {
          done.reject(e)
        }
      })

      await done

      await event.stop()

      await newFilterFuture

      await getFilterLogs

      await batchResults

      await uninstallFilerCalled
    })

    it('should create event filter and watch immediately', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)

      let signature = 'Changed(address,uint256,uint256,uint256)'

      const newFilterFuture = provider.mockNewFilter({
        topics: ['0x' + sha3(signature), '0x0000000000000000000000001234567890123456789012345678901234567891', null],
        address: '0x1234567890123456789012345678901234567891'
      })

      const getFilterLogs = provider.mockGetFilterLogs([
        {
          address: address,
          topics: [
            '0x' + sha3(signature),
            '0x0000000000000000000000001234567890123456789012345678901234567891',
            '0x0000000000000000000000000000000000000000000000000000000000000001'
          ],
          number: 2,
          data:
            '0x0000000000000000000000000000000000000000000000000000000000000001' +
            '0000000000000000000000000000000000000000000000000000000000000008'
        }
      ])

      const batchResults = provider.mockGetFilterChanges({
        address,
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001'
        ]
      })

      const uninstallFilerCalled = provider.mockUninstallFilter()

      let contract = await new ContractFactory(rm, desc).at(address)

      const done = future()

      let event = await contract.events.Changed({ from: address })

      await event.watch(function(result: any) {
        try {
          assert.equal(result.args.from, address)
          assert.equal(result.args.amount, 1)
          assert.equal(result.args.t1, 1)
          assert.equal(result.args.t2, 8)

          done.resolve(1)
        } catch (e) {
          done.reject(e)
        }
      })

      await event.getLogs()

      await done
      await event.stop()
      await newFilterFuture
      await getFilterLogs
      await batchResults
      await uninstallFilerCalled
    })

    it('should create all event filter', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      rm.debug = false
      let signature = 'Changed(address,uint256,uint256,uint256)'

      const newFilterCalled = provider.injectValidation(async payload => {
        if (payload.method !== 'eth_newFilter') return false

        provider.injectResult('0x3')

        assert.deepEqual(payload.params[0], {
          topics: [],
          address: '0x1234567890123456789012345678901234567891'
        })
      })

      const getFilterLogsCalled = provider.mockGetFilterLogs({
        address: address,
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001'
        ],
        number: 2,
        data:
          '0x0000000000000000000000000000000000000000000000000000000000000001' +
          '0000000000000000000000000000000000000000000000000000000000000008'
      })

      const getFilterChangesCalled = provider.mockGetFilterChanges({
        address: address,
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001'
        ],
        number: 2,
        data:
          '0x0000000000000000000000000000000000000000000000000000000000000001' +
          '0000000000000000000000000000000000000000000000000000000000000008'
      })

      let contract = await new ContractFactory(rm, desc).at(address)

      let res = 0
      let event = await contract.events.allEvents(void 0)
      const done = future()

      await event.getLogs()

      await event.watch(function(result: any) {
        try {
          if (typeof result === 'string') throw new Error('Result as a string: ' + result)
          assert.equal(result.args.from, address)
          assert.equal(result.args.amount, 1)
          assert.equal(result.args.t1, 1)
          assert.equal(result.args.t2, 8)
          res++
          if (res === 2) {
            done.resolve(1)
          }
        } catch (e) {
          done.reject(e)
        }
      })

      await done

      await newFilterCalled
      await getFilterLogsCalled
      await getFilterChangesCalled

      const didCallUninstall = provider.mockUninstallFilter()
      await event.stop()
      await didCallUninstall
    })

    it('should call constant function', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'

      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_call')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address
          },
          'latest'
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address)
      assert.deepEqual(new BigNumber(0x32), r)
    })

    it('should call constant function with default block', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'

      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_call')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address
          },
          '0xb'
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address, 11)
      assert.deepEqual(new BigNumber(0x32), r)
    })

    it('should sendTransaction to contract function', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_sendTransaction')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000001234567890123456789012345678901234567891' +
              '0000000000000000000000000000000000000000000000000000000000000011',
            from: address,
            to: address
          }
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, 17, { from: address })
    })

    it('should make a call with optional params', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_call')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
            from: address,
            gas: '0xc350'
          },
          'latest'
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address, { from: address, gas: 50000 })
      assert.deepEqual(new BigNumber(0x32), r)
    })

    it('should throw if called with optional params without all args', function(done) {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_call')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
            from: address,
            gas: '0xc350'
          },
          'latest'
        ])
      })

      new ContractFactory(rm, desc)
        .at(address)
        .then((contract: any) => {
          contract
            .balance({ from: address, gas: 50000 })
            .then(() => done('did not fail'))
            .catch(() => done())
        })
        .catch(() => done('cannot create contract'))
    })

    it('should explicitly make a call with optional params', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_call')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
            from: address,
            gas: '0xc350'
          },
          'latest'
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address, { from: address, gas: 50000 })
      assert.deepEqual(new BigNumber(0x32), r)
    })

    it('should explicitly make a call with optional params and defaultBlock', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_call')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
            from: address,
            gas: '0xc350'
          },
          '0xb'
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address, { from: address, gas: 50000 }, 11)
      assert.deepEqual(new BigNumber(0x32), r)
    })

    it('it should throw if sendTransaction with optional params without all args', function(done) {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_sendTransaction')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000001234567890123456789012345678901234567891' +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: address,
            from: address,
            gas: '0xc350',
            gasPrice: '0xbb8',
            value: '0x2710'
          }
        ])
      })

      new ContractFactory(rm, desc)
        .at(address)
        .then((contract: any) => {
          contract
            .send(address, { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
            .then(() => done('did not fail'))
            .catch(() => done())
        })
        .catch(() => done('cannot create contract'))
    })

    it('should sendTransaction with optional params', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_sendTransaction')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000001234567890123456789012345678901234567891' +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: address,
            from: address,
            gas: '0xc350',
            gasPrice: '0xbb8',
            value: '0x2710'
          }
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, 17, { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
    })

    it('should sendTransaction with bigNum param and optional params', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_sendTransaction')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000001234567890123456789012345678901234567891' +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: address,
            from: address,
            gas: '0xc350',
            gasPrice: '0xbb8',
            value: '0x2710'
          }
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, new BigNumber(17), { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
    })

    it('should explicitly sendTransaction with optional params', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_sendTransaction')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000001234567890123456789012345678901234567891' +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: address,
            from: address,
            gas: '0xc350',
            gasPrice: '0xbb8',
            value: '0x2710'
          }
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, 17, { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
    })

    it('should explicitly sendTransaction with optional params and call callback without error', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let address = '0x1234567890123456789012345678901234567891'
      let signature = 'send(address,uint256)'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_sendTransaction')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000001234567890123456789012345678901234567891' +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: address,
            from: address,
            gas: '0xc350',
            gasPrice: '0xbb8',
            value: '0x2710'
          }
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, 17, { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
    })

    it('should explicitly estimateGas with optional params', async function() {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_estimateGas')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000001234567890123456789012345678901234567891' +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: address,
            from: address,
            gas: '0xc350',
            gasPrice: '0xbb8',
            value: '0x2710'
          }
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send.estimateGas(address, 17, { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
    })

    it('should call testArr method and properly parse result', async function() {
      let provider = new FakeHttpProvider2()
      const rm = new RequestManager(provider)
      let signature = 'testArr(int[])'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectResultList([
        {
          result: '0x0000000000000000000000000000000000000000000000000000000000000005'
        }
      ])

      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_call')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000000000000000000000000000000000000000000020' +
              '0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000003',
            to: address
          },
          'latest'
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)
      let result = await contract.testArr([3])

      assert.deepEqual(new BigNumber(5), result)
    })

    it('should call testArr method, properly parse result and return the result async', async function() {
      let provider = new FakeHttpProvider2()
      const rm = new RequestManager(provider)
      let signature = 'testArr(int[])'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectResultList([
        {
          result: '0x0000000000000000000000000000000000000000000000000000000000000005'
        }
      ])
      provider.injectValidation(async payload => {
        assert.equal(payload.method, 'eth_call')
        assert.deepEqual(payload.params, [
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000000000000000000000000000000000000000000020' +
              '0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000003',
            to: address
          },
          'latest'
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      const result = await contract.testArr([3])

      assert.deepEqual(new BigNumber(5), result)
    })
  })
})
