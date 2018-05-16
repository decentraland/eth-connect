import { assert } from 'chai'
import utils = require('../../dist/utils/utils')

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

export class FakeHttpProvider {
  response
  error
  validation

  constructor() {
    this.response = getResponseStub()
    this.error = null
    this.validation = null
  }

  send(payload) {
    assert.equal(utils.isArray(payload) || utils.isObject(payload), true)
    // TODO: validate jsonrpc request
    if (this.error) {
      throw this.error
    }
    if (this.validation) {
      // imitate plain json object
      this.validation(JSON.parse(JSON.stringify(payload)))
    }

    return this.getResponse(payload)
  }

  sendAsync(payload, callback) {
    assert.equal(utils.isArray(payload) || utils.isObject(payload), true)
    assert.equal(utils.isFunction(callback), true)
    if (this.validation) {
      // imitate plain json object
      this.validation(JSON.parse(JSON.stringify(payload)), callback)
    }

    let response = this.getResponse(payload)
    let error = this.error
    setTimeout(function() {
      callback(error, response)
    }, 1)
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
      if (utils.isArray(this.response)) {
        this.response = this.response.map(function(response, index) {
          response.id = payload[index] ? payload[index].id : countId++
          return response
        })
      } else this.response.id = payload.id
    }

    return this.response
  }

  injectError(error) {
    this.error = error
  }

  injectValidation(callback) {
    this.validation = callback
  }
}
