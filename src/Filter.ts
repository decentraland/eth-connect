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

import formatters = require('./utils/formatters')
import utils = require('./utils/utils')
import { RequestManager } from './RequestManager'
import config = require('./utils/config')
import { Quantity, FilterOptions, FilterChange, TxHash, SHHFilterOptions, SHHFilterMessage } from './Schema'
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
 * @param {Mixed} value
 * @return {string}
 */
function toTopic(value: any) {
  if (value === null || typeof value === 'undefined') return null

  const strValue = String(value).toString()

  if (strValue.indexOf('0x') === 0) return strValue
  else return utils.fromUtf8(strValue)
}

export type FilterCallback = (messages: FilterChange[] | string[]) => void

export class SHHFilter {
  public isStarted = false

  private timeout: any
  private filterId: IFuture<Quantity> = future()
  private callbacks: ((message: SHHFilterMessage) => void)[] = []
  private stopSemaphore: IFuture<any>

  constructor(public requestManager: RequestManager, public options: SHHFilterOptions) {
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

  async start() {
    if (this.isStarted) return
    this.isStarted = true

    try {
      const id: any = await this.requestManager.shh_newFilter(this.options)

      if (!id) {
        throw new Error('Could not create a filter, response: ' + JSON.stringify(id))
      }

      this.filterId.resolve(id)
    } catch (e) {
      this.isStarted = false
      throw e
    }

    await this.poll()
  }

  async watch(callback: (message: SHHFilterMessage) => void) {
    if (callback) {
      this.callbacks.push(callback)
      if (!this.isStarted) {
        await this.start()
      }
    }
  }

  async stop() {
    const filterId = await this.filterId
    if (!this.stopSemaphore || (!this.stopSemaphore.isPending && this.timeout)) {
      this.stopSemaphore = future()
    }

    await this.requestManager.shh_uninstallFilter(filterId)
    this.isStarted = false

    if (this.timeout) {
      await this.stopSemaphore
      clearTimeout(this.timeout)
    }
  }

  /**
   * Adds the callback and sets up the methods, to iterate over the results.
   *
   * @method pollFilter
   */
  private async poll() {
    const filterId = await this.filterId

    const result: SHHFilterMessage[] = await this.requestManager.shh_getFilterChanges(filterId)

    this.callbacks.forEach(cb => {
      result.forEach($ => cb($))
    })

    if (this.isStarted) {
      this.timeout = setTimeout(safeAsync(() => this.poll()), config.ETH_POLLING_TIMEOUT)
    } else {
      if (this.stopSemaphore && this.stopSemaphore.isPending) {
        this.stopSemaphore.resolve(1)
      }
      this.timeout = null
    }
  }
}

export class EthFilter<T = FilterChange | string> {
  public isStarted = false

  private timeout: any
  private filterId: IFuture<Quantity> = future()
  private callbacks: ((message: T) => void)[] = []

  private stopSemaphore: IFuture<any>

  constructor(
    public requestManager: RequestManager,
    public options: FilterOptions,
    public formatter: (message: FilterChange | string) => T = x => x as any
  ) {
    this.options = this.options || {}
    this.options.topics = this.options.topics || []
    this.options.topics = this.options.topics.map(function(topic) {
      return toTopic(topic)
    })

    this.options = {
      topics: this.options.topics,
      address: this.options.address,
      fromBlock: formatters.inputBlockNumberFormatter(this.options.fromBlock),
      toBlock: formatters.inputBlockNumberFormatter(this.options.toBlock)
    }
  }

  async getNewFilter(): Promise<any> {
    return this.requestManager.eth_newFilter(this.options)
  }

  async start() {
    if (this.isStarted) return
    this.isStarted = true

    try {
      const id = await this.getNewFilter()

      if (!id) {
        throw new Error('Could not create a filter, response: ' + JSON.stringify(id))
      }

      this.filterId.resolve(id)
    } catch (e) {
      this.isStarted = false
      throw e
    }

    await this.poll()
  }

  async watch(callback: (message: T) => void) {
    if (callback) {
      this.callbacks.push(callback)
      if (!this.isStarted) {
        await this.start()
      }
    }
  }

  async stop() {
    const filterId = await this.filterId
    if (!this.stopSemaphore || (!this.stopSemaphore.isPending && this.timeout)) {
      this.stopSemaphore = future()
    }

    await this.requestManager.eth_uninstallFilter(filterId)
    this.isStarted = false

    if (this.timeout) {
      await this.stopSemaphore
      clearTimeout(this.timeout)
    }
  }

  async getLogs() {
    if (!this.isStarted) {
      await this.start()
    }
    const filterId = await this.filterId

    return this.requestManager.eth_getFilterLogs(filterId)
  }

  /**
   * Adds the callback and sets up the methods, to iterate over the results.
   *
   * @method pollFilter
   */
  private async poll() {
    const filterId = await this.filterId

    const result: any[] = await this.requestManager.eth_getFilterChanges(filterId)

    this.callbacks.forEach(cb => {
      if (this.formatter) {
        result.forEach($ => {
          cb(this.formatter($))
        })
      } else {
        result.forEach($ => cb($))
      }
    })

    if (this.isStarted) {
      this.timeout = setTimeout(safeAsync(() => this.poll()), config.ETH_POLLING_TIMEOUT)
    } else {
      if (this.stopSemaphore && this.stopSemaphore.isPending) {
        this.stopSemaphore.resolve(1)
      }
      this.timeout = null
    }
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
