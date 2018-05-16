import chai = require('chai')
import { RequestManager } from '../dist'

const assert = chai.assert
import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { shh } from '../dist/methods/shh'

let method = 'newMessageFilter'

let tests = [
  {
    args: [
      {
        symKeyID: '47d33b27bb249a2dbab4c0612bf9caf4c1950855',
        sig: '0x55dd47d33b27bb249a2dbab4c0612bf9caf4c1950855',
        minPow: 0.5,
        topics: ['0x32dd4f54', '0x564b4566'],
        allowP2P: false
      }
    ],
    formattedArgs: [
      {
        symKeyID: '47d33b27bb249a2dbab4c0612bf9caf4c1950855',
        sig: '0x55dd47d33b27bb249a2dbab4c0612bf9caf4c1950855',
        minPow: 0.5,
        topics: ['0x32dd4f54', '0x564b4566'],
        allowP2P: false
      }
    ],
    result: '0xf',
    formattedResult: '0xf',
    call: 'shh_newMessageFilter'
  }
]

describe('shh', function() {
  describe(method, function() {
    tests.forEach(function(test, index) {
      it('property test: ' + index, async function() {
        // given
        const provider = new FakeHttpProvider()
        const rm = new RequestManager(provider)

        provider.injectResult(test.result)
        provider.injectValidation(function(payload) {
          assert.equal(payload.jsonrpc, '2.0')
          assert.equal(payload.method, test.call)
          assert.deepEqual(payload.params, test.formattedArgs)
        })

        // call
        await shh[method].exec(rm, test.args)
      })
    })
  })
})
