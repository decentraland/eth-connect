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
import config = require('./utils/config')
import { FilterOptions, FilterChange, TxHash, SHHFilterOptions, Data, SHHFilterMessage } from './Schema'
import { future, IFuture } from './utils/future'

function safeAsync(fn: () => Promise<any>) {
  return function() {
    // tslint:disable-next-line:no-console
    fn().catch($ => console.error($))
  }
}

/**
 * Converts a given topic to a hex string, but also allows null values.
 *
 * @param value - The given value
 */
function toTopic(value: any): string {
  if (value === null || typeof value === 'undefined') return null

  const strValue = String(value).toString()

  if (strValue.indexOf('0x') === 0) return strValue
  else return utils.fromUtf8(strValue)
}

export type FilterCallback = (messages: FilterChange[] | string[]) => void

export abstract class AbstractFilter<T> {
  public isStarted = false
  public isDisposed = false

  public formatter: (x) => T

  protected filterId: IFuture<Data> = future()
  protected callbacks: ((message: T) => void)[] = []
  protected stopSemaphore = future()

  constructor(public requestManager: RequestManager) {
    // stub
  }

  async watch(callback: (message: T) => void) {
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

  protected abstract async getNewFilter(): Promise<Data>
  protected abstract async getChanges(): Promise<any>
  protected abstract async uninstall(): Promise<any>

  /**
   * Adds the callback and sets up the methods, to iterate over the results.
   */
  private async poll() {
    if (this.isStarted) {
      if (this.callbacks.length) {
        const result: any[] = await this.getChanges()

        this.callbacks.forEach(cb => {
          if (this.formatter) {
            result.forEach($ => {
              cb(this.formatter($))
            })
          } else {
            result.forEach($ => cb($))
          }
        })
      }

      this.stopSemaphore.resolve(1)

      if (this.isStarted) {
        this.stopSemaphore = future()
        setTimeout(safeAsync(() => this.poll()), config.ETH_POLLING_TIMEOUT)
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
    this.options.topics = this.options.topics.map(function(topic) {
      return toTopic(topic)
    })

    this.options = {
      topics: this.options.topics,
      to: this.options.to
    }
  }

  async getMessages(): Promise<any> {
    const filterId = await this.filterId
    return this.requestManager.shh_getMessages(filterId)
  }

  protected async getNewFilter(): Promise<string> {
    return this.requestManager.shh_newFilter(this.options)
  }

  protected async getChanges(): Promise<any> {
    const filterId = await this.filterId
    return this.requestManager.shh_getFilterChanges(filterId)
  }

  protected async uninstall(): Promise<any> {
    const filterId = await this.filterId
    return this.requestManager.shh_uninstallFilter(filterId)
  }
}

export class EthFilter<T = FilterChange | string> extends AbstractFilter<T> {
  constructor(
    public requestManager: RequestManager,
    public options: FilterOptions,
    public formatter: (message: FilterChange | string) => T = x => x as any
  ) {
    super(requestManager)
    this.options = this.options || {}
    this.options.topics = this.options.topics || []
    this.options.topics = this.options.topics.map(function(topic) {
      return toTopic(topic)
    })

    this.options = {
      topics: this.options.topics,
      address: this.options.address ? this.options.address : undefined,
      fromBlock:
        typeof this.options.fromBlock === 'number' || typeof this.options.fromBlock === 'string'
          ? formatters.inputBlockNumberFormatter(this.options.fromBlock)
          : 'latest',
      toBlock:
        typeof this.options.toBlock === 'number' || typeof this.options.toBlock === 'string'
          ? formatters.inputBlockNumberFormatter(this.options.toBlock)
          : 'latest'
    }
  }

  async getLogs() {
    if (!this.isStarted) {
      await this.start()
    }
    const filterId = await this.filterId

    return this.requestManager.eth_getFilterLogs(filterId)
  }

  protected async getNewFilter(): Promise<any> {
    return this.requestManager.eth_newFilter(this.options)
  }

  protected async getChanges(): Promise<any> {
    const filterId = await this.filterId
    return this.requestManager.eth_getFilterChanges(filterId)
  }

  protected async uninstall(): Promise<any> {
    const filterId = await this.filterId
    return this.requestManager.eth_uninstallFilter(filterId)
  }
}

export class EthPendingTransactionFilter extends EthFilter<TxHash> {
  constructor(requestManager: RequestManager) {
    super(requestManager, null, arg => arg as TxHash)
  }
  async getNewFilter() {
    return this.requestManager.eth_newPendingTransactionFilter()
  }
}

export class EthBlockFilter extends EthFilter<TxHash> {
  constructor(requestManager: RequestManager) {
    super(requestManager, null, arg => arg as TxHash)
  }

  async getNewFilter() {
    return this.requestManager.eth_newBlockFilter()
  }
}
