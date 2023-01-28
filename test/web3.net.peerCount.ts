import expect from 'expect'
import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'peerCount'

let tests = [
  {
    result: '0xf',
    formattedResult: 15,
    call: 'net_' + method
  }
]

describe('web3.net', function () {
  describe(method, function () {
    tests.forEach(function (tests, index) {
      it('property tests: ' + index, async function () {
        // given
        const provider = new FakeHttpProvider()
        const rm = new RequestManager(provider)
        provider.injectResult(tests.result)
        provider.injectValidation(async (payload) => {
          expect(payload.jsonrpc).toEqual('2.0')
          expect(payload.method).toEqual(tests.call)
          expect(payload.params).toEqual([])
        })

        // when
        let result = await rm.net_peerCount()

        // then
        expect(tests.formattedResult).toEqual(result)
      })
    })
  })
})
