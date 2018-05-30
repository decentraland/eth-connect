import 'isomorphic-fetch'
// tslint:disable

import { NodeConnectionFactory } from '../helpers/NodeConnectionFactory'
import { ContractFactory, RequestManager } from '../../dist'

import { HTTPProvider } from '../../dist/providers/HTTPProvider'
import { WebSocketProvider } from '../../dist/providers/WebSocketProvider'
import { w3cwebsocket } from 'websocket'

export function testAllProviders(doTest: (x: RequestManager) => void) {
  describe('provider: injected ganache', function() {
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

    doTest(rm)

    it('closes the provider', done => {
      provider.close(done)
    })
  })

  describe('provider: http', function() {
    const nodeConnectionFactory = new NodeConnectionFactory()
    const provider = nodeConnectionFactory.createServer()

    it('should start the server', done => {
      provider.listen(7654, function(err) {
        done(err)
      })
    })

    const rm = new RequestManager(new HTTPProvider('http://127.0.0.1:7654'))

    doTest(rm)

    it('closes the provider', done => {
      provider.close(done)
    })
  })

  describe('provider: ws', function() {
    const provider = new WebSocketProvider('ws://127.0.0.1:8548', { WebSocketConstructor: w3cwebsocket })
    const rm = new RequestManager(provider)

    doTest(rm)

    after(() => provider.dispose())
  })
}
