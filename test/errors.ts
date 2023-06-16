import { createError } from '../src/utils/errors'

describe('lib/web3/method', function () {
  describe('getCall', function () {
    it('should return and error', function () {
      expect(createError('something')).toBeInstanceOf(Error)
    })
  })
})
