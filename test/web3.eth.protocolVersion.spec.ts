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
    tests.forEach(function (test, index) {
      it('property test: ' + index, async function () {
        // given
        const provider = new FakeHttpProvider()
        const rm = new RequestManager(provider)
        provider.injectResult(test.result)
        provider.injectValidation(async (payload) => {
          expect(payload.jsonrpc).toEqual('2.0')
          expect(payload.method).toEqual(test.call)
          expect(payload.params).toEqual([])
        })

        // when
        let result = await rm.eth_protocolVersion()

        // then
        expect(test.result).toEqual(result)
      })
    })
  })
})
