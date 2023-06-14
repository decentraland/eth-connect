import expect from 'expect'

import { FakeHttpProvider } from './FakeHttpProvider'
import { RequestManager } from '../../src'

export function runTests(testName: string, tests: { result; call; formattedArgs; args; formattedResult }[]) {
  describe(testName, function () {
    tests.forEach(function (test, index) {
      it('async test: ' + index, async function () {
        // given
        const provider = new FakeHttpProvider()
        const rm = new RequestManager(provider)

        const didCall = provider.injectHandler(test.call, async (payload) => {
          provider.injectResult(test.result)
          expect(payload.jsonrpc).toEqual('2.0')
        })

        if (!rm[testName]) {
          throw new Error(`${testName} not found in RequestManager`)
        }

        const result = await rm[testName](...test.args)

        expect(result).toEqual(test.formattedResult)

        await didCall
      })
    })
  })
}
