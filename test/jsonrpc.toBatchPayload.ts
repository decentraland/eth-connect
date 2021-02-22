import * as expect from 'expect'
import * as Jsonrpc from '../src/utils/jsonrpc'

describe('jsonrpc', function () {
  describe('toBatchPayload', function () {
    it('should create basic batch payload', function () {
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
      expect(Array.isArray(payload)).toEqual(true)
      expect(payload.length).toEqual(2)
      expect(payload[0].jsonrpc).toEqual('2.0')
      expect(payload[1].jsonrpc).toEqual('2.0')
      expect(payload[0].method).toEqual('helloworld')
      expect(payload[1].method).toEqual('test2')
      expect(Array.isArray(payload[0].params)).toEqual(true)
      expect(payload[1].params.length).toEqual(1)
      expect(payload[1].params[0]).toEqual(1)
      expect(typeof payload[0].id).toEqual('number')
      expect(typeof payload[1].id).toEqual('number')
      expect(payload[0].id + 1).toEqual(payload[1].id)
    })

    it('should create batch payload for empty input array', function () {
      // given
      let messages = []

      // when
      let payload = Jsonrpc.toBatchPayload(messages)

      // then
      expect(Array.isArray(payload)).toEqual(true)
      expect(payload.length).toEqual(0)
    })
  })
})
