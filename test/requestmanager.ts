import expect from 'expect'
import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

// TODO: handling errors!
// TODO: validation of params!

describe('lib/web3/requestmanager', function () {
  describe('send', function () {
    it('should return expected result asynchronously', async function () {
      const provider = new FakeHttpProvider()
      let manager = new RequestManager(provider)
      let expected = 'hello_world'
      provider.injectResult(expected)

      const result = await manager.sendAsync({
        method: 'tests',
        params: [1, 2, 3]
      })

      expect(result).toEqual(expected)
    })
  })
})
