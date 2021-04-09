import * as expect from 'expect'

import { RequestManager, ContractFactory } from '../src'
import { future } from 'fp-future'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { FakeHttpProvider2 } from './helpers/FakeHttpProvider2'
import { BigNumber } from '../src/utils/BigNumber'
import { sha3 } from '../src/utils/utils'

let desc = [
  {
    name: 'balance(address)',
    type: 'function',
    inputs: [
      {
        name: 'who',
        type: 'address',
      },
    ],
    constant: true,
    outputs: [
      {
        name: 'value',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'send(address,uint256)',
    type: 'function',
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
    ],
    outputs: [],
    payable: true,
  },
  {
    name: 'testArr(int[])',
    type: 'function',
    inputs: [
      {
        name: 'value',
        type: 'int[]',
      },
    ],
    constant: true,
    outputs: [
      {
        name: 'd',
        type: 'int',
      },
    ],
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "contract IERC721CollectionV2",
            "name": "collection",
            "type": "address"
          },
          {
            "internalType": "uint256[]",
            "name": "ids",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "prices",
            "type": "uint256[]"
          },
          {
            "internalType": "address[]",
            "name": "beneficiaries",
            "type": "address[]"
          }
        ],
        "internalType": "struct CollectionStore.ItemToBuy[]",
        "name": "_itemsToBuy",
        "type": "tuple[]"
      }
    ],
    "name": "buy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    name: 'Changed',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: true },
      { name: 't1', type: 'uint256', indexed: false },
      { name: 't2', type: 'uint256', indexed: false },
    ],
  },
]

let address = '0x1234567890123456789012345678901234567891'

