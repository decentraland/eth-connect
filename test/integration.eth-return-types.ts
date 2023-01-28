import { RequestManager, isHex, isAddress } from '../src'
import { BigNumber } from '../src/utils/BigNumber'
import expect from 'expect'
import { toRPC } from '../src/providers/common'
import { WebSocketProvider } from '../dist/eth-connect'
import { w3cwebsocket } from 'websocket'

export function testsReturnType(
  requestManager: RequestManager,
  method: keyof RequestManager,
  type: string | typeof BigNumber,
  ...args
) {
  const name = typeof type === 'function' ? type.constructor.name : type

  it(method + ' must be ' + name, async () => {
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
  })
}

describe('tests types', () => {
  const provider = new WebSocketProvider('ws://127.0.0.1:8546', { WebSocketConstructor: w3cwebsocket })
  const requestManager = new RequestManager(provider)

  let address = '0x554679f3ccd337e15377960a89e1b08d6c95efa7'

  it('should get the addresses', async () => {
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    await requestManager.personal_unlockAccount(account)
    expect(account).toEqual(address) // "pre-setted account matches tests's address"
    expect(account.length).toBeGreaterThan(0)
  })

  it('tests toRPC', async () => {
    // TODO: Move this to its own file
    expect(() => toRPC({ id: null } as any)).toThrow()
    expect(() => toRPC({ id: 1.1 } as any)).toThrow()
    expect(() => toRPC({ id: 'asd' } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: '' } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: null } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: 123 } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: 'without params' } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: 'validMethod', params: 1 } as any)).toThrow()
    expect(() => toRPC({ id: 1, method: 'validMethod', params: null } as any)).toThrow()
  })

  testsReturnType(requestManager, 'web3_clientVersion', 'string')
  testsReturnType(requestManager, 'web3_sha3', 'string', 'asd')
  testsReturnType(requestManager, 'net_version', 'string')
  testsReturnType(requestManager, 'net_peerCount', 'number')
  testsReturnType(requestManager, 'net_listening', 'boolean')
  testsReturnType(requestManager, 'eth_protocolVersion', 'number')
  testsReturnType(requestManager, 'eth_syncing', 'boolean')
  testsReturnType(requestManager, 'eth_coinbase', 'string')
  testsReturnType(requestManager, 'eth_mining', 'boolean')
  testsReturnType(requestManager, 'eth_hashrate', 'number')
  testsReturnType(requestManager, 'eth_gasPrice', BigNumber)
  testsReturnType(requestManager, 'eth_accounts', 'array')
  testsReturnType(requestManager, 'eth_blockNumber', 'number')
  testsReturnType(requestManager, 'eth_getBalance', BigNumber, address, 'latest')
  testsReturnType(requestManager, 'eth_getStorageAt', 'string', address, 0, 'latest')
  testsReturnType(requestManager, 'eth_getTransactionCount', 'number', address, 'latest')

  testsReturnType(requestManager, 'eth_getCode', 'string', address, 'latest')

  testsReturnType(requestManager, 'eth_sign', 'string', address, 'asd')
  testsReturnType(requestManager, 'eth_getBlockByHash', 'object', '0x0', true)
  testsReturnType(requestManager, 'eth_newFilter', 'data', {})
  testsReturnType(requestManager, 'eth_newBlockFilter', 'data')
  testsReturnType(requestManager, 'eth_newPendingTransactionFilter', 'data')
  testsReturnType(requestManager, 'eth_getFilterChanges', 'array', '0x01')
  testsReturnType(requestManager, 'eth_getFilterLogs', 'array', '0x01')
  testsReturnType(requestManager, 'eth_getLogs', 'array', '0x01')
  testsReturnType(requestManager, 'eth_uninstallFilter', 'boolean', '0x01')
  testsReturnType(requestManager, 'eth_uninstallFilter', 'boolean', '0x02')
  testsReturnType(requestManager, 'eth_uninstallFilter', 'boolean', '0x03')
  testsReturnType(requestManager, 'shh_version', 'number')
})
