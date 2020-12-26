import * as chai from 'chai'
const assert = chai.assert

import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let tests = [
  {
    input: {
      from: '00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '00c5496aee77c1ba1f0854206a26dda82a81d6d8'
    },
    formattedInput: {
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8'
    },
    result: '0xb',
    formattedResult: '0xb',
    call: 'eth_sendTransaction'
  }
]

describe('async', function() {
  tests.forEach(function(test, index) {
    it('test: ' + index, async function() {
      // given
      const provider = new FakeHttpProvider()

      provider.injectValidation(async payload => {
        assert.equal(payload.jsonrpc, '2.0')
        assert.equal(payload.method, test.call)
        assert.deepEqual(payload.params, [test.formattedInput])
        provider.injectResult(test.result)
      })

      const rm = new RequestManager(provider)

      // when
      const result = await rm.eth_sendTransaction(test.input as any)

      assert.strictEqual(test.formattedResult, result)
    })

    it('error test: ' + index, async function() {
      // given
      const provider = new FakeHttpProvider()

      provider.injectValidation(async payload => {
        assert.equal(payload.jsonrpc, '2.0')
        assert.equal(payload.method, test.call)
        assert.deepEqual(payload.params, [test.formattedInput])

        provider.injectError({
          message: test.result,
          code: -32603
        })
      })

      const rm = new RequestManager(provider)

      // when
      try {
        await rm.eth_sendTransaction(test.input as any)
      } catch (error) {
        assert.strictEqual(test.formattedResult, error.message)
      }
    })
  })
})
