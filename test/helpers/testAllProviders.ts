import { RequestManager } from '../../src'

import { WebSocketProvider } from '../../src/providers/WebSocketProvider'
import { w3cwebsocket } from 'websocket'

export function testsAllProviders(doTest: (x: RequestManager) => void) {

  describe('geth(ws):', function () {
    const provider = new WebSocketProvider('ws://127.0.0.1:8546', { WebSocketConstructor: w3cwebsocket })
    const rm = new RequestManager(provider)

    doTest(rm)

    afterAll(() => {
      provider.dispose()
    })
  })
}
