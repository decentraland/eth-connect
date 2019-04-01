import testMethod = require('./helpers/test.method')

let method = 'getWork'

let tests = [
  {
    args: ['0x0'],
    formattedArgs: ['0x0'],
    result: ['0x13'],
    formattedResult: ['0x13'],
    call: 'eth_' + method
  }
]

testMethod.runTests(`eth_getWork`, tests)
