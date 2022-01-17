import { RPCMessage, Callback, toRPC } from './common'
export { RPCMessage, Callback } from './common'

export type HTTPProviderOptions = {
  headers?: { [key: string]: string }
  timeout?: number
  requestMode?: 'cors' | 'navigate' | 'no-cors' | 'same-origin'
}

/**
 * @public
 *
 * HttpProvider should be used to send rpc calls over http
 */
export class HTTPProvider {
  debug = false

  constructor(public host: string, public options: HTTPProviderOptions = {}) {
    this.host = host || 'http://localhost:8545'
  }

  /* istanbul ignore next */
  // tslint:disable-next-line:prefer-function-over-method
  send() {
    /* istanbul ignore next */
    throw new Error('Sync requests are deprecated')
  }

  /**
   * Should be used to make async request
   */
  sendAsync(payload: RPCMessage | RPCMessage[], callback: Callback) {
    try {
      let toSend = null

      if (payload instanceof Array) {
        toSend = payload.map(($) => toRPC($))
      } else {
        toSend = toRPC(payload)
      }

      /* istanbul ignore if */
      if (typeof fetch === 'undefined') {
        throw new Error('There is no global fetch object. Please install and import isomorphic-fetch')
      }

      const params: RequestInit = {
        body: JSON.stringify(toSend),
        method: 'POST',
        mode: this.options.requestMode,
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json'
        }
      }

      /* istanbul ignore if */
      // tslint:disable-next-line:no-console
      if (this.debug) console.log('SEND >> ' + params.body)

      fetch(this.host, params).then(
        async ($) => {
          if (!$.ok) {
            /* istanbul ignore if */
            // tslint:disable-next-line:no-console
            if (this.debug) console.log('ERR << ' + JSON.stringify($))
            callback(new Error('External error. response code: ' + $.status))
          } else {
            const json = await $.json()
            /* istanbul ignore if */
            // tslint:disable-next-line:no-console
            if (this.debug) console.log('RECV << ' + JSON.stringify(json))
            if (json.error) {
              callback(Object.assign(new Error(json.error.json || json.error), json.error))
            } else {
              callback(null, json)
            }
          }
        },
        (err) => {
          /* istanbul ignore if */
          // tslint:disable-next-line:no-console
          if (this.debug) console.log('ERR << ' + JSON.stringify(err))
          callback(err)
        }
      )
    } catch (e) {
      /* istanbul ignore if */
      // tslint:disable-next-line:no-console
      if (this.debug) console.log('ERR << ' + JSON.stringify(e))
      callback(e)
    }
  }
}
