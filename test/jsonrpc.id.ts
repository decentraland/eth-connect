import chai = require('chai')
const assert = chai.assert
import * as Jsonrpc from '../src/utils/jsonrpc'

describe('lib/web3/jsonrpc', function() {
  describe('id', function() {
    it('should increment the id', function() {
      // given
      let method = 'm'

      // when
      let p1 = Jsonrpc.toPayload(method, [])
      let p2 = Jsonrpc.toPayload(method, [])

      // then
      assert.equal(p2.id, p1.id + 1)
    })
  })
})
