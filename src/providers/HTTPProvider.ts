import { RPCMessage, Callback, toRPC } from './common'

export type HTTPProviderOptions = {
  headers?: { [key: string]: string }
  timeout?: number
}

/**
 * HttpProvider should be used to send rpc calls over http
 */
export class HTTPProvider {
  constructor(public host: string, public options: HTTPProviderOptions = {}) {
    this.host = host || 'http://localhost:8545'
  }

  // tslint:disable-next-line:prefer-function-over-method
  send() {
    throw new Error('Sync requests are deprecated')
  }
  /**
   * Should be used to make async request
   *
   * @method send
   * @param {Object} payload
   * @param {Function} callback triggered on end with (err, result)
   */
  sendAsync(payload: RPCMessage | RPCMessage[], callback: Callback) {
    let toSend = null

    if (payload instanceof Array) {
      toSend = payload.map($ => toRPC($))
    } else {
      toSend = toRPC(payload)
    }

    if (typeof fetch === 'undefined') {
      throw new Error('There is no global fetch object. Please install and import isomorphic-fetch')
    }

    const req = fetch(this.host, {
      body: JSON.stringify(toSend),
      keepalive: true,
      method: 'POST',
      mode: 'cors',
      headers: {
        ...this.options.headers
      }
    })

    req
      .then($ => $.json())
      .then($ => {
        callback(null, $)
      })
      .catch(err => callback(err))
  }
}
