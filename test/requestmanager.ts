import chai = require('chai')
const assert = chai.assert
import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

// TODO: handling errors!
// TODO: validation of params!

describe('lib/web3/requestmanager', function() {
  describe('send', function() {
    it('should return expected result asynchronously', async function() {
      const provider = new FakeHttpProvider()
      let manager = new RequestManager(provider)
      let expected = 'hello_world'
      provider.injectResult(expected)

      const result = await manager.sendAsync({
        method: 'test',
        params: [1, 2, 3]
      })

      assert.equal(expected, result)
    })
  })
})
