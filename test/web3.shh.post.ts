import { utils } from '../dist'
import testMethod = require('./helpers/test.method')

let method = 'post'

let tests = [
  {
    args: [
      {
        symKeyID: '123123123ff',
        sig: '44ffdd55',
        topic: '0xffdd11',
        payload: utils.toHex('12345'),
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
        payload: utils.toHex('12345'),
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
