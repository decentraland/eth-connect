import * as chai from 'chai'
const assert = chai.assert
import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let tests = [
  {
    result: true,
    formattedResult: true,
    call: 'eth_mining'
  }
]

describe('web3.eth', function() {
  describe('mining', function() {
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
        let result = await rm.eth_mining()

        // then
        assert.deepEqual(test.formattedResult, result)
      })
    })
  })
})
