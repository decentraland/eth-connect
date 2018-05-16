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

/// This method should be called on options object, to verify deprecated properties && lazy load dynamic ones
/// @param should be string or object
/// @returns options string or object
function getOptions(options, type) {
  if (utils.isString(options)) {
    return options
  }

  switch (type) {
    case 'eth':
      // make sure topics, get converted to hex
      options.topics = options.topics || []
      options.topics = options.topics.map(function(topic) {
        return utils.isArray(topic) ? topic.map(toTopic) : toTopic(topic)
      })

      return {
        topics: options.topics,
        from: options.from,
        to: options.to,
        address: options.address,
        fromBlock: formatters.inputBlockNumberFormatter(options.fromBlock),
        toBlock: formatters.inputBlockNumberFormatter(options.toBlock)
      }
    case 'shh':
      return options
  }
}

/**
 * Adds the callback and sets up the methods, to iterate over the results.
 * @method getLogsAtStart
 * @param {object} self
 * @param {function} callback
 */
function getLogsAtStart(self, callback) {
  // call getFilterLogs for the first watch callback start
  if (!utils.isString(self.options)) {
    self.get(function(err, messages) {
      // don't send all the responses to all the watches again... just to self one
      if (err) {
        callback(err)
      }

      if (utils.isArray(messages)) {
        messages.forEach(function(message) {
          callback(null, message)
        })
      }
    })
  }
}

/**
 * Adds the callback and sets up the methods, to iterate over the results.
 *
 * @method pollFilter
 * @param {object} self
 */
function pollFilter(self) {
  function onMessage(error, messages) {
    if (error) {
      return self.callbacks.forEach(function(callback) {
        callback(error)
      })
    }

    if (utils.isArray(messages)) {
      messages.forEach(function(message) {
        const theMessage = self.formatter ? self.formatter(message) : message
        self.callbacks.forEach(function(callback) {
          callback(null, theMessage)
        })
      })
    }
  }

  self.requestManager.startPolling(
    {
      method: self.implementation.poll.call,
      params: [self.filterId]
    },
    self.filterId,
    onMessage,
    self.stopWatching.bind(self)
  )
}

export class Filter {
  requestManager: RequestManager
  filterId = null
  callbacks = []
  getLogsCallbacks = []
  pollFilters = []
  options
  implementation
  formatter

  constructor(
    options,
    type,
    requestManager: RequestManager,
    methods,
    formatter,
    callback: Function,
    filterCreationErrorCallback?: Function
  ) {
    let implementation = {}

    methods.forEach(function(method) {
      method.setRequestManager(requestManager)
      method.attachToObject(implementation)
    })

    this.requestManager = requestManager
    this.options = getOptions(options, type)
    this.implementation = implementation

    this.formatter = formatter
    this.implementation.newFilter(this.options, (error, id) => {
      if (error) {
        this.callbacks.forEach(function(cb) {
          cb(error)
        })
        if (typeof filterCreationErrorCallback === 'function') {
          filterCreationErrorCallback(error)
        }
      } else {
        this.filterId = id

        // check if there are get pending callbacks as a consequence
        // of calling get() with filterId unassigned.
        this.getLogsCallbacks.forEach(function(cb) {
          this.get(cb)
        })
        this.getLogsCallbacks = []

        // get filter logs for the already existing watch calls
        this.callbacks.forEach(function(cb) {
          getLogsAtStart(this, cb)
        })
        if (this.callbacks.length > 0) pollFilter(this)

        // start to watch immediately
        if (typeof callback === 'function') {
          return this.watch(callback)
        }
      }
    })

    return this
  }

  watch(callback) {
    this.callbacks.push(callback)

    if (this.filterId) {
      getLogsAtStart(this, callback)
      pollFilter(this)
    }

    return this
  }

  stopWatching(callback) {
    this.requestManager.stopPolling(this.filterId)
    this.callbacks = []
    // remove filter async
    if (callback) {
      this.implementation.uninstallFilter(this.filterId, callback)
    } else {
      return this.implementation.uninstallFilter(this.filterId)
    }
  }

  get(callback) {
    let self = this
    if (utils.isFunction(callback)) {
      if (this.filterId === null) {
        // If filterId is not set yet, call it back
        // when newFilter() assigns it.
        this.getLogsCallbacks.push(callback)
      } else {
        this.implementation.getLogs(this.filterId, function(err, res) {
          if (err) {
            callback(err)
          } else {
            callback(
              null,
              res.map(function(log) {
                return self.formatter ? self.formatter(log) : log
              })
            )
          }
        })
      }
    } else {
      if (this.filterId === null) {
        throw new Error(
          "Filter ID Error: filter().get() can't be chained synchronous, please provide a callback for the get() method."
        )
      }
      let logs = this.implementation.getLogs(this.filterId)
      return logs.map(function(log) {
        return self.formatter ? self.formatter(log) : log
      })
    }

    return this
  }
}
