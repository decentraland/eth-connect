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

import jsonRpc = require('./utils/jsonrpc')
import utils = require('./utils/utils')
import config = require('./utils/config')
import errors = require('./utils/errors')

/**
 * It's responsible for passing messages to providers
 * It's also responsible for polling the ethereum node for incoming messages
 * Default poll timeout is 1 second
 * Singleton
 */
export class RequestManager {
  provider: any
  polls: any = {}
  timeout: any = null

  constructor(provider) {
    this.provider = provider
    this.polls = {}
    this.timeout = null
  }

  /**
   * Should be used to asynchronously send request
   *
   * @method sendAsync
   * @param {object} data
   * @param {Function} callback
   */
  async sendAsync(data: { method: string; params: any[] }) {
    if (!this.provider) {
      throw errors.InvalidProvider()
    }

    let payload = jsonRpc.toPayload(data.method, data.params)

    return new Promise<any>((resolve, reject) => {
      this.provider.sendAsync(payload, function(err, result) {
        if (err) {
          return reject(err)
        }

        if (!jsonRpc.isValidResponse(result)) {
          return reject(errors.InvalidResponse(result))
        }

        resolve(result.result)
      })
    })
  }

  /**
   * Should be called to asynchronously send batch request
   *
   * @method sendBatch
   * @param {Array} batch data
   * @param {Function} callback
   */
  async sendBatch(data: any[]) {
    if (!this.provider) {
      throw errors.InvalidProvider()
    }

    let payload = jsonRpc.toBatchPayload(data)

    return new Promise<any>((resolve, reject) => {
      this.provider.sendAsync(payload, function(err, result) {
        if (err) {
          return reject(err)
        }

        if (!jsonRpc.isValidResponse(result)) {
          return reject(errors.InvalidResponse(result))
        }

        resolve(result.result)
      })
    })
  }

  /**
   * Should be used to set provider of request manager
   *
   * @method setProvider
   * @param {object}
   */
  setProvider(p) {
    this.provider = p
  }

  /**
   * Should be used to start polling
   *
   * @method startPolling
   * @param {object} data
   * @param {number} pollId
   * @param {Function} callback
   * @param {Function} uninstall
   *
   * @todo cleanup number of params
   */
  startPolling(data, pollId: string, callback, uninstall) {
    this.polls[pollId] = {
      data: data,
      id: pollId,
      callback: callback,
      uninstall: uninstall
    }

    // start polling
    if (!this.timeout) {
      this.poll()
    }
  }

  /**
   * Should be used to stop polling for filter with given id
   *
   * @method stopPolling
   * @param {number} pollId
   */
  stopPolling(pollId: string | number) {
    delete this.polls[pollId]

    // stop polling
    if (Object.keys(this.polls).length === 0 && this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
  }

  /**
   * Should be called to reset the polling mechanism of the request manager
   *
   * @method reset
   */
  reset(keepIsSyncing) {
    /*jshint maxcomplexity:5 */

    for (let key in this.polls) {
      // remove all polls, except sync polls,
      // they need to be removed manually by calling syncing.stopWatching()
      if (!keepIsSyncing || key.indexOf('syncPoll_') === -1) {
        this.polls[key].uninstall()
        delete this.polls[key]
      }
    }

    // stop polling
    if (Object.keys(this.polls).length === 0 && this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
  }

  /**
   * Should be called to poll for changes on filter with given id
   *
   * @method poll
   */
  poll() {
    /*jshint maxcomplexity: 6 */
    this.timeout = setTimeout(this.poll.bind(this), config.ETH_POLLING_TIMEOUT)

    if (Object.keys(this.polls).length === 0) {
      return
    }

    if (!this.provider) {
      // tslint:disable-next-line:no-console
      console.error(errors.InvalidProvider())
      return
    }

    let pollsData = []
    let pollsIds = []
    for (let key in this.polls) {
      pollsData.push(this.polls[key].data)
      pollsIds.push(key)
    }

    if (pollsData.length === 0) {
      return
    }

    let payload = jsonRpc.toBatchPayload(pollsData)

    // map the request id to they poll id
    let pollsIdMap = {}
    payload.forEach(function(load, index) {
      pollsIdMap[load.id] = pollsIds[index]
    })

    let self = this
    this.provider.sendAsync(payload, function(error, results) {
      // TODO: console log?
      if (error) {
        return
      }

      if (!utils.isArray(results)) {
        throw errors.InvalidResponse(results)
      }
      results
        .map(function(result) {
          let id = pollsIdMap[result.id]

          // make sure the filter is still installed after arrival of the request
          if (self.polls[id]) {
            result.callback = self.polls[id].callback
            return result
          } else return false
        })
        .filter(function(result) {
          return !!result
        })
        .filter(function(result) {
          let valid = jsonRpc.isValidResponse(result)
          if (!valid) {
            result.callback(errors.InvalidResponse(result))
          }
          return valid
        })
        .forEach(function(result) {
          result.callback(null, result.result)
        })
    })
  }
}
