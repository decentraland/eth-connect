import chai = require('chai')
const assert = chai.assert

import { RequestManager } from '../dist'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { eth } from '../dist/methods/eth'

// use sendTransaction as dummy
let method = 'sendTransaction'

let tests = [
  {
    input: {
      from: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS',
      to: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS'
    },
    formattedInput: {
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8'
    },
    result: '0xb',
    formattedResult: '0xb',
    call: 'eth_' + method
  }
]

describe('async', function() {
  tests.forEach(function(test, index) {
    it('test: ' + index, async function() {
      // given
      const provider = new FakeHttpProvider()

      provider.injectResult(test.result)
      provider.injectValidation(function(payload) {
        assert.equal(payload.jsonrpc, '2.0')
        assert.equal(payload.method, test.call)
        assert.deepEqual(payload.params, [test.formattedInput])
      })

      const rm = new RequestManager(provider)

      // when
      const result = await eth[method].exec(rm, test.input)

      assert.strictEqual(test.formattedResult, result)
    })

    it('error test: ' + index, async function() {
      // given
      const provider = new FakeHttpProvider()

      provider.injectError({
        message: test.result,
        code: -32603
      })
      provider.injectValidation(function(payload) {
        assert.equal(payload.jsonrpc, '2.0')
        assert.equal(payload.method, test.call)
        assert.deepEqual(payload.params, [test.formattedInput])
      })

      const rm = new RequestManager(provider)

      // when
      try {
        await eth[method].exec(rm, test.input)
      } catch (error) {
        assert.strictEqual(test.formattedResult, error.message)
      }
    })
  })
})
