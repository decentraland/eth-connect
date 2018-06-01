import { RequestManager, utils } from '../src'
import { NodeConnectionFactory } from './helpers/NodeConnectionFactory'
import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { toRPC } from '../src/providers/common'

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

  function test(method: keyof RequestManager, type: string | typeof BigNumber, ...args) {
    const name = typeof type === 'function' ? type.constructor.name : type

    it(method + ' must be ' + name, async () => {
      const result = await requestManager[method](...args)
      try {
        if (type === 'address') {
          expect(utils.isAddress(result)).to.eq(true, 'is address')
        } else if (type === 'data') {
          expect(utils.isHex(result)).to.eq(true, 'is data with shape 0x..')
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

  test('web3_clientVersion', 'string')
  test('web3_sha3', 'string', 'asd')
  test('net_version', 'number')
  test('net_peerCount', 'number')
  test('net_listening', 'boolean')
  test('eth_protocolVersion', 'number')
  test('eth_syncing', 'boolean')
  test('eth_coinbase', 'string')
  test('eth_mining', 'boolean')
  test('eth_hashrate', 'number')
  test('eth_gasPrice', BigNumber)
  test('eth_accounts', 'array')
  test('eth_blockNumber', 'number')
  test('eth_getBalance', BigNumber, address, 'latest')
  test('eth_getStorageAt', 'string', address, 0, 'latest')
  test('eth_getTransactionCount', 'number', address, 'latest')
  test(
    'eth_getBlockTransactionCountByHash',
    'number',
    '0xc2c4e2b5e9c942dcff179b360975b402b7e77b99dca09f85bbb72f603a688238'
  )
  test('eth_getBlockTransactionCountByNumber', 'number', 1)
  test('eth_getCode', 'string', address, 'latest')

  test('eth_sign', 'string', address, 'asd')
  // test('eth_getUncleCountByBlockHash', 'number', '0xc2c4e2b5e9c942dcff179b360975b402b7e77b99dca09f85bbb72f603a688238')
  test('eth_getBlockByHash', 'object', '0x0', true)
  test('eth_getCompilers', 'array')
  test('eth_newFilter', 'data', {})
  test('eth_newBlockFilter', 'data')
  test('eth_newPendingTransactionFilter', 'data')
  test('eth_getFilterChanges', 'array', '0x01')
  test('eth_getFilterLogs', 'array', '0x01')
  test('eth_getLogs', 'array', '0x01')
  test('eth_uninstallFilter', 'boolean', '0x01')
  test('eth_uninstallFilter', 'boolean', '0x02')
  test('eth_uninstallFilter', 'boolean', '0x03')
  // test('eth_getWork', 'array')
  test('shh_version', 'number')
})
