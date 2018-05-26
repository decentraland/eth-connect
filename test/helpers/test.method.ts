import chai = require('chai')
const assert = chai.assert

import { FakeHttpProvider } from './FakeHttpProvider'
import { RequestManager } from '../../dist'

export function runTests(testName: string, tests: { result; call; formattedArgs; args; formattedResult }[]) {
  describe(testName, function() {
    tests.forEach(function(test, index) {
      it('async test: ' + index, async function() {
        // given
        const provider = new FakeHttpProvider()
        const rm = new RequestManager(provider)

        provider.injectResult(test.result)

        provider.injectValidation(async payload => {
          assert.equal(payload.jsonrpc, '2.0')
          assert.equal(payload.method, test.call)
          assert.deepEqual(payload.params, test.formattedArgs)
        })

        if (!rm[testName]) {
          throw new Error(`${testName} not found in RequestManager`)
        }

        const result = await rm[testName](...test.args)

        assert.deepEqual(test.formattedResult, result)
      })
    })
  })
}
