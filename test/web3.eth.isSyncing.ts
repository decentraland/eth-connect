import chai = require('chai')
const assert = chai.assert
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let method = 'isSyncing'

let tests = [
  {
    args: [],
    formattedArgs: [],
    result: [
      {
        startingBlock: '0xb',
        currentBlock: '0xb',
        highestBlock: '0xb'
      }
    ],
    formattedResult: {
      startingBlock: 11,
      currentBlock: 11,
      highestBlock: 11
    },
    call: 'eth_syncing'
  },
  {
    args: [],
    formattedArgs: [],
    result: [
      {
        startingBlock: '0xb',
        currentBlock: '0xb',
        highestBlock: '0xb',
        knownStates: '0xb',
        pulledStates: '0xb'
      }
    ],
    formattedResult: {
      startingBlock: 11,
      currentBlock: 11,
      highestBlock: 11,
      knownStates: 11,
      pulledStates: 11
    },
    call: 'eth_syncing'
  }
]

describe('eth', function() {
  describe(method, function() {
    tests.forEach(function(test, index) {
      it.skip('property test: ' + index, async function() {
        // given
        const provider = new FakeHttpProvider()

        provider.injectBatchResults(test.result)
        provider.injectValidation(function(payload) {
          assert.equal(payload[0].jsonrpc, '2.0', 'failed')
          assert.equal(payload[0].method, test.call)
          assert.deepEqual(payload[0].params, test.formattedArgs)
        })

        // TODO results seem to be overwritten
        /*
        // call
        let syncing = eth[method].exec(r,function(e, res) {
          if (count === 1) {
            assert.isTrue(res)
            count++
          } else {
            assert.deepEqual(res, test.formattedResult)
            syncing.stopWatching()
            done()
          }
        })
        */
      })
    })
  })
})
