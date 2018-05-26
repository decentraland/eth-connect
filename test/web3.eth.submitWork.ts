import testMethod = require('./helpers/test.method')

let tests = [
  {
    args: [
      '0x567890abcdef5555',
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      '0xcdef1234567890abcdef1234567890abcdef0x1234567890abcf1234567890ab'
    ],
    formattedArgs: [
      '0x567890abcdef5555',
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      '0xcdef1234567890abcdef1234567890abcdef0x1234567890abcf1234567890ab'
    ],
    result: true,
    formattedResult: true,
    call: 'eth_submitWork'
  }
]

testMethod.runTests(`eth_submitWork`, tests)
