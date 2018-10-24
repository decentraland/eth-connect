import { Callback, RPCMessage, toRPC } from './common'
import { IFuture, future } from '../utils/future'

export interface IWebSocket {
  close()
  send(s: any)
}

export type WebSocketProviderOptions = {
  /**
   * WebSocketConstructor, used in Node.js where WebSocket is not globally available
   */
  WebSocketConstructor?: any

  timeout?: number

  protocol?: string
}

export class WebSocketProvider<T extends IWebSocket> {
  isDisposed = false

  responseCallbacks = new Map<number, IFuture<any>>()
  notificationCallbacks = new Set<Callback>()
  connection: IFuture<T>

  debug = false

  private lastChunk: string = ''
  private lastChunkTimeout: any

  constructor(public url: string, public options: WebSocketProviderOptions = {}) {
    this.connect()
  }

  dispose() {
    this.isDisposed = true
    // tslint:disable-next-line:no-floating-promises
    this.connection.then($ => $.close())
  }

  /* istanbul ignore next */
  // tslint:disable-next-line:prefer-function-over-method
  send() {
    /* istanbul ignore next */
    throw new Error('Sync requests are deprecated')
  }

  sendAsync(payload: RPCMessage | RPCMessage[], callback: Callback) {
    const toSend: RPCMessage[] = []
    let didFinish: Promise<any>
    if (payload instanceof Array) {
      didFinish = Promise.all(
        payload.map($ => {
          const defer = future<any>()

          try {
            const message = toRPC($)
            toSend.push(message)
            this.responseCallbacks.set(message.id, defer)
          } catch (e) {
            defer.reject(e)
          }

          return defer
        })
      )
    } else {
      const defer = future<any>()
      try {
        const message = toRPC(payload)
        toSend.push(message)
        this.responseCallbacks.set(message.id, defer)
      } catch (e) {
        defer.reject(e)
      }
      didFinish = defer
    }

    didFinish.then($ => callback(null, $), err => callback(err))

    this.connection.then(
      ws => {
        toSend.forEach($ => {
          const s = JSON.stringify($)

          /* istanbul ignore if */
          // tslint:disable-next-line:no-console
          if (this.debug) console.log('SEND >> ' + s)
          ws.send(s)
        })
      },
      err => {
        callback(err)
      }
    )
  }

  /**
   * Will parse the response and make an array out of it.
   * @method _parseResponse
   * @param {String} data
   */
  private parseResponse(data: string) {
    let returnValues = []

    // DE-CHUNKER
    let dechunkedData = data
      .replace(/\}[\n\r]?\{/g, '}|--|{') // }{
      .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
      .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
      .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
      .split('|--|')

    dechunkedData.forEach(chunk => {
      let data = chunk
      // prepend the last chunk
      if (this.lastChunk) {
        data = this.lastChunk + data
      }

      let result = null

      try {
        result = JSON.parse(data)
      } catch (e) {
        this.lastChunk = data

        // start timeout to cancel all requests
        clearTimeout(this.lastChunkTimeout)

        this.lastChunkTimeout = setTimeout(() => {
          this.timeout()
        }, 1000 * 15)

        return
      }

      // cancel timeout and set chunk to null
      clearTimeout(this.lastChunkTimeout)
      this.lastChunk = null

      if (result) returnValues.push(result)
    })

    return returnValues
  }

  private processMessage(message) {
    if ('id' in message) {
      const id = message.id

      const defer = this.responseCallbacks.get(id)

      if (!defer) {
        // tslint:disable-next-line:no-console
        console.error('Error: Received a response for an unknown request', message)
        return
      }

      this.responseCallbacks.delete(id)

      if ('error' in message) {
        defer.reject(Object.assign(new Error(message.error.message || message.error), message.error))
      } else if ('result' in message) {
        defer.resolve(message)
      }
    } else {
      this.notificationCallbacks.forEach($ => $(null, message))
    }
  }

  /**
   * Timeout all requests when the end/error event is fired
   * @method _timeout
   */
  private timeout(error?: Error) {
    if (!this.connection || !this.connection.isPending) {
      this.connection = future<T>()
    }

    const timeoutError = error || new Error('Connection timeout')
    this.responseCallbacks.forEach($ => $.reject(timeoutError))
    this.responseCallbacks.clear()

    // reset all requests and callbacks
    if (!this.isDisposed) {
      this.connect()
    }
  }

  private connect() {
    if (this.connection && !this.connection.isPending) {
      // tslint:disable-next-line
      this.connection.then($ => $.close())
    }

    if (!this.connection || !this.connection.isPending) {
      this.connection = future<T>()
    }

    this.lastChunk = ''

    let ctor = this.options.WebSocketConstructor || (typeof WebSocket !== 'undefined' ? WebSocket : void 0)

    if (!ctor) {
      throw new Error('Please provide a WebSocketConstructor')
    }

    const connection = new ctor(this.url, this.options.protocol)

    connection.onopen = () => {
      this.connection.resolve(connection)
    }

    connection.onerror = error => {
      this.timeout(error)
    }

    connection.onclose = () => {
      this.timeout()
    }

    // LISTEN FOR CONNECTION RESPONSES
    connection.onmessage = e => {
      let data = typeof e.data === 'string' ? e.data : ''

      /* istanbul ignore if */
      // tslint:disable-next-line:no-console
      if (this.debug) console.log('RECV << ' + e.data)

      this.parseResponse(data).forEach(result => {
        // get the id which matches the returned id
        if (result instanceof Array) {
          result.forEach($ => this.processMessage($))
        } else {
          this.processMessage(result)
        }
      })
    }
  }
}

export default WebSocketProvider
