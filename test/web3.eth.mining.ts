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
        let result = await rm.eth_mining()

        // then
        expect(test.formattedResult).toEqual(result)
      })
    })
  })
})
