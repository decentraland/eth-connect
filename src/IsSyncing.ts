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
/** @file syncing.js
 * @authors:
 *   Fabian Vogelsteller <fabian@ethdev.com>
 * @date 2015
 */

import formatters = require('./utils/formatters')
import utils = require('./utils/utils')
import { RequestManager } from './RequestManager'

let count = 1

export class IsSyncing {
  pollId: string
  callbacks: Function[]
  lastSyncState: boolean

  constructor(public requestManager: RequestManager, callback) {
    this.requestManager = requestManager
    this.pollId = 'syncPoll_' + count++
    this.callbacks = []
    this.addCallback(callback)
    this.lastSyncState = false

    this.pollSyncing()
  }

  addCallback(callback) {
    if (callback) this.callbacks.push(callback)
    return this
  }

  stopWatching() {
    this.requestManager.stopPolling(this.pollId)
    this.callbacks = []
  }
  /**
   * Adds the callback and sets up the methods, to iterate over the results.
   *
   * @method pollSyncing
   * @param {object} self
   */
  private pollSyncing() {
    let onMessage = function(error, _sync) {
      if (error) {
        return this.callbacks.forEach(function(callback) {
          callback(error)
        })
      }

      let sync = _sync

      if (utils.isObject(sync) && sync.startingBlock) {
        sync = formatters.outputSyncingFormatter(sync)
      }

      this.callbacks.forEach(function(callback) {
        if (this.lastSyncState !== sync) {
          // call the callback with true first so the app can stop anything, before receiving the sync data
          if (!this.lastSyncState && utils.isObject(sync)) callback(null, true)

          // call on the next CPU cycle, so the actions of the sync stop can be processes first
          setTimeout(function() {
            callback(null, sync)
          }, 0)

          this.lastSyncState = sync
        }
      })
    }

    this.requestManager.startPolling(
      {
        method: 'eth_syncing',
        params: []
      },
      this.pollId,
      onMessage,
      this.stopWatching.bind(this)
    )
  }
}
