import testMethod = require('./helpers/test.method')
import { db } from '../dist/methods/db'

let method = 'putString'

let tests = [
  {
    args: ['myDB', 'myKey', 'myValue'],
    formattedArgs: ['myDB', 'myKey', 'myValue'],
    result: true,
    formattedResult: true,
    call: 'db_' + method
  }
]
testMethod.runTests(`db.${method}`, db.putString, tests)
