import expect from 'expect'
import * as utils from '../src/utils/utils'

describe('lib/utils/utils', function () {
  describe('fromWei', function () {
    it('should return the correct value', function () {
      expect(utils.fromWei('1000000000000000000', 'wei')).toEqual('1000000000000000000')
      expect(utils.fromWei('1000000000000000000', 'kwei')).toEqual('1000000000000000')
      expect(utils.fromWei('1000000000000000000', 'mwei')).toEqual('1000000000000')
      expect(utils.fromWei('1000000000000000000', 'gwei')).toEqual('1000000000')
      expect(utils.fromWei('1000000000000000000', 'szabo')).toEqual('1000000')
      expect(utils.fromWei('1000000000000000000', 'finney')).toEqual('1000')
      expect(utils.fromWei('1000000000000000000', 'ether')).toEqual('1')
      expect(utils.fromWei('1000000000000000000', 'kether')).toEqual('0.001')
      expect(utils.fromWei('1000000000000000000', 'grand')).toEqual('0.001')
      expect(utils.fromWei('1000000000000000000', 'mether')).toEqual('0.000001')
      expect(utils.fromWei('1000000000000000000', 'gether')).toEqual('0.000000001')
      expect(utils.fromWei('1000000000000000000', 'tether')).toEqual('0.000000000001')
      expect(utils.fromWei(utils.toBigNumber('1000000000000000000'), 'tether')).toEqual(
        utils.toBigNumber('0.000000000001')
      )
    })
  })
})
