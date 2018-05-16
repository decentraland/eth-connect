import chai = require('chai')
const assert = chai.assert
import errors = require('../dist/utils/errors')

describe('lib/web3/method', function() {
  describe('getCall', function() {
    for (let key in errors) {
      it('should return and error', function() {
        assert.instanceOf(errors[key](), Error)
      })
    }
  })
})
