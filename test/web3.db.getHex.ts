import testMethod = require('./helpers/test.method')
import { db } from '../dist/methods/db.js'

let tests = [
  {
    args: ['myDB', 'myKey'],
    formattedArgs: ['myDB', 'myKey'],
    result: '0xf',
    formattedResult: '0xf',
    call: 'db_getHex'
  }
]

testMethod.runTests('db.getHex', db.getHex, tests)