describe('contract', function () {
  describe('event', function () {
    it('should create event filter', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)

      let signature = 'Changed(address,uint256,uint256,uint256)'

      const newFilterFuture = provider.mockNewFilter({
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x000000000000000000000000000000000000000000000000000000000000000a',
        ],
        fromBlock: 'latest',
        toBlock: 'latest',
        address: '0x1234567890123456789012345678901234567891',
      })

      const getFilterLogs = provider.mockGetFilterLogs([
        {
          address: address,
          topics: [
            '0x' + sha3(signature),
            '0x0000000000000000000000001234567890123456789012345678901234567891',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
          ],
          number: 2,
          data:
            '0x0000000000000000000000000000000000000000000000000000000000000001' +
            '0000000000000000000000000000000000000000000000000000000000000008',
        },
      ])

      const batchResults = provider.mockGetFilterChanges({
        address,
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
      })

      const uninstallFilerCalled = provider.mockUninstallFilter()
      let contract = await new ContractFactory(rm, desc).at(address)

      let res = 0
      const done = future()

      let event = await contract.events.Changed({ from: address, amount: 10 })

      await event.getLogs()

      await event.watch(function (result: any) {
        try {
          expect(result.args.from).toEqual(address)
          expect(result.args.amount.toNumber()).toEqual(1)
          expect(result.args.t1.toNumber()).toEqual(1)
          expect(result.args.t2.toNumber()).toEqual(8)
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

    it('should create event filter and watch immediately', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)

      let signature = 'Changed(address,uint256,uint256,uint256)'

      const newFilterFuture = provider.mockNewFilter({
        topics: ['0x' + sha3(signature), '0x0000000000000000000000001234567890123456789012345678901234567891', null],
        address: '0x1234567890123456789012345678901234567891',
        fromBlock: 'latest',
        toBlock: 'latest',
      })

      const getFilterLogs = provider.mockGetFilterLogs([
        {
          address: address,
          topics: [
            '0x' + sha3(signature),
            '0x0000000000000000000000001234567890123456789012345678901234567891',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
          ],
          number: 2,
          data:
            '0x0000000000000000000000000000000000000000000000000000000000000001' +
            '0000000000000000000000000000000000000000000000000000000000000008',
        },
      ])

      const batchResults = provider.mockGetFilterChanges({
        address,
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
      })

      const uninstallFilerCalled = provider.mockUninstallFilter()

      let contract = await new ContractFactory(rm, desc).at(address)

      const done = future()

      let event = await contract.events.Changed({ from: address })

      await event.watch(function (result: any) {
        try {
          expect(result.args.from).toEqual(address)
          expect(result.args.amount.toNumber()).toEqual(1)
          expect(result.args.t1.toNumber()).toEqual(1)
          expect(result.args.t2.toNumber()).toEqual(8)

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

    it('should create all event filter', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)

      let signature = 'Changed(address,uint256,uint256,uint256)'

      const newFilterCalled = provider.injectValidation(async (payload) => {
        if (payload.method !== 'eth_newFilter') return false

        provider.injectResult('0x3')

        expect(payload.params[0]).toEqual({
          fromBlock: 'latest',
          toBlock: 'latest',
          topics: [],
          address: '0x1234567890123456789012345678901234567891',
        })
      })

      const getFilterLogsCalled = provider.mockGetFilterLogs({
        address: address,
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
        number: 2,
        data:
          '0x0000000000000000000000000000000000000000000000000000000000000001' +
          '0000000000000000000000000000000000000000000000000000000000000008',
      })

      const getFilterChangesCalled = provider.mockGetFilterChanges({
        address: address,
        topics: [
          '0x' + sha3(signature),
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
        number: 2,
        data:
          '0x0000000000000000000000000000000000000000000000000000000000000001' +
          '0000000000000000000000000000000000000000000000000000000000000008',
      })

      let contract = await new ContractFactory(rm, desc).at(address)

      let res = 0
      let event = await contract.allEvents({})
      const done = future()

      await event.getLogs()

      await event.watch(function (result: any) {
        try {
          if (typeof result === 'string') throw new Error('Result as a string: ' + result)
          expect(result.args.from).toEqual(address)
          expect(result.args.amount.toNumber()).toEqual(1)
          expect(result.args.t1.toNumber()).toEqual(1)
          expect(result.args.t2.toNumber()).toEqual(8)
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

    it('should call constant function', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'

      provider.injectValidation(async (payload) => {
        expect(payload.method).toEqual('eth_call')
        expect(payload.params).toEqual([
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
          },
          'latest',
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address)
      expect(new BigNumber(0x32)).toEqual(r)
    })

    it('should call constant function with default block', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'

      provider.injectValidation(async (payload) => {
        expect(payload.method).toEqual('eth_call')
        expect(payload.params).toEqual([
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
          },
          '0xb',
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address, 11)
      expect(new BigNumber(0x32)).toEqual(r)
    })

    it('should sendTransaction to contract function', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'

      const didCall = provider.injectHandler('eth_sendTransaction', async (payload) => {
        expect(payload.params).toEqual([
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000001234567890123456789012345678901234567891' +
              '0000000000000000000000000000000000000000000000000000000000000011',
            from: address,
            to: address,
          },
        ])
        provider.injectResult('0xb')
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, 17, { from: address })

      await didCall
    })

    it('should sendTransaction with tuples to contract function', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let address = '0x1234567890123456789012345678901234567891'

      const didCall = provider.injectHandler('eth_sendTransaction', async (payload) => {
        expect(payload.params).toEqual([
          {
            data:
              '0xa4fdc78a0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000006b80863d347a7bde24ee9317f04baaa9259a5d6a000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000014dc79964da2c08b23698b3d3cc7ca32193d9955',
            from: address,
            to: address,
          },
        ])
        provider.injectResult('0xb')
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.buy(
        [
          ['0x6b80863d347a7bde24ee9317f04baaa9259a5d6a', [0], ['10000000000000000000'], ['0x14dC79964da2C08b23698B3D3cc7Ca32193d9955']]
        ], { from: address })

      await didCall
    })

    it('should make a call with optional params', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async (payload) => {
        expect(payload.method).toEqual('eth_call')
        expect(payload.params).toEqual([
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
            from: address,
            gas: '0xc350',
          },
          'latest',
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address, { from: address, gas: 50000 })
      expect(new BigNumber(0x32)).toEqual(r)
    })

    it('should throw if called with optional params without all args', function (done) {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async (payload) => {
        expect(payload.method).toEqual('eth_call')
        expect(payload.params).toEqual([
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
            from: address,
            gas: '0xc350',
          },
          'latest',
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

    it('should explicitly make a call with optional params', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async (payload) => {
        expect(payload.method).toEqual('eth_call')
        expect(payload.params).toEqual([
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
            from: address,
            gas: '0xc350',
          },
          'latest',
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address, { from: address, gas: 50000 })
      expect(new BigNumber(0x32)).toEqual(r)
    })

    it('should explicitly make a call with optional params and defaultBlock', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      provider.injectResult('0x0000000000000000000000000000000000000000000000000000000000000032')
      let signature = 'balance(address)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectValidation(async (payload) => {
        expect(payload.method).toEqual('eth_call')
        expect(payload.params).toEqual([
          {
            data:
              '0x' + sha3(signature).slice(0, 8) + '0000000000000000000000001234567890123456789012345678901234567891',
            to: address,
            from: address,
            gas: '0xc350',
          },
          '0xb',
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      let r = await contract.balance(address, { from: address, gas: 50000 }, 11)
      expect(new BigNumber(0x32)).toEqual(r)
    })

    it('it should throw if sendTransaction with optional params without all args', function (done) {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectHandler('eth_sendTransaction', async (payload) => {
        provider.injectResult('0x0000000000000000000000001234567890123456789012345678901234567891')
        expect(payload.method).toEqual('eth_sendTransaction')
        expect(payload.params).toEqual([
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
            value: '0x2710',
          },
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

    it('should sendTransaction with optional params', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      const didCall = provider.injectHandler('eth_sendTransaction', async (payload) => {
        provider.injectResult('0x0000000000000000000000001234567890123456789012345678901234567891')
        expect(payload.method).toEqual('eth_sendTransaction')
        expect(payload.params).toEqual([
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
            value: '0x2710',
          },
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, 17, { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
      await didCall
    })

    it('should sendTransaction with bigNum param and optional params', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      const didCall = provider.injectHandler('eth_sendTransaction', async (payload) => {
        provider.injectResult('0x0000000000000000000000001234567890123456789012345678901234567891')
        expect(payload.method).toEqual('eth_sendTransaction')
        expect(payload.params).toEqual([
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
            value: '0x2710',
          },
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, new BigNumber(17), { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
      await didCall
    })

    it('should explicitly sendTransaction with optional params', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      const didCall = provider.injectHandler('eth_sendTransaction', async (payload) => {
        provider.injectResult('0x0000000000000000000000001234567890123456789012345678901234567891')

        expect(payload.params).toEqual([
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
            value: '0x2710',
          },
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, 17, { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
      await didCall
    })

    it('should explicitly sendTransaction with optional params and call callback without error', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let address = '0x1234567890123456789012345678901234567891'
      let signature = 'send(address,uint256)'
      const didCall = provider.injectHandler('eth_sendTransaction', async (payload) => {
        provider.injectResult('0x0000000000000000000000001234567890123456789012345678901234567891')
        expect(payload.params).toEqual([
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
            value: '0x2710',
          },
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send(address, 17, { from: address, gas: 50000, gasPrice: 3000, value: 10000 })
      await didCall
    })

    it('should explicitly estimateGas with optional params', async function () {
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)
      let signature = 'send(address,uint256)'
      let address = '0x1234567890123456789012345678901234567891'
      const didCall = provider.injectHandler('eth_estimateGas', async (payload) => {
        expect(payload.params).toEqual([
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
            value: '0x2710',
          },
        ])
        provider.injectResult('0x123')
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      await contract.send.estimateGas(address, 17, { from: address, gas: 50000, gasPrice: 3000, value: 10000 })

      await didCall
    })

    it('should call testArr method and properly parse result', async function () {
      let provider = new FakeHttpProvider2()
      const rm = new RequestManager(provider)
      let signature = 'testArr(int[])'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectResultList([
        {
          result: '0x0000000000000000000000000000000000000000000000000000000000000005',
        },
      ])

      provider.injectValidation(async (payload) => {
        expect(payload.method).toEqual('eth_call')
        expect(payload.params).toEqual([
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000000000000000000000000000000000000000000020' +
              '0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000003',
            to: address,
          },
          'latest',
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)
      let result = await contract.testArr([3])

      expect(new BigNumber(5)).toEqual(result)
    })

    it('should call testArr method, properly parse result and return the result async', async function () {
      let provider = new FakeHttpProvider2()
      const rm = new RequestManager(provider)
      let signature = 'testArr(int[])'
      let address = '0x1234567890123456789012345678901234567891'
      provider.injectResultList([
        {
          result: '0x0000000000000000000000000000000000000000000000000000000000000005',
        },
      ])
      provider.injectValidation(async (payload) => {
        expect(payload.method).toEqual('eth_call')
        expect(payload.params).toEqual([
          {
            data:
              '0x' +
              sha3(signature).slice(0, 8) +
              '0000000000000000000000000000000000000000000000000000000000000020' +
              '0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000003',
            to: address,
          },
          'latest',
        ])
      })

      let contract: any = await new ContractFactory(rm, desc).at(address)

      const result = await contract.testArr([3])

      expect(new BigNumber(5)).toEqual(result)
    })
  })
})
