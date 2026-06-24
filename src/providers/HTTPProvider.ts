import { RPCMessage, Callback, toRPC } from './common'
export { RPCMessage, Callback } from './common'

// Structurally compatible with the global native `fetch` (the same WHATWG signature on web
// and server) as well as native-fetch components (e.g. @dcl/fetch-component) and node-fetch,
// so callers can pass any of them directly without a cast. Only the fields HTTPProvider sets
// are listed; a previous `mode?: string` was dropped because it is unused here and made the
// native fetch's `RequestInit` (`mode?: RequestMode`) non-assignable to this type.
export type FetchFunction = (
  url: string,
  params: {
    body?: any
    method?: string
    headers?: any
  }
) => Promise<any>

export type HTTPProviderOptions = {
  headers?: { [key: string]: string }
  timeout?: number
  fetch?: FetchFunction
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

      const fetch = this.options.fetch || globalThis.fetch

      /* istanbul ignore if */
      if (typeof fetch === 'undefined') {
        throw new Error(
          'There is no global fetch object nor it was provided. Please install and import isomorphic-fetch'
        )
      }

      const params: RequestInit = {
        body: JSON.stringify(toSend),
        method: 'POST',
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json'
        }
      }

      /* istanbul ignore if */
      if (this.debug) console.log('SEND >> ' + params.body)

      fetch(this.host, params).then(
        async ($) => {
          if (!$.ok) {
            // Drain the error response body so the underlying connection is released: native
            // fetch (undici) and browser fetch keep the socket checked out until the body is
            // read or cancelled. Reading it also lets us surface the server's error detail,
            // which is far more useful than a bare status code when debugging RPC failures.
            // Best-effort and bounded: ignore read failures and cap the detail length.
            const errorBody = typeof $.text === 'function' ? await $.text().catch(() => '') : ''
            const detail = errorBody.trim().slice(0, 512)
            const message = 'External error. response code: ' + $.status + (detail ? ' — ' + detail : '')
            /* istanbul ignore if */
            if (this.debug) console.log('ERR << ' + message)
            callback(new Error(message))
          } else {
            const json = await $.json()
            /* istanbul ignore if */
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
          if (this.debug) console.log('ERR << ' + JSON.stringify(err))
          callback(err)
        }
      )
    } catch (e: any) {
      /* istanbul ignore if */
      if (this.debug) console.log('ERR << ' + JSON.stringify(e))
      callback(e)
    }
  }
}
