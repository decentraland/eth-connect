import testMethod = require('./helpers/test.method')

let method = 'getCompilers'

let tests = [
  {
    args: [],
    formattedArgs: [],
    result: ['solidity'],
    formattedResult: ['solidity'],
    call: 'eth_' + method
  },
  {
    args: [],
    formattedArgs: [],
    result: ['solidity'],
    formattedResult: ['solidity'],
    call: 'eth_' + method
  }
]

testMethod.runTests(`eth_getCompilers`, tests)
