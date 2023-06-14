import { Callback, RPCResponse, RPCMessage, toRPC } from './common'
import { IFuture, future } from 'fp-future'

export interface IWebSocket {
  /**
   * Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason.
   */
  close(code?: number, reason?: string): void
  /**
   * Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView.
   */
  send(data: string): void
  onclose: ((this: this, ev: any) => any) | null
  onerror: ((this: this, ev: any) => any) | null
  onmessage: ((this: this, ev: any) => any) | null
  onopen: ((this: this, ev: any) => any) | null
}

export type WebSocketProviderOptions = {
  /**
   * WebSocketConstructor, used in Node.js where WebSocket is not globally available
   */
  WebSocketConstructor?: any

  timeout?: number

  protocol?: string
}

/**
 * @public
 */
export class WebSocketProvider<T extends IWebSocket> {
  isDisposed = false

  // @internal
  responseCallbacks = new Map<number, IFuture<any>>()
  // @internal
  notificationCallbacks = new Set<Callback>()
  connection!: IFuture<T>

  debug = false

  private lastChunk: string = ''
  private lastChunkTimeout: any

  constructor(public url: string, public options: WebSocketProviderOptions = {}) {
    this.connect()
  }

  dispose() {
    this.isDisposed = true
    const connection = this.connection
    this.timeout(new Error('Provider disposed.'))
    connection
      .then(($) => $.close())
      .catch((err: any) => {
        if (this.debug) {
          console.error(err)
        }
      })
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
        payload.map(($) => {
          const defer = future<any>()

          try {
            const message = toRPC($)
            toSend.push(message)
            this.responseCallbacks.set(message.id, defer)
          } catch (e: any) {
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
      } catch (e: any) {
        defer.reject(e)
      }
      didFinish = defer
    }

    didFinish.then(
      ($) => callback(null, $),
      (err) => callback(err)
    )

    this.connection.then(
      (ws) => {
        toSend.forEach(($) => {
          const s = JSON.stringify($)

          /* istanbul ignore if */
          if (this.debug) console.log('SEND >> ' + s)
          ws.send(s)
        })
      },
      (err) => {
        callback(err)
      }
    )
  }

  /**
   * Will parse the response and make an array out of it.
   */
  private parseResponse(data: string) {
    const returnValues: any[] = []

    // DE-CHUNKER
    const dechunkedData = data
      .replace(/\}[\n\r]?\{/g, '}|--|{') // }{
      .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
      .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
      .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
      .split('|--|')

    dechunkedData.forEach((chunk) => {
      let data = chunk
      // prepend the last chunk
      if (this.lastChunk) {
        data = this.lastChunk + data
      }

      let result: any = null

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
      this.lastChunk = ''

      if (result) returnValues.push(result)
    })

    return returnValues
  }

  private processMessage(message: RPCResponse) {
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
      this.notificationCallbacks.forEach(($) => $(null, message))
    }
  }

  /**
   * Timeout all requests when the end/error event is fired
   */
  private timeout(error?: Error) {
    if (!this.connection || !this.connection.isPending) {
      this.connection = future<T>()
    }

    const timeoutError = error || new Error('Connection timeout')
    this.responseCallbacks.forEach(($) => $.reject(timeoutError))
    this.responseCallbacks.clear()

    // reset all requests and callbacks
    if (!this.isDisposed) {
      setTimeout(() => this.connect(), 1000)
    }
  }

  private connect() {
    if (this.connection && !this.connection.isPending) {
      this.connection
        .then(($) => $.close())
        .catch((err: any) => {
          if (this.debug) {
            console.error(err)
          }
        })
    }

    if (!this.connection || !this.connection.isPending) {
      this.connection = future<T>()
    }

    this.lastChunk = ''

    const ctor = this.options.WebSocketConstructor || (typeof WebSocket !== 'undefined' ? WebSocket : void 0)

    if (!ctor) {
      throw new Error('Please provide a WebSocketConstructor')
    }

    const connection: T = new ctor(this.url, this.options.protocol)

    connection.onopen = () => {
      this.connection.resolve(connection)
    }

    connection.onerror = (error) => {
      const theError = new Error('Error in web socket')
      ;(theError as any).data = error
      this.timeout(theError)
    }

    connection.onclose = (event) => {
      this.timeout(new Error(`Connection closed (${(event && event.reason) || 'Unknown reason'})`))
    }

    // LISTEN FOR CONNECTION RESPONSES
    connection.onmessage = (e) => {
      const data = typeof e.data === 'string' ? e.data : ''

      /* istanbul ignore if */
      if (this.debug) console.log('RECV << ' + e.data)

      this.parseResponse(data).forEach((result) => {
        // get the id which matches the returned id
        if (result instanceof Array) {
          result.forEach(($) => this.processMessage($))
        } else {
          this.processMessage(result)
        }
      })
    }
  }
}

export default WebSocketProvider
