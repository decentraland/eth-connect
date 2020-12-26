import { assert } from 'chai'
import * as utils from '../src/utils/utils'

describe('lib/utils/utils', function() {
  describe('toDecimal', function() {
    it('should return the correct value', function() {
      assert.equal(utils.toDecimal('0x3e8'), 1000)
      // allow compatiblity
      assert.equal(utils.toDecimal(100000), 100000)
      assert.equal(utils.toDecimal('100000'), 100000)
    })
  })
})
