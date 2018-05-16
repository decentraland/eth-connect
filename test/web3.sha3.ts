import chai = require('chai')
const assert = chai.assert
import { sha3 } from '../dist/utils/utils'

describe('web3.sha3', function() {
  it('should return sha3 with hex prefix 1', function() {
    let test1 = sha3('test123')

    assert.deepEqual(test1, '0x' + sha3('test123'))
  })
  it('should return sha3 with hex prefix 2', function() {
    let test2 = sha3('test(int)')

    assert.deepEqual(test2, '0x' + sha3('test(int)'))
  })
  it('should return sha3 with hex prefix 3', function() {
    let test3 = sha3('0x80', { encoding: 'hex' })

    assert.deepEqual(test3, '0x' + sha3('0x80', { encoding: 'hex' }))
  })
  it('should return sha3 with hex prefix 4', function() {
    let test4 = sha3('0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1', { encoding: 'hex' })

    assert.deepEqual(
      test4,
      '0x' + sha3('0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1', { encoding: 'hex' })
    )
  })
})
