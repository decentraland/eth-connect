import expect from 'expect'
import { RequestManager } from '../src'

import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'hashrate'

let tests = [
  {
    result: '0x788a8',
    formattedResult: 493736,
    call: 'eth_' + method
  }
]

describe('web3.eth', function () {
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
        let result = await rm.eth_hashrate()

        // then
        expect(tests.formattedResult).toEqual(result)

        // clear the validation
        provider.injectValidation(async function () {
          // stub
        })
      })
    })
  })
})
