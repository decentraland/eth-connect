import expect from 'expect'
import { RequestManager } from '../src'

import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'listening'

let tests = [
  {
    result: true,
    formattedResult: true,
    call: 'net_' + method
  }
]

describe('web3.net', function () {
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
        let result = await rm.net_listening()

        // then
        expect(test.formattedResult).toEqual(result)
      })
    })
  })
})
