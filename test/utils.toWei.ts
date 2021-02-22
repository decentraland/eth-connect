import * as expect from 'expect'
import * as utils from '../src/utils/utils'

describe('lib/utils/utils', function () {
  describe('toWei', function () {
    it('should return the correct value', function () {
      expect(utils.toWei(1, 'wei')).toEqual('1')
      expect(utils.toWei(1, 'kwei')).toEqual('1000')
      expect(utils.toWei(1, 'Kwei')).toEqual('1000')
      expect(utils.toWei(1, 'babbage')).toEqual('1000')
      expect(utils.toWei(1, 'mwei')).toEqual('1000000')
      expect(utils.toWei(1, 'Mwei')).toEqual('1000000')
      expect(utils.toWei(1, 'lovelace')).toEqual('1000000')
      expect(utils.toWei(1, 'gwei')).toEqual('1000000000')
      expect(utils.toWei(1, 'Gwei')).toEqual('1000000000')
      expect(utils.toWei(1, 'shannon')).toEqual('1000000000')
      expect(utils.toWei(1, 'szabo')).toEqual('1000000000000')
      expect(utils.toWei(1, 'finney')).toEqual('1000000000000000')
      expect(utils.toWei(1, 'ether')).toEqual('1000000000000000000')
      expect(utils.toWei(1, 'kether')).toEqual('1000000000000000000000')
      expect(utils.toWei(1, 'grand')).toEqual('1000000000000000000000')
      expect(utils.toWei(1, 'mether')).toEqual('1000000000000000000000000')
      expect(utils.toWei(1, 'gether')).toEqual('1000000000000000000000000000')
      expect(utils.toWei(1, 'tether')).toEqual('1000000000000000000000000000000')

      expect(utils.toWei(1, 'kwei')).toEqual(utils.toWei(1, 'femtoether'))
      expect(utils.toWei(1, 'szabo')).toEqual(utils.toWei(1, 'microether'))
      expect(utils.toWei(1, 'finney')).toEqual(utils.toWei(1, 'milliether'))
      expect(utils.toWei(1, 'milli')).toEqual(utils.toWei(1, 'milliether'))
      expect(utils.toWei(1, 'milli')).toEqual(utils.toWei(1000, 'micro'))

      expect(function () {
        utils.toWei(1, 'wei1' as any)
      }).toThrowError()
    })
  })
})
