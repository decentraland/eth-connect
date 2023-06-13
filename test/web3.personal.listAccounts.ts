import expect from 'expect'
import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'listAccounts'

let tests = [
  {
    result: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855'],
    formattedResult: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855'],
    call: 'personal_' + method
  }
]

describe('web3.personal', function () {
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
        let result = await rm.personal_listAccounts()

        // then
        expect(test.formattedResult).toEqual(result)
      })
    })
  })
})
