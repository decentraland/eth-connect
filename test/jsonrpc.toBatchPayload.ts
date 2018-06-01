import { assert } from 'chai'
import * as Jsonrpc from '../src/utils/jsonrpc'

describe('jsonrpc', function() {
  describe('toBatchPayload', function() {
    it('should create basic batch payload', function() {
      // given
      let messages = [
        {
          method: 'helloworld',
          params: []
        },
        {
          method: 'test2',
          params: [1]
        }
      ]

      // when
      let payload = Jsonrpc.toBatchPayload(messages)

      // then
      assert.equal(Array.isArray(payload), true)
      assert.equal(payload.length, 2)
      assert.equal(payload[0].jsonrpc, '2.0')
      assert.equal(payload[1].jsonrpc, '2.0')
      assert.equal(payload[0].method, 'helloworld')
      assert.equal(payload[1].method, 'test2')
      assert.equal(Array.isArray(payload[0].params), true)
      assert.equal(payload[1].params.length, 1)
      assert.equal(payload[1].params[0], 1)
      assert.equal(typeof payload[0].id, 'number')
      assert.equal(typeof payload[1].id, 'number')
      assert.equal(payload[0].id + 1, payload[1].id)
    })

    it('should create batch payload for empty input array', function() {
      // given
      let messages = []

      // when
      let payload = Jsonrpc.toBatchPayload(messages)

      // then
      assert.equal(Array.isArray(payload), true)
      assert.equal(payload.length, 0)
    })
  })
})
