import { RequestManager, isHex, isAddress } from '../src'
import { NodeConnectionFactory } from './helpers/NodeConnectionFactory'
import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { toRPC } from '../src/providers/common'

export function testReturnType(
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
        expect(isAddress(result)).to.eq(true, 'is address')
      } else if (type === 'data') {
        expect(isHex(result)).to.eq(true, 'is data with shape 0x..')
      } else if (type === 'array') {
        expect(result instanceof Array).to.eq(true, 'is instance of array')
      } else if (type === BigNumber) {
        expect(result instanceof BigNumber).to.eq(true, 'is instance of BigNumber')
      } else {
        expect(typeof result).to.eq(type)
      }
    } catch (e) {
      console.dir(result)
      throw e
    }
  })
}

describe('test types', () => {
  const nodeConnectionFactory = new NodeConnectionFactory()
  const requestManager = new RequestManager(nodeConnectionFactory.createProvider())

  let address = '0xebc757b8bfd562158b1bfded4e1cafe332d9845a'

  it('should get the addresses', async () => {
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    await requestManager.personal_unlockAccount(account)
    // tslint:disable-next-line:no-unused-expression
    expect(account).to.eq(address, "pre-setted account matches test's address")
    expect(account.length).to.gt(0)
  })

  it('test toRPC', async () => {
    // TODO: Move this to its own file
    expect(() => toRPC({ id: null } as any)).to.throw()
    expect(() => toRPC({ id: 1.1 } as any)).to.throw()
    expect(() => toRPC({ id: 'asd' } as any)).to.throw()
    expect(() => toRPC({ id: 1, method: '' } as any)).to.throw()
    expect(() => toRPC({ id: 1, method: null } as any)).to.throw()
    expect(() => toRPC({ id: 1, method: 123 } as any)).to.throw()
    expect(() => toRPC({ id: 1, method: 'without params' } as any)).to.throw()
    expect(() => toRPC({ id: 1, method: 'validMethod', params: 1 } as any)).to.throw()
    expect(() => toRPC({ id: 1, method: 'validMethod', params: null } as any)).to.throw()
  })

  testReturnType(requestManager, 'web3_clientVersion', 'string')
  testReturnType(requestManager, 'web3_sha3', 'string', 'asd')
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

  testReturnType(requestManager, 'eth_sign', 'string', address, 'asd')
  testReturnType(requestManager, 'eth_getBlockByHash', 'object', '0x0', true)
  testReturnType(requestManager, 'eth_newFilter', 'data', {})
  testReturnType(requestManager, 'eth_newBlockFilter', 'data')
  testReturnType(requestManager, 'eth_newPendingTransactionFilter', 'data')
  testReturnType(requestManager, 'eth_getFilterChanges', 'array', '0x01')
  testReturnType(requestManager, 'eth_getFilterLogs', 'array', '0x01')
  testReturnType(requestManager, 'eth_getLogs', 'array', '0x01')
  testReturnType(requestManager, 'eth_uninstallFilter', 'boolean', '0x01')
  testReturnType(requestManager, 'eth_uninstallFilter', 'boolean', '0x02')
  testReturnType(requestManager, 'eth_uninstallFilter', 'boolean', '0x03')
  testReturnType(requestManager, 'shh_version', 'number')
})
