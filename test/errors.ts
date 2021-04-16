import * as expect from 'expect'
import { error } from '../src/utils/errors'

describe('lib/web3/method', function () {
  describe('getCall', function () {
    it('should return and error', function () {
      expect(error('something')).toBeInstanceOf(Error)
    })
  })
})
