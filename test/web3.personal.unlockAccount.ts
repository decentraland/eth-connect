import * as testMethod from './helpers/test.method'

let method = 'personal_unlockAccount'

let tests = [
  {
    args: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', 'P@ssw0rd!'],
    formattedArgs: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', 'P@ssw0rd!', null],
    result: true,
    formattedResult: true,
    call: method
  },
  {
    args: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', 'P@ssw0rd!', 10],
    formattedArgs: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', 'P@ssw0rd!', 10],
    result: true,
    formattedResult: true,
    call: method
  }
]

testMethod.runTests(method, tests)
