import * as utils from '../src/utils/utils'

describe('lib/utils/utils', function () {
  describe('toDecimal', function () {
    it('should return the correct value', function () {
      expect(utils.toDecimal('0x3e8')).toEqual(1000)
      // allow compatiblity
      expect(utils.toDecimal(100000)).toEqual(100000)
      expect(utils.toDecimal('100000')).toEqual(100000)
    })
  })
})
