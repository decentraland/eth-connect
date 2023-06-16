import { RequestManager, isHex, isAddress, BigNumber } from '../dist/eth-connect'
import { toRPC } from '../src/providers/common'
import { createGanacheProvider } from './helpers/ganache'

export async function expectReturnType(
  requestManager: RequestManager,
  method: keyof RequestManager,
  type: string | typeof BigNumber,
  ...args
) {
  const result = await requestManager[method].apply(requestManager, args)
  try {
    if (type === 'address') {
      expect(isAddress(result)).toEqual(true) // 'is address'
    } else if (type === 'data') {
      expect(isHex(result)).toEqual(true) //  'is data with shape 0x..'
    } else if (type === 'array') {
      expect(result instanceof Array).toEqual(true) //  'is instance of array'
    } else if (type === BigNumber) {
      expect(result instanceof BigNumber).toEqual(true) //  'is instance of BigNumber'
    } else {
      expect(typeof result).toEqual(type)
    }
  } catch (e) {
    console.dir(result)
    throw e
  }
}

export function testReturnType(
  requestManager: RequestManager,
  method: keyof RequestManager,
  type: string | typeof BigNumber,
  ...args
) {
  const name = typeof type === 'function' ? type.constructor.name : type

  it(method + ' must be ' + name, async () => {
    await expectReturnType(requestManager, method, type, ...args)
  })
}

describe('test types', () => {
  const provider = createGanacheProvider()
  const requestManager = new RequestManager(provider)

  let address = '0xebc757b8bfd562158b1bfded4e1cafe332d9845a'

  it('should get the addresses', async () => {
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    await requestManager.personal_unlockAccount(account)
    expect(account).toEqual(address) // "pre-setted account matches test's address"
    expect(account.length).toBeGreaterThan(0)
  })

  it('test toRPC', async () => {
    // TODO: Move this to its own file
    expect(() => toRPC({ id: null } as any)).toThrow()
    expect(() => toRPC({ id: 1.1 } as any)).toThrow()
    expect(() => toRPC({ id: '0xaff' } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: '' } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: null } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: 123 } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: 'without params' } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: 'validMethod', params: 1 } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: 'validMethod', params: null } as any)).toThrow()
  })

  testReturnType(requestManager, 'web3_clientVersion', 'string')
  testReturnType(requestManager, 'web3_sha3', 'string', '0xaff')
  testReturnType(requestManager, 'net_version', 'string')
  testReturnType(requestManager, 'net_peerCount', 'number')
  testReturnType(requestManager, 'net_listening', 'boolean')
  testReturnType(requestManager, 'eth_protocolVersion', 'number')
  testReturnType(requestManager, 'eth_syncing', 'boolean')
  testReturnType(requestManager, 'eth_coinbase', 'string')
  testReturnType(requestManager, 'eth_mining', 'boolean')
  testReturnType(requestManager, 'eth_hashrate', 'number')
  testReturnType(requestManager, 'eth_gasPrice', BigNumber)
  testReturnType(requestManager, 'eth_accounts', 'array')
  testReturnType(requestManager, 'eth_blockNumber', 'number')
  testReturnType(requestManager, 'eth_getBalance', BigNumber, address, 'latest')
  testReturnType(requestManager, 'eth_getStorageAt', 'string', address, 0, 'latest')
  testReturnType(requestManager, 'eth_getTransactionCount', 'number', address, 'latest')

  testReturnType(requestManager, 'eth_getCode', 'string', address, 'latest')

  testReturnType(requestManager, 'eth_sign', 'string', address, '0xaff')
  testReturnType(requestManager, 'eth_getBlockByHash', 'object', '0x0', true)
  testReturnType(requestManager, 'eth_newFilter', 'data', {})
  testReturnType(requestManager, 'eth_newBlockFilter', 'data')
  testReturnType(requestManager, 'eth_newPendingTransactionFilter', 'data')
  testReturnType(requestManager, 'eth_getFilterChanges', 'array', '0x01')
  testReturnType(requestManager, 'eth_getFilterLogs', 'array', '0x01')
  testReturnType(requestManager, 'eth_getLogs', 'array', ['0x01'])
  testReturnType(requestManager, 'eth_uninstallFilter', 'boolean', '0x01')
  testReturnType(requestManager, 'eth_uninstallFilter', 'boolean', '0x02')
  testReturnType(requestManager, 'eth_uninstallFilter', 'boolean', '0x03')
  testReturnType(requestManager, 'shh_version', 'number')
})
