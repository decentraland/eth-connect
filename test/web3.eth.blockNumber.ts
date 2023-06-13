import expect from 'expect'
import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'blockNumber'

let tests = [
  {
    result: '0xb',
    formattedResult: 11,
    call: 'eth_' + method
  }
]

describe('web3.eth', function () {
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
        let result = await rm.eth_blockNumber()

        // then
        expect(test.formattedResult).toEqual(result)
      })
    })
  })
})
