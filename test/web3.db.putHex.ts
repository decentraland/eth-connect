import testMethod = require('./helpers/test.method')
import { db } from '../dist/methods/db'

let method = 'putHex'

let tests = [
  {
    args: ['myDB', 'myKey', '0xb'],
    formattedArgs: ['myDB', 'myKey', '0xb'],
    result: true,
    formattedResult: true,
    call: 'db_' + method
  }
]

testMethod.runTests(`db.${method}`, db.putHex, tests)
