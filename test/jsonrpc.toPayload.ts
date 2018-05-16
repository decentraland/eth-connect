import chai = require('chai')
const assert = chai.assert
import * as Jsonrpc from '../dist/utils/jsonrpc'

describe('jsonrpc', function() {
  describe('toPayload', function() {
    it('should create basic payload', function() {
      // given
      let method = 'helloworld'

      // when
      let payload = Jsonrpc.toPayload(method, [])

      // then
      assert.equal(payload.jsonrpc, '2.0')
      assert.equal(payload.method, method)
      assert.equal(Array.isArray(payload.params), true)
      assert.equal(payload.params.length, 0)
      assert.equal(typeof payload.id, 'number')
    })

    it('should create payload with params', function() {
      // given
      let method = 'helloworld1'
      let params = [123, 'test']

      // when
      let payload = Jsonrpc.toPayload(method, params)

      // then
      assert.equal(payload.jsonrpc, '2.0')
      assert.equal(payload.method, method)
      assert.equal(payload.params.length, 2)
      assert.equal(payload.params[0], params[0])
      assert.equal(payload.params[1], params[1])
      assert.equal(typeof payload.id, 'number')
    })
  })
})
