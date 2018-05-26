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
/**
 * @file event.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @date 2014
 */

import utils = require('./utils/utils')
import formatters = require('./utils/formatters')

import { coder } from './solidity/coder'
import { RequestManager } from './RequestManager'
import { Contract } from './Contract'
import { EthFilter } from './Filter'

/**
 * This prototype should be used to create event filters
 */
export class SolidityEvent {
  _anonymous: boolean = false
  _name: string
  _params: any[]

  constructor(
    public requestManager: RequestManager,
    json: { inputs: any[]; anonymous; name: string },
    public address: string
  ) {
    this._params = json.inputs
    this._name = utils.transformToFullName(json)
    this._anonymous = json.anonymous
  }

  /**
   * Should be used to get filtered param types
   *
   * @method types
   * @param {Bool} decide if returned typed should be indexed
   * @return {Array} array of types
   */
  types(indexed) {
    return this._params
      .filter(function(i) {
        return i.indexed === indexed
      })
      .map(function(i) {
        return i.type
      })
  }

  /**
   * Should be used to get event display name
   *
   * @method displayName
   * @return {string} event display name
   */
  displayName() {
    return utils.extractDisplayName(this._name)
  }

  /**
   * Should be used to get event type name
   *
   * @method typeName
   * @return {string} event type name
   */
  typeName() {
    return utils.extractTypeName(this._name)
  }

  /**
   * Should be used to get event signature
   *
   * @method signature
   * @return {string} event signature
   */
  signature() {
    return utils.sha3(this._name)
  }

  /**
   * Should be used to encode indexed params and options to one final object
   *
   * @method encode
   * @param {object} indexed
   * @param {object} options
   * @return {object} everything combined together and encoded
   */
  encode(indexed = {}, options = {}) {
    let result = {
      topics: [],
      address: this.address
    }
    ;['fromBlock', 'toBlock']
      .filter(function(f) {
        return options[f] !== undefined
      })
      .forEach(function(f) {
        result[f] = formatters.inputBlockNumberFormatter(options[f])
      })

    if (!this._anonymous) {
      result.topics.push('0x' + this.signature())
    }

    let indexedTopics = this._params
      .filter(function(i) {
        return i.indexed === true
      })
      .map(function(i) {
        let value = indexed[i.name]
        if (value === undefined || value === null) {
          return null
        }

        if (utils.isArray(value)) {
          return value.map(function(v) {
            return '0x' + coder.encodeParam(i.type, v)
          })
        }
        return '0x' + coder.encodeParam(i.type, value)
      })

    result.topics = result.topics.concat(indexedTopics)

    return result
  }

  /**
   * Should be used to decode indexed params and options
   *
   * @method decode
   * @param {object} data
   * @return {object} result object with decoded indexed && not indexed params
   */
  decode(data: { data: string; topics?: string[]; address: string }) {
    data.data = data.data || ''
    data.topics = data.topics || []

    let argTopics = this._anonymous ? data.topics : data.topics.slice(1)
    let indexedData = argTopics
      .map(function(topics) {
        return topics.slice(2)
      })
      .join('')
    let indexedParams = coder.decodeParams(this.types(true), indexedData)

    let notIndexedData = data.data.slice(2)
    let notIndexedParams = coder.decodeParams(this.types(false), notIndexedData)

    let result = formatters.outputLogFormatter(data)
    result.event = this.displayName()
    result.address = data.address

    result.args = this._params.reduce(function(acc, current) {
      acc[current.name] = current.indexed ? indexedParams.shift() : notIndexedParams.shift()
      return acc
    }, {})

    delete result.data
    delete result.topics

    return result
  }

  /**
   * Should be used to create new filter object from event
   *
   * @method execute
   * @param {object} indexed
   * @param {object} options
   * @return {object} filter object
   */
  async execute(indexed, options) {
    let o = this.encode(indexed, options)
    let formatter = this.decode.bind(this)
    return new EthFilter(this.requestManager, o, formatter)
  }

  /**
   * Should be used to attach event to contract object
   *
   * @method attachToContract
   * @param {Contract}
   */
  attachToContract(contract: Contract) {
    let execute = this.execute.bind(this)
    let displayName = this.displayName()
    if (!contract.events[displayName]) {
      contract.events[displayName] = execute
    }
    contract.events[displayName][this.typeName()] = this.execute.bind(this, contract)
  }
}
