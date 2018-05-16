import testMethod = require('./helpers/test.method')
import { eth } from '../dist/methods/eth'

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

testMethod.runTests(`eth.${method}`, eth.getCompilers, tests)
