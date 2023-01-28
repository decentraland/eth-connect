import expect from 'expect'

import { FakeHttpProvider } from './FakeHttpProvider'
import { RequestManager } from '../../src'

export function runTests(testsName: string, tests: { result; call; formattedArgs; args; formattedResult }[]) {
  describe(testsName, function () {
    tests.forEach(function (tests, index) {
      it('async tests: ' + index, async function () {
        // given
        const provider = new FakeHttpProvider()
        const rm = new RequestManager(provider)

        const didCall = provider.injectHandler(tests.call, async (payload) => {
          provider.injectResult(tests.result)
          expect(payload.jsonrpc).toEqual('2.0')
        })

        if (!rm[testsName]) {
          throw new Error(`${testsName} not found in RequestManager`)
        }

        const result = await rm[testsName](...tests.args)

        expect(result).toEqual(tests.formattedResult)

        await didCall
      })
    })
  })
}
