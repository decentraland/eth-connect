import { RequestManager } from './RequestManager'
import utils = require('./utils/utils')
import config = require('./utils/config')
import errors = require('./utils/errors')
import { toBatchPayload, isValidResponse } from './utils/jsonrpc'
import { future } from './utils/future'

export type PollData = {
  data: any
  id: string
  callback: (err, data) => void
  uninstall: Function
}

export class Poller {
  polls: { [key: string]: PollData } = {}
  timeout: any = null

  constructor(public requestManager: RequestManager) {
    // stub
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
  startPolling(data, pollId: string, callback: (err, data) => void, uninstall: Function) {
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
  reset(keepIsSyncing = false) {
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
    this.timeout = setTimeout(this.poll.bind(this), config.ETH_POLLING_TIMEOUT)

    if (Object.keys(this.polls).length === 0) {
      return
    }

    if (!this.requestManager.provider) {
      // tslint:disable-next-line:no-console
      console.error(errors.InvalidProvider())
      return
    }

    let pollsData: PollData[] = []

    for (let key in this.polls) {
      pollsData.push(this.polls[key])
    }

    if (pollsData.length === 0) {
      return
    }

    let payload = toBatchPayload(pollsData.map($ => $.data))

    // map the request id to they poll id

    payload.forEach((payload, ix) => {
      const defer = future()

      defer
        .then(r => {
          pollsData[ix].callback(null, r)
        })
        .catch(e => {
          pollsData[ix].callback(e, void 0)
        })

      defer.finally(() => this.requestManager.requests.delete(payload.id))

      this.requestManager.requests.set(payload.id, defer)
    })

    this.requestManager.provider.sendAsync(payload, (error, results) => {
      if (error) {
        // tslint:disable-next-line:no-console
        console.error(error)
        return
      }

      if (!utils.isArray(results)) {
        const error = errors.InvalidResponse(results)
        // tslint:disable-next-line:no-console
        console.error(error)
        throw error
      }

      results.forEach(result => {
        const valid = isValidResponse(result)
        const defer = this.requestManager.requests.get(result.id)

        if (!valid) {
          defer.reject(errors.InvalidResponse(result))
        } else {
          defer.resolve(result.result)
        }
      })
    })
  }
}
