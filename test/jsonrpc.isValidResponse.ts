import { assert } from 'chai'
import * as Jsonrpc from '../dist/utils/jsonrpc'

describe('jsonrpc', function() {
  describe('isValidResponse', function() {
    it('should validate basic jsonrpc response', function() {
      // given
      let response = {
        jsonrpc: '2.0',
        id: 1,
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      assert.equal(valid, true)
    })

    it('should validate basic undefined response', function() {
      // given
      let response = undefined

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      assert.equal(valid, false)
    })

    it('should validate jsonrpc response without jsonrpc field', function() {
      // given
      let response = {
        id: 1,
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      assert.equal(valid, false)
    })

    it('should validate jsonrpc response with wrong jsonrpc version', function() {
      // given
      let response = {
        jsonrpc: '1.0',
        id: 1,
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      assert.equal(valid, false)
    })

    it('should validate jsonrpc response without id number', function() {
      // given
      let response = {
        jsonrpc: '2.0',
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      assert.equal(valid, false)
    })

    it('should validate jsonrpc response with wrong id field', function() {
      // given
      let response = {
        jsonrpc: '2.0',
        id: 'x',
        result: []
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      assert.equal(valid, false)
    })

    it('should validate jsonrpc response without result field', function() {
      // given
      let response = {
        jsonrpc: '2.0',
        id: 1
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      assert.equal(valid, false)
    })

    it('should validate jsonrpc response with result field === false', function() {
      // given
      let response = {
        jsonrpc: '2.0',
        id: 1,
        result: false
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      assert.equal(valid, true)
    })

    it('should validate jsonrpc response with result field === 0', function() {
      // given
      let response = {
        jsonrpc: '2.0',
        id: 1,
        result: 0
      }

      // when
      let valid = Jsonrpc.isValidResponse(response)

      // then
      assert.equal(valid, true)
    })
  })
})
