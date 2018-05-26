import chai = require('chai')
const assert = chai.assert
import { RequestManager } from '../dist'

import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'protocolVersion'

let tests = [
  {
    result: 1234,
    call: 'eth_' + method
  }
]

describe('eth.protocolVersion', function() {
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
        let result = await rm.eth_protocolVersion()

        // then
        assert.deepEqual(test.result, result)
      })
    })
  })
})
