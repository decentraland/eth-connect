import chai = require('chai')
const assert = chai.assert
import { RequestManager } from '../dist'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'peerCount'

let tests = [
  {
    result: '0xf',
    formattedResult: 15,
    call: 'net_' + method
  }
]

describe('web3.net', function() {
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
        let result = await rm.net_peerCount()

        // then
        assert.deepEqual(test.formattedResult, result)
      })
    })
  })
})
