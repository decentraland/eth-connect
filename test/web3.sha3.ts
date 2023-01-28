import expect from 'expect'
import { sha3 } from '../src/utils/utils'

describe('sha3', function () {
  it('hash fidelity check', function () {
    let tests1 = sha3('test123')

    expect(tests1).toEqual('f81b517a242b218999ec8eec0ea6e2ddbef2a367a14e93f4a32a39e260f686ad')
  })
})
