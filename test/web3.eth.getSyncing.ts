import chai = require('chai')
const assert = chai.assert
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

describe('eth', function() {
  describe.skip('getSyncing', function() {
    it('syncing object', async function() {
      // given
      const provider = new FakeHttpProvider()
      // const rm = new RequestManager(provider)
      provider.injectResult({
        startingBlock: '0xb',
        currentBlock: '0xb',
        highestBlock: '0xb'
      })
      provider.injectValidation(function(payload) {
        assert.equal(payload.jsonrpc, '2.0', 'failed')
        assert.equal(payload.method, 'eth_syncing')
      })

      // // call
      // web3.eth.getSyncing(function(err, res) {
      //   assert.deepEqual(res, {
      //     startingBlock: 11,
      //     currentBlock: 11,
      //     highestBlock: 11
      //   })
      //   done()
      // })
    })

    it.skip('false', async function() {
      // given
      const provider = new FakeHttpProvider()
      // const rm = new RequestManager(provider)

      provider.injectResult(false)
      provider.injectValidation(function(payload) {
        assert.equal(payload.jsonrpc, '2.0', 'failed')
        assert.equal(payload.method, 'eth_syncing')
      })

      // // call
      // web3.eth.getSyncing(function(err, res) {
      //   console.log('err', err, 'res', res)
      //   assert.strictEqual(res, false)
      //   done()
      // })
    })
  })
})
