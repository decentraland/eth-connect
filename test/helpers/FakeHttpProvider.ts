import { assert } from 'chai'
import utils = require('../../src/utils/utils')
import { future, IFuture } from '../../src/utils/future'

let countId = 1

let getResponseStub = function() {
  return {
    jsonrpc: '2.0',
    id: countId++,
    result: null
  }
}

let getErrorStub = function() {
  return {
    jsonrpc: '2.0',
    countId: countId++,
    error: {
      code: 1234,
      message: 'Stub error'
    }
  }
}

function validateRPC(payload) {
  try {
    assert.equal(payload.jsonrpc, '2.0', 'request has jsonrpc: "2.0"')
    assert.equal(typeof payload.method, 'string', 'request has method: string')
    assert.equal('params' in payload, true, 'request has params')
    assert.equal(typeof payload.id, 'number', 'request has id: number')
  } catch (e) {
    throw new Error('JSON-RPC2 Error:\n' + e.message + ' \nrequest: ' + JSON.stringify(payload) + ' \nstack:' + e.stack)
  }
}

export class FakeHttpProvider {
  response
  error
  validations: { defer: IFuture<any>; callback: (result: any) => Promise<any> }[] = []

  constructor() {
    this.error = null
  }

  // tslint:disable-next-line
  send(_) {
    throw new Error('Cannot call sync code')
  }

  sendAsync(payload, callback) {
    assert.equal(utils.isArray(payload) || utils.isObject(payload), true, 'payload is an array or object')
    assert.equal(utils.isFunction(callback), true, 'callback is a function')

    if (payload instanceof Array) {
      payload.forEach(validateRPC)
    } else {
      validateRPC(payload)
    }

    let mutex: Promise<any> = Promise.resolve()

    if (this.validations) {
      // imitate plain json object
      mutex = Promise.all(
        this.validations.map($ => {
          try {
            return $.callback(JSON.parse(JSON.stringify(payload)))
              .then(x => {
                if (x !== false) $.defer.resolve(payload)
              })
              .catch(x => {
                $.defer.reject(x)
              })
          } catch (e) {
            $.defer.reject(e)
            return $.defer
          }
        })
      )
    }

    mutex
      .then(() => {
        try {
          if (this.error) {
            callback(this.error)
            this.error = null
          } else {
            let response = this.getResponse(payload)
            callback(null, response)
          }
        } catch (e) {
          callback(e, null)
        }
      })
      .catch(e => {
        // tslint:disable-next-line
        console.error(e)
        callback(e)
      })
  }

  injectResponse(response) {
    this.response = response
  }

  injectResult(result) {
    this.response = getResponseStub()
    this.response.result = result
  }

  injectBatchResults(results, error?) {
    this.response = results.map(function(r) {
      if (error) {
        let response = getErrorStub()
        response.error.message = r
        return response
      } else {
        let response = getResponseStub()
        response.result = r
        return response
      }
    })
  }

  getResponse(payload) {
    if (this.response) {
      const requestIsArray = utils.isArray(payload)
      const responseIsArray = utils.isArray(this.response)

      if (responseIsArray !== requestIsArray) {
        console.log(`Req: ${JSON.stringify(payload)}`)
        console.log(`Res: ${JSON.stringify(this.response)}`)
        throw new Error(`Request is array (${requestIsArray}) != response is array (${responseIsArray})`)
      }

      if (responseIsArray) {
        this.response = this.response.map(function(response, index) {
          response.id = payload[index] ? payload[index].id : countId++
          return response
        })

        if (this.response.some($ => !$.id)) {
          throw new Error(
            `Could not obtain response.id for payload ${JSON.stringify(payload)} response: ${JSON.stringify(
              this.response
            )}`
          )
        }
      } else {
        this.response.id = payload.id

        if (!this.response.id) {
          throw new Error(
            `Could not obtain response.id for payload ${JSON.stringify(payload)} response: ${JSON.stringify(
              this.response
            )}`
          )
        }
      }
    } else {
      throw new Error(`There is no response for request ${JSON.stringify(payload)}`)
    }

    const res = this.response
    this.response = null

    return res
  }

  injectError(error) {
    this.error = error
  }

  injectValidation(callback: (result) => Promise<any>) {
    const defer = future()
    this.validations.push({ callback, defer })
    return defer
  }

  injectHandler(method: string, callback: (result) => Promise<any>) {
    const defer = future()
    this.validations.push({
      callback: async payload => {
        if (!utils.isArray(payload) && payload.method === method) {
          await callback(payload)
        } else {
          return false
        }
      },
      defer
    })
    return defer
  }

