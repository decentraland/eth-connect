import { doCatalystTest } from './integration.catalyst'
import { doOverloadTest } from './integration.overload'
import { doEscrowTest } from './integration.escrow'
import { doERC20Test } from './integration.erc20'
import { doEventsTest } from './integration.events'
import { doPersonalTest } from './integration.personal'
import expect from 'expect'
import 'isomorphic-fetch'
import fetch from 'node-fetch'
import { RequestManager, ContractFactory, HTTPProvider, WebSocketProvider } from '../dist/eth-connect'
import { w3cwebsocket } from 'websocket'
import { createGanacheProvider, createGanacheServer } from './helpers/ganache'

export function testAllProviders(doTest: (x: RequestManager) => void) {
  describe('ganache(injected):', function () {
    const provider = createGanacheProvider()
    const rm = new RequestManager(provider)

    before(async () => {
      await provider.initialize()
    })

    after(async () => {
      await provider.disconnect()
    })

    it('should return no instantiated contracts', async () => {
      try {
        await new ContractFactory(rm, []).at('')
        throw new Error('x')
      } catch (e) {
        if (e.message == 'x') throw new Error("The test didn't fail")
      }
    })

    it('should get the network', async () => {
      console.log('Network version:', await rm.net_version())
    })

    it('should get the protocol version', async () => {
      console.log('Protocol version:', await rm.eth_protocolVersion())
    })

    doTest(rm)
  })

  describe('ganache(http):', function () {
    const server = createGanacheServer()
    before(async () => {
      await server.listen(7654)
      const provider = server.provider
      await provider.initialize()
      try {
        await rm.net_version()
      } catch (err) {}
    })

    after(async () => {
      await server.close()
    })

    const rm = new RequestManager(
      new HTTPProvider('http://127.0.0.1:7654', { fetch: Math.random() > 0.5 ? fetch : undefined })
    )

    it('should get the network', async () => {
      console.log('Network version:', await rm.net_version())
    })

    it('should get the protocol version', async () => {
      console.log('Protocol version:', await rm.eth_protocolVersion())
    })

    doTest(rm)
  })

  describe('geth(ws):', function () {
    const provider = new WebSocketProvider('ws://127.0.0.1:8546', { WebSocketConstructor: w3cwebsocket })
    const rm = new RequestManager(provider)

    doTest(rm)

    after(() => provider.dispose())
  })
}

describe('integration', function () {
  testAllProviders((rm) => {
    it('should get the balance', async () => {
      const coinbase = await rm.eth_coinbase()
      console.log(`> Coinbase`, coinbase)
      const accounts = await rm.eth_accounts()
      const account = accounts[0]
      const balance = await rm.eth_getBalance(account, 'latest')
      console.log(`> Balance ${balance}`)
      expect(balance.toNumber()).toBeGreaterThan(0)
    })

    doCatalystTest(rm)
    doOverloadTest(rm)
    doEscrowTest(rm)
    doERC20Test(rm)
    doEventsTest(rm)
    doPersonalTest(rm)
  })
})
