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
        let result = await rm.personal_listAccounts()

        // then
        expect(tests.formattedResult).toEqual(result)
      })
    })
  })
})
