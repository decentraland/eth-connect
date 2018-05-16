import chai = require('chai')
const assert = chai.assert
import * as formatters from '../dist/utils/formatters'

describe('formatters', function() {
  describe('inputPostFormatter', function() {
    it('should return the correct value', function() {
      // input as strings and numbers
      assert.deepEqual(
        formatters.inputPostFormatter({
          from: '0x00000',
          to: '0x00000',
          payload: '0x7b2274657374223a2274657374227d',
          ttl: 200,
          priority: 1000,
          topics: ['hello', 'mytopics']
        }),
        {
          from: '0x00000',
          to: '0x00000',
          payload: '0x7b2274657374223a2274657374227d',
          ttl: '0xc8',
          priority: '0x3e8',
          topics: ['0x68656c6c6f', '0x6d79746f70696373'],
          workToProve: '0x0'
        }
      )
    })
  })
})
