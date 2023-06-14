import 'isomorphic-fetch'
import fetch from 'node-fetch'

import { NodeConnectionFactory } from '../helpers/NodeConnectionFactory'
import { RequestManager, ContractFactory, HTTPProvider, WebSocketProvider } from '../../dist/eth-connect'
import { w3cwebsocket } from 'websocket'

export function testAllProviders(doTest: (x: RequestManager) => void) {
  describe('ganache(injected):', function () {
    const nodeConnectionFactory = new NodeConnectionFactory()
    const provider = nodeConnectionFactory.createProvider()
    const rm = new RequestManager(provider)

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

    it('closes the provider', (done) => {
      provider.close(done)
    })
  })

  describe('ganache(http):', function () {
    const nodeConnectionFactory = new NodeConnectionFactory()
    const provider = nodeConnectionFactory.createServer()

    it('should start the server', (done) => {
      provider.listen(7654, function (err) {
        done(err)
      })
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

    it('closes the provider', (done) => {
      provider.close(done)
    })
  })

  describe('geth(ws):', function () {
    const provider = new WebSocketProvider('ws://127.0.0.1:8546', { WebSocketConstructor: w3cwebsocket })
    const rm = new RequestManager(provider)

    doTest(rm)

    after(() => provider.dispose())
  })
}
