import * as Jsonrpc from '../src/utils/jsonrpc'

describe('jsonrpc', function () {
  describe('toPayload', function () {
    it('should create basic payload', function () {
      // given
      let method = 'helloworld'

      // when
      let payload = Jsonrpc.toJsonRpcRequest(method, [])

      // then
      expect(payload.jsonrpc).toEqual('2.0')
      expect(payload.method).toEqual(method)
      expect(Array.isArray(payload.params)).toEqual(true)
      expect(payload.params.length).toEqual(0)
      expect(typeof payload.id).toEqual('number')
    })

    it('should create payload with params', function () {
      // given
      let method = 'helloworld1'
      let params = [123, 'test']

      // when
      let payload = Jsonrpc.toJsonRpcRequest(method, params)

      // then
      expect(payload.jsonrpc).toEqual('2.0')
      expect(payload.method).toEqual(method)
      expect(payload.params.length).toEqual(2)
      expect(payload.params[0]).toEqual(params[0])
      expect(payload.params[1]).toEqual(params[1])
      expect(typeof payload.id).toEqual('number')
    })
  })
})
