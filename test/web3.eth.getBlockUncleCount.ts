let method = 'getBlockUncleCount'
import testMethod = require('./helpers/test.method')
import { eth } from '../dist/methods/eth'

let tests = [
  {
    args: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855'],
    formattedArgs: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855'],
    result: '0xb',
    formattedResult: 11,
    call: 'eth_getUncleCountByBlockHash'
  },
  {
    args: [436],
    formattedArgs: ['0x1b4'],
    result: '0xb',
    formattedResult: 11,
    call: 'eth_getUncleCountByBlockNumber'
  },
  {
    args: ['pending'],
    formattedArgs: ['pending'],
    result: '0xb',
    formattedResult: 11,
    call: 'eth_getUncleCountByBlockNumber'
  }
]

testMethod.runTests(`eth.${method}`, eth.getBlockUncleCount, tests)
