import testMethod = require('./helpers/test.method')
import { toHex } from '../src'

let method = 'post'

let tests = [
  {
    args: [
      {
        symKeyID: '123123123ff',
        sig: '44ffdd55',
        topic: '0xffdd11',
        payload: toHex('12345'),
        ttl: 100,
        minPow: 0.5,
        powTarget: 3,
        padding: '0xffdd4455'
      }
    ],
    formattedArgs: [
      {
        symKeyID: '123123123ff',
        sig: '44ffdd55',
        topic: '0xffdd11',
        payload: toHex('12345'),
        ttl: 100,
        minPow: 0.5,
        powTarget: 3,
        padding: '0xffdd4455'
      }
    ],
    result: true,
    formattedResult: true,
    call: 'shh_' + method
  }
]

testMethod.runTests(`shh_${method}`, tests)
