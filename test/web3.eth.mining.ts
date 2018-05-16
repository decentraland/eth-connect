import chai = require('chai')
const assert = chai.assert
import { RequestManager } from '../dist'

import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { eth } from '../dist/methods/eth'

let method = 'mining'

let tests = [
  {
    result: true,
    formattedResult: true,
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
        provider.injectValidation(function(payload) {
          assert.equal(payload.jsonrpc, '2.0')
          assert.equal(payload.method, test.call)
          assert.deepEqual(payload.params, [])
        })

        // when
        let result = await eth[method].exec(rm)

        // then
        assert.deepEqual(test.formattedResult, result)
      })
    })
  })
})
