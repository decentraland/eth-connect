import testMethod = require('./helpers/test.method')

let method = 'getWork'

let tests = [
  {
    args: [],
    formattedArgs: [],
    result: true,
    formattedResult: true,
    call: 'eth_' + method
  }
]

testMethod.runTests(`eth_getWork`, tests)
