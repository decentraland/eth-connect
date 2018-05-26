import BigNumber from 'bignumber.js'
import testMethod = require('./helpers/test.method')

testMethod.runTests(`eth_getBalance`, [
  {
    args: ['0x000000000000000000000000000000000000012d', 2],
    formattedArgs: ['0x000000000000000000000000000000000000012d', '0x2'],
    result: '0x31981',
    formattedResult: new BigNumber('0x31981', 16),
    call: 'eth_getBalance'
  },
  {
    args: ['0x000000000000000000000000000000000000012d', '0x1'],
    formattedArgs: ['0x000000000000000000000000000000000000012d', '0x1'],
    result: '0x31981',
    formattedResult: new BigNumber('0x31981', 16),
    call: 'eth_getBalance'
  },
  {
    args: ['0x000000000000000000000000000000000000012d', 0x1],
    formattedArgs: ['0x000000000000000000000000000000000000012d', '0x1'],
    result: '0x31981',
    formattedResult: new BigNumber('0x31981', 16),
    call: 'eth_getBalance'
  },
  {
    args: ['0x000000000000000000000000000000000000012d'],
    formattedArgs: ['0x000000000000000000000000000000000000012d', 'latest'],
    result: '0x31981',
    formattedResult: new BigNumber('0x31981', 16),
    call: 'eth_getBalance'
  },
  {
    args: ['0xdbdbdb2cbd23b783741e8d7fcf51e459b497e4a6', 0x1],
    formattedArgs: ['0xdbdbdb2cbd23b783741e8d7fcf51e459b497e4a6', '0x1'],
    result: '0x31981',
    formattedResult: new BigNumber('0x31981', 16),
    call: 'eth_getBalance'
  },
  {
    args: ['dbdbdb2cbd23b783741e8d7fcf51e459b497e4a6', 0x1],
    formattedArgs: ['0xdbdbdb2cbd23b783741e8d7fcf51e459b497e4a6', '0x1'],
    result: '0x31981',
    formattedResult: new BigNumber('0x31981', 16),
    call: 'eth_getBalance'
  },
  {
    args: ['0x000000000000000000000000000000000000012d', 0x1],
    formattedArgs: ['0x000000000000000000000000000000000000012d', '0x1'],
    result: '0x31981',
    formattedResult: new BigNumber('0x31981', 16),
    call: 'eth_getBalance'
  },
  {
    args: ['0x000000000000000000000000000000000000012d'],
    formattedArgs: ['0x000000000000000000000000000000000000012d', 'latest'],
    result: '0x31981',
    formattedResult: new BigNumber('0x31981', 16),
    call: 'eth_getBalance'
  },
  {
    args: ['000000000000000000000000000000000000012d'],
    formattedArgs: ['0x000000000000000000000000000000000000012d', 'latest'],
    result: '0x31981',
    formattedResult: new BigNumber('0x31981', 16),
    call: 'eth_getBalance'
  }
])
