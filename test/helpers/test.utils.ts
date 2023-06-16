
export function methodExists(object, method) {
  it('should have method ' + method + ' implemented', function () {
    expect(typeof object[method]).toEqual('function')
  })
}

export function propertyExists(object, property) {
  it('should have property ' + property + ' implemented', function () {
    expect(object).toHaveProperty(property)
  })
}
