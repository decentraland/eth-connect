import expect from 'expect'
import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let tests = [
  {
    result: true,
    formattedResult: true,
    call: 'eth_mining'
  }
]

describe('web3.eth', function () {
  describe('mining', function () {
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
        let result = await rm.eth_mining()

        // then
        expect(tests.formattedResult).toEqual(result)
      })
    })
  })
})
