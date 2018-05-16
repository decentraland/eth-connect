import chai = require('chai')
const assert = chai.assert

export function methodExists(object, method) {
  it('should have method ' + method + ' implemented', function() {
    assert.equal('function', typeof object[method], 'method ' + method + ' is not implemented')
  })
}

export function propertyExists(object, property) {
  it('should have property ' + property + ' implemented', function() {
    assert.notEqual('undefined', typeof object[property], 'property ' + property + ' is not implemented')
  })
}
