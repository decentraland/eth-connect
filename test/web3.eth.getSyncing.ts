import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { RequestManager } from '../src'

describe('eth', function() {
  describe('getSyncing', function() {
    it('syncing object', async function() {
      // given
      const provider = new FakeHttpProvider()
      const rm = new RequestManager(provider)

      provider.injectResult({
        startingBlock: '0xb',
        currentBlock: '0xb',
        highestBlock: '0xb'
      })

      await rm.eth_syncing()
    })
  })
})
