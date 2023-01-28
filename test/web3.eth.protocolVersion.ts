import expect from 'expect'
import { RequestManager } from '../src'

import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'protocolVersion'

let tests = [
  {
    result: 1234,
    call: 'eth_' + method
  }
]

describe('eth.protocolVersion', function () {
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
        let result = await rm.eth_protocolVersion()

        // then
        expect(tests.result).toEqual(result)
      })
    })
  })
})
