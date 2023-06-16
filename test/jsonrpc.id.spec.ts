import * as Jsonrpc from '../src/utils/jsonrpc'

describe('lib/web3/jsonrpc', function () {
  describe('id', function () {
    it('should increment the id', function () {
      // given
      let method = 'm'

      // when
      let p1 = Jsonrpc.toJsonRpcRequest(method, [])
      let p2 = Jsonrpc.toJsonRpcRequest(method, [])

      // then
      expect(p2.id).toEqual(p1.id + 1)
    })
  })
})
