import testMethod = require('./helpers/test.method')
import { eth } from '../dist/methods/eth'

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

testMethod.runTests(`eth.${method}`, eth.getWork, tests)
