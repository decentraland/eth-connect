import * as expect from 'expect'
import * as errors from '../src/utils/errors'

describe('lib/web3/method', function() {
  describe('getCall', function() {
    for (let key in errors) {
      it('should return and error', function() {
        expect(errors[key]()).toBeInstanceOf(Error)
      })
    }
  })
})
