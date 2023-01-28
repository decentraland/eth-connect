import expect from 'expect'
import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

import { EthFilter, EthBlockFilter, EthPendingTransactionFilter } from '../src/Filter'
import { future } from 'fp-future'

describe('eth.filter', function () {
  it('Test EthFilter', async function () {
    // given
    const provider = new FakeHttpProvider()
    const rm = new RequestManager(provider)

    const didCallNewFilter = provider.mockNewFilter({
      toBlock: '0xa',
      fromBlock: 'latest',
      topics: [],
      address: '0x47d33b27bb249a2dbab4c0612bf9caf4c1950855'
    })

    // call
    let filter = new EthFilter(rm, {
      toBlock: 10,
      address: '0x47d33b27bb249a2dbab4c0612bf9caf4c1950855'
    })

    const logs = [
      {
        address: '0x1',
        number: 2,
        topics: [
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001'
        ],
        data: '0xb'
      },
      {
        address: '0x1',
        number: 2,
        topics: [
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001'
        ],
        data: '0x11'
      }
    ]

    const didCallChanges = provider.mockGetFilterChanges(logs)
    const didCallLogs = provider.mockGetFilterLogs(logs)
    const didCallUninstall = provider.mockUninstallFilter()

    // async should get the fake logs
    const res = await filter.getLogs()

    await filter.watch(() => void 0)

    await didCallNewFilter
    await didCallLogs
    expect(logs).toEqual(res as any)

    await didCallChanges
    await filter.stop()
    await didCallUninstall
  })

  it('Test EthFilter polling', async function () {
    // given
    const provider = new FakeHttpProvider()
    const rm = new RequestManager(provider)

    const didCallNewFilter = provider.mockNewFilter({
      fromBlock: '0x0',
      toBlock: '0xa',
      address: '0x47d33b27bb249a2dbab4c0612bf9caf4c1950855',
      topics: []
    })

    // call
    let filter = new EthFilter(rm, {
      fromBlock: 0,
      toBlock: 10,
      address: '0x47d33b27bb249a2dbab4c0612bf9caf4c1950855'
    })

    const logs = [
      {
        address: '0x1',
        number: 2,
        topics: [
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001'
        ],
        data: '0xb'
      },
      {
        address: '0x1',
        number: 2,
        topics: [
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001'
        ],
        data: '0x11'
      }
    ]

    let counter = 0

    const didCallThreeTimes = future()

    const didCallChanges = provider.mockGetFilterChanges(logs, () => {
      counter++
      if (counter === 5) didCallThreeTimes.resolve(1)
    })

    const didCallLogs = provider.mockGetFilterLogs(logs)
    const didCallUninstall = provider.mockUninstallFilter()

    await filter.watch(() => void 0)
    // async should get the fake logs
    const res = await filter.getLogs()

    await didCallNewFilter
    await didCallLogs

    expect(logs).toEqual(res as any)

    await didCallChanges
    await didCallThreeTimes

    await filter.stop()
    await didCallUninstall
  })

  it('EthBlockFilter', async function () {
    // given
    const provider = new FakeHttpProvider()
    const rm = new RequestManager(provider)

    const didCallInit = provider.injectHandler('eth_newBlockFilter', async (_) => {
      provider.injectResult('0xf')
    })

    const didCallGetChanges = provider.injectHandler('eth_getFilterChanges', async (_) => {
      provider.injectResult(['0xf'])
    })

    // call
    let filter = new EthBlockFilter(rm)
    await filter.start()
    await filter.watch(() => void 0)
    await didCallInit
    const didCallUninstall = provider.mockUninstallFilter()
    await didCallGetChanges
    await filter.stop()
    await didCallUninstall
  })

  it('EthPendingTransactionFilter', async function () {
    // given
    const provider = new FakeHttpProvider()
    const rm = new RequestManager(provider)

    // call
    let filter = new EthPendingTransactionFilter(rm)

    const didCallInit = provider.injectHandler('eth_newPendingTransactionFilter', async (_) => {
      provider.injectResult('0xf')
    })

    const didCallGetChanges = provider.injectHandler('eth_getFilterChanges', async (_) => {
      provider.injectResult(['0xf'])
    })

    const didCallUninstall = provider.mockUninstallFilter()
    await filter.start()
    await filter.watch(() => void 0)
    await didCallInit
    await didCallGetChanges
    await filter.stop()
    await didCallUninstall
  })
})
