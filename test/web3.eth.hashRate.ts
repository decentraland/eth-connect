import chai = require('chai')
const assert = chai.assert
import { RequestManager } from '../src'

import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'hashrate'

let tests = [
  {
    result: '0x788a8',
    formattedResult: 493736,
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
        let result = await rm.eth_hashrate()

        // then
        assert.strictEqual(test.formattedResult, result)

        // clear the validation
        provider.injectValidation(async function() {
          // stub
        })
      })
    })
  })
})
