/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as utils from './utils/utils'
import * as formatters from './utils/formatters'
import { RequestManager } from './RequestManager'
import * as config from './utils/config'
import { FilterOptions, LogObject, TxHash, SHHFilterOptions, Data, SHHFilterMessage } from './Schema'
import { future, IFuture } from 'fp-future'
import { stringToUtf8Bytes } from './utils/utf8'

function safeAsync(fn: () => Promise<any>) {
  return function () {
    // tslint:disable-next-line:no-console
    fn().catch(($) => console.error($))
  }
}

/**
 * Converts a given topic to a hex string, but also allows null values.
 *
 * @param value - The given value
 */
function toTopic(value: any): string | null {
  if (value === null || typeof value === 'undefined') return null

  const strValue = String(value).toString()

  if (strValue.indexOf('0x') === 0) {
    return strValue
  } else {
    return utils.bytesToHex(stringToUtf8Bytes(strValue))
  }
}

export type FilterCallback = (messages: LogObject[] | string[]) => void

export abstract class AbstractFilter<ReceivedLog, TransformedLog = ReceivedLog> {
  public isStarted = false
  public isDisposed = false

  public formatter: (x: ReceivedLog) => TransformedLog = x => x as any

  protected filterId: IFuture<Data> = future()
  protected callbacks: ((message: TransformedLog) => void)[] = []
  protected stopSemaphore = future()

  constructor(public requestManager: RequestManager) {
    // stub
  }

  async watch(callback: (message: TransformedLog) => void) {
    if (this.isDisposed) throw new Error('The filter was disposed')
    if (callback) {
      this.callbacks.push(callback)

      if (!this.isStarted) {
        await this.start()
      }
    }
  }

  async start() {
    if (this.isDisposed) throw new Error('The filter was disposed')
    if (this.isStarted) return

    this.isStarted = true

    try {
      const id = await this.getNewFilter()

      if (!id) {
        throw new Error('Could not create a filter, response: ' + JSON.stringify(id))
      }

      this.filterId.resolve(id)
    } catch (e) {
      throw e
    }

    this.stopSemaphore = future()
    await this.poll()
  }

  async stop() {
    if (!this.isStarted) return
    if (this.isDisposed) return

    this.isDisposed = true

    const filterId = await this.filterId

    this.isStarted = false

    if (this.stopSemaphore) await this.stopSemaphore

    const didStop = await this.uninstall()

    if (didStop !== true) {
      throw new Error(`Couldn't stop the eth filter: ${filterId}`)
    }
  }

  protected abstract getNewFilter(): Promise<Data>
  protected abstract getChanges(): Promise<ReceivedLog[]>
  protected abstract uninstall(): Promise<boolean>

  /**
   * Adds the callback and sets up the methods, to iterate over the results.
   */
  private async poll() {
    if (this.isStarted) {
      if (this.callbacks.length) {
        const result = await this.getChanges()

        this.callbacks.forEach((cb) => {
          if (this.formatter) {
            result.forEach(($) => {
              cb(this.formatter!($))
            })
          } else {
            result.forEach(($) => cb($ as any))
          }
        })
      }

      this.stopSemaphore.resolve(1)

      if (this.isStarted) {
        this.stopSemaphore = future()
        setTimeout(
          safeAsync(() => this.poll()),
          config.ETH_POLLING_TIMEOUT
        )
      }
    } else {
      this.stopSemaphore.resolve(1)
    }
  }
}

export class SHHFilter extends AbstractFilter<SHHFilterMessage> {
  constructor(public requestManager: RequestManager, public options: SHHFilterOptions) {
    super(requestManager)

    this.options = this.options || { topics: [] }
    this.options.topics = this.options.topics || []
    this.options.topics = this.options.topics.map(function (topic) {
      return toTopic(topic)
    })

    this.options = {
      topics: this.options.topics,
      to: this.options.to
    }
  }

  async getMessages(): Promise<SHHFilterMessage[]> {
    const filterId = await this.filterId
    return this.requestManager.shh_getMessages(filterId)
  }

  protected async getNewFilter(): Promise<string> {
    return this.requestManager.shh_newFilter(this.options)
  }

  protected async getChanges(): Promise<SHHFilterMessage[]> {
    const filterId = await this.filterId
    return this.requestManager.shh_getFilterChanges(filterId)
  }

  protected async uninstall(): Promise<boolean> {
    const filterId = await this.filterId
    return this.requestManager.shh_uninstallFilter(filterId)
  }
}

export class EthFilter<TransformedLog = LogObject, ReceivedLog = LogObject> extends AbstractFilter<ReceivedLog, TransformedLog> {
  constructor(
    public requestManager: RequestManager,
    public options: FilterOptions,
    public formatter: (message: ReceivedLog) => TransformedLog = (x) => x as any
  ) {
    super(requestManager)
    this.options = this.options || {}
    this.options.topics = this.options.topics || []
    this.options.topics = this.options.topics.map(function (topic) {
      return toTopic(topic)
    })

    this.options = {
      topics: this.options.topics,
      address: this.options.address ? this.options.address : undefined,
      fromBlock:
        typeof this.options.fromBlock === 'number' || typeof this.options.fromBlock === 'string'
          ? formatters.inputBlockNumberFormatter(this.options.fromBlock) || undefined
          : 'latest',
      toBlock:
        typeof this.options.toBlock === 'number' || typeof this.options.toBlock === 'string'
          ? formatters.inputBlockNumberFormatter(this.options.toBlock) || undefined
          : 'latest'
    }
  }

  async getLogs(): Promise<ReceivedLog[]> {
    if (!this.isStarted) {
      await this.start()
    }
    const filterId = await this.filterId

    return this.requestManager.eth_getFilterLogs(filterId) as any
  }

  protected async getNewFilter(): Promise<Data> {
    return this.requestManager.eth_newFilter(this.options)
  }

  protected async getChanges(): Promise<ReceivedLog[]> {
    const filterId = await this.filterId
    return this.requestManager.eth_getFilterChanges(filterId) as any
  }

  protected async uninstall(): Promise<boolean> {
    const filterId = await this.filterId
    return this.requestManager.eth_uninstallFilter(filterId)
  }
}

export class EthPendingTransactionFilter extends EthFilter<TxHash, TxHash> {
  constructor(requestManager: RequestManager) {
    super(requestManager, {})
  }
  async getNewFilter() {
    return this.requestManager.eth_newPendingTransactionFilter()
  }
}

export class EthBlockFilter extends EthFilter<TxHash, TxHash> {
  constructor(requestManager: RequestManager) {
    super(requestManager, {})
  }

  async getNewFilter() {
    return this.requestManager.eth_newBlockFilter()
  }
}
