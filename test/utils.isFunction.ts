import chai = require('chai')
import utils = require('../dist/utils/utils')
const assert = chai.assert

let tests = [
  {
    func: function() {
      /* */
    },
    is: true
  },
  { func: () => void 0, is: true },
  { func: new Function(), is: true },
  { func: 'function', is: false },
  { func: {}, is: false }
]

describe('lib/utils/utils', function() {
  describe('isFunction', function() {
    tests.forEach(function(test) {
      it('shoud test if value ' + test.func + ' is function: ' + test.is, function() {
        assert.equal(utils.isFunction(test.func), test.is)
      })
    })
  })
})
