import testMethod = require('./helpers/test.method')
import { db } from '../dist/methods/db'

let method = 'getString'

let tests = [
  {
    args: ['myDB', 'myKey'],
    formattedArgs: ['myDB', 'myKey'],
    result: 'myValue',
    formattedResult: 'myValue',
    call: 'db_' + method
  }
]

testMethod.runTests(`db.${method}`, db.getString, tests)
