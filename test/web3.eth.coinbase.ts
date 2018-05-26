import chai = require('chai')
const assert = chai.assert
import { RequestManager } from '../dist'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'coinbase'

let tests = [
  {
    result: '0x47d33b27bb249a2dbab4c0612bf9caf4c1950855',
    formattedResult: '0x47d33b27bb249a2dbab4c0612bf9caf4c1950855',
    call: 'eth_' + method
  }
]

describe('web3.eth', function() {
  describe(method, function() {
    tests.forEach(function(test, index) {
      it('property test: ' + index, async function() {
        // given
        const provider = new FakeHttpProvider()
        const rm = new RequestManager(provider)

        provider.injectResult(test.result)
        provider.injectValidation(async payload => {
          assert.equal(payload.jsonrpc, '2.0')
          assert.equal(payload.method, test.call)
          assert.deepEqual(payload.params, [])
        })

        // when
        let result = await rm.eth_coinbase()

        // then
        assert.deepEqual(test.formattedResult, result)
      })
    })
  })
})