  mockGetFilterLogs(result: any) {
    return this.injectValidation(async payload => {
      if (payload.method !== 'eth_getFilterLogs') return false

      const base = {
        address: '0x1',
        topics: [
          '0x0000000000000000000000001234567890123456789012345678901234567891',
          '0x0000000000000000000000000000000000000000000000000000000000000001'
        ],
        number: 2,
        data:
          '0x0000000000000000000000000000000000000000000000000000000000000001' +
          '0000000000000000000000000000000000000000000000000000000000000008'
      }

      if (utils.isArray(result)) {
        this.injectResult(result.map($ => ({ ...base, ...$ })))
      } else {
        this.injectResult([
          {
            ...base,
            ...result
          }
        ])
      }
      assert.equal(payload.jsonrpc, '2.0')
      assert.equal(payload.method, 'eth_getFilterLogs')
    })
  }

  mockGetFilterChanges(result: any, cb?) {
    return this.injectValidation(async payload => {
      if (payload.method === 'eth_getFilterChanges') {
        if (!cb || !cb(payload)) {
          this.injectResult([
            {
              address: '0x1',
              topics: [],
              number: 2,
              data:
                '0x0000000000000000000000000000000000000000000000000000000000000001' +
                '0000000000000000000000000000000000000000000000000000000000000008',
              ...result
            }
          ])
        }
      } else if (utils.isArray(payload) && payload.some($ => $.method === 'eth_getFilterChanges')) {
        if (!cb || !cb(payload)) {
          this.injectBatchResults([
            [
              {
                address: '0x1',
                topics: [],
                number: 2,
                data:
                  '0x0000000000000000000000000000000000000000000000000000000000000001' +
                  '0000000000000000000000000000000000000000000000000000000000000008',
                ...result
              }
            ]
          ])

          let r = payload.filter(function(p) {
            return p.jsonrpc === '2.0' && p.method === 'eth_getFilterChanges' && p.params[0] === '0x3'
          })
          assert.equal(r.length > 0, true)
        }
      } else {
        return false
      }
    })
  }

  mockSendTransaction(txId: string, expectedData: string) {
    return this.injectValidation(async payload => {
      if (payload.method !== 'eth_sendTransaction') return false
      this.injectResult(txId)
      assert.equal(payload.params[0].data, expectedData)
    })
  }

  mockSyncing(overrides = {}) {
    return this.injectValidation(async payload => {
      if (!utils.isArray(payload) && payload.method !== 'eth_syncing') return false
      if (utils.isArray(payload) && !payload.some($ => $.method === 'eth_syncing')) return false

      const base = {
        startingBlock: '0x384',
        currentBlock: '0x386',
        highestBlock: '0x454',
        ...overrides
      }

      if (utils.isArray(payload)) {
        this.injectBatchResults([[base]])
      } else {
        this.injectResult(base)
      }
    })
  }

  mockNewBlockFilter(result = '0x1') {
    return this.injectValidation(async payload => {
      if (payload.method !== 'eth_newBlockFilter') return false

      this.injectResult(result)
      assert.equal(payload.jsonrpc, '2.0')
      assert.equal(payload.method, 'eth_newBlockFilter')
    })
  }

  mockNewFilter(compareParams) {
    return this.injectValidation(async payload => {
      if (payload.method !== 'eth_newFilter') return false

      this.injectResult('0x3')
      assert.equal(payload.jsonrpc, '2.0')
      assert.equal(payload.method, 'eth_newFilter')
      assert.deepEqual(payload.params[0], compareParams)
    })
  }

  mockUninstallFilter() {
    return this.injectValidation(async payload => {
      if (payload.method === 'eth_uninstallFilter') {
        this.injectResult('0x1')
      } else {
        return false
      }
    })
  }

  mockShhDeleteFilter() {
    return this.injectValidation(async payload => {
      if (payload.method === 'shh_deleteMessageFilter') {
        this.injectResult(true)
      } else {
        return false
      }
    })
  }

  mockGetTransactionReceipt(txId: string, opt?) {
    return this.injectValidation(async payload => {
      if (payload.method === 'eth_getTransactionReceipt') {
        this.injectResult({
          transactionHash: txId,
          transactionIndex: '0x1', // 1
          blockNumber: '0xb', // 11
          blockHash: '0xc6ef2fc5426d6ad6fd9e2a26abeab0aa2411b7ab17f30a99d3cb96aed1d1055b',
          cumulativeGasUsed: '0x33bc', // 13244
          gasUsed: '0x4dc', // 1244
          contractAddress: '0x0', // or null, if none was created
          logs: [],
          logsBloom: '0x00...0', // 256 byte bloom filter
          status: '0x1',
          ...opt
        })
      } else {
        return false
      }
    })
  }
}
