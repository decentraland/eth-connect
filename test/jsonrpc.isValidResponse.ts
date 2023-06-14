import expect from 'expect'
import { RPCResponse } from '../src/providers/common'
import * as Jsonrpc from '../src/utils/jsonrpc'

describe('jsonrpc', function () {
  describe('isValidResponse', function () {
    it('should validate basic jsonrpc response', function () {
      // given
      let response: any = {
        jsonrpc: '2.0',
        id: 1,
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      expect(valid).toEqual(true)
    })

    it('should validate basic undefined response', function () {
      // given
      let response = undefined

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      expect(valid).toEqual(false)
    })

    it('should validate jsonrpc response without jsonrpc field', function () {
      // given
      let response: any = {
        id: 1,
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      expect(valid).toEqual(false)
    })

    it('should validate jsonrpc response with wrong jsonrpc version', function () {
      // given
      let response: any = {
        jsonrpc: '1.0',
        id: 1,
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      expect(valid).toEqual(false)
    })

    it('should validate jsonrpc response without id number', function () {
      // given
      let response: any = {
        jsonrpc: '2.0',
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      expect(valid).toEqual(false)
    })

    it('should validate jsonrpc response with wrong id field', function () {
      // given
      let response: any = {
        jsonrpc: '2.0',
        id: 'x',
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      expect(valid).toEqual(false)
    })

    it('should validate jsonrpc response without result field', function () {
      // given
      let response: any = {
        jsonrpc: '2.0',
        id: 1
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      expect(valid).toEqual(false)
    })

    it('should validate jsonrpc response with result field === false', function () {
      // given
      let response: RPCResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: false
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      expect(valid).toEqual(true)
    })

    it('should validate jsonrpc response with result field === 0', function () {
      // given
      let response: RPCResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: 0
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      expect(valid).toEqual(true)
    })
  })
})
