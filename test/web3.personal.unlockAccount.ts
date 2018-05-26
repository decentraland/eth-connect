import testMethod = require('./helpers/test.method')

let method = 'unlockAccount'

let tests = [
  {
    args: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', 'P@ssw0rd!'],
    formattedArgs: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', 'P@ssw0rd!', null],
    result: true,
    formattedResult: true,
    call: 'personal_' + method
  },
  {
    args: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', 'P@ssw0rd!', 10],
    formattedArgs: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', 'P@ssw0rd!', 10],
    result: true,
    formattedResult: true,
    call: 'personal_' + method
  }
]

testMethod.runTests(`personal_${method}`, tests)
