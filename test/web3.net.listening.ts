import chai = require('chai')
const assert = chai.assert
import { RequestManager } from '../dist'

import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { net } from '../dist/methods/net'

let method = 'listening'

let tests = [
  {
    result: true,
    formattedResult: true,
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
        provider.injectValidation(function(payload) {
          assert.equal(payload.jsonrpc, '2.0')
          assert.equal(payload.method, test.call)
          assert.deepEqual(payload.params, [])
        })

        // when
        let result = await net[method].exec(rm)

        // then
        assert.deepEqual(test.formattedResult, result)
      })
    })
  })
})
