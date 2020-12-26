import * as chai from 'chai'
const assert = chai.assert
import { sha3 } from '../src/utils/utils'

describe('sha3', function() {
  it('hash fidelity check', function() {
    let test1 = sha3('test123')

    assert.deepEqual(test1, 'f81b517a242b218999ec8eec0ea6e2ddbef2a367a14e93f4a32a39e260f686ad')
  })
})
