import 'isomorphic-fetch'
// tslint:disable

import { NodeConnectionFactory } from '../helpers/NodeConnectionFactory'
import { ContractFactory, RequestManager } from '../../src'

import { HTTPProvider } from '../../src/providers/HTTPProvider'
import { WebSocketProvider } from '../../src/providers/WebSocketProvider'
import { w3cwebsocket } from 'websocket'

export function testAllProviders(doTest: (x: RequestManager) => void) {
  describe('ganache(injected):', function () {
    const rm = new RequestManager({})
    let provider: any

    before('hook provider', () => {
      const nodeConnectionFactory = new NodeConnectionFactory()
      rm.setProvider(provider = nodeConnectionFactory.createProvider())
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

    after((done) => {
      provider.close(done)
    })
  })

  describe('ganache(http):', function () {
    let provider: any

    before('hook provider', () => {
      const nodeConnectionFactory = new NodeConnectionFactory()
      rm.setProvider(provider = nodeConnectionFactory.createServer())
    })

    it('should start the server', (done) => {
      provider.listen(7654, function (err) {
        done(err)
      })
    })

    const rm = new RequestManager(new HTTPProvider('http://127.0.0.1:7654'))

    it('should get the network', async () => {
      console.log('Network version:', await rm.net_version())
    })

    it('should get the protocol version', async () => {
      console.log('Protocol version:', await rm.eth_protocolVersion())
    })

    doTest(rm)

    after((done) => {
      provider.close(done)
    })
  })

  describe('geth(ws):', function () {
    let provider: WebSocketProvider<any>
    const rm = new RequestManager({})

    before('hook provider', () => {
      rm.setProvider(provider = new WebSocketProvider('ws://127.0.0.1:8546', { WebSocketConstructor: w3cwebsocket }))
    })

    doTest(rm)

    after(() => provider.dispose())
  })
}
