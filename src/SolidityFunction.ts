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

import utils = require('./utils/utils')
import errors = require('./utils/errors')
import formatters = require('./utils/formatters')

import { coder } from './solidity/coder'
import { RequestManager } from './RequestManager'

/**
 * This prototype should be used to call/sendTransaction to solidity functions
 */
export class SolidityFunction {
  _address: string
  _inputTypes: string[]
  _outputTypes: string[]
  _constant: boolean
  _name: string
  _payable: boolean

  needsToBeTransaction: boolean

  constructor(public requestManager: RequestManager, public json, address: string) {
    this._inputTypes = json.inputs.map(function(i) {
      return i.type
    })
    this._outputTypes = json.outputs.map(function(i) {
      return i.type
    })

    this._constant = json.constant
    this._payable = json.payable

    this.needsToBeTransaction =
      ('payable' in json && json.payable) ||
      ('constant' in json && !json.constant) ||
      ('stateMutability' in json && json.stateMutability === 'nonpayable')

    this._name = utils.transformToFullName(json)
    this._address = address
  }

  extractDefaultBlock(args: any[]) {
    if (args.length > this._inputTypes.length && !utils.isObject(args[args.length - 1])) {
      return formatters.inputDefaultBlockNumberFormatter(args.pop()) // modify the args array!
    }
  }

  /**
   * Should be called to check if the number of arguments is correct
   *
   * @method validateArgs
   * @param {Array} arguments
   * @throws {Error} if it is not
   */
  validateArgs(args) {
    let inputArgs = args.filter(function(a) {
      // filter the options object but not arguments that are arrays
      return !(utils.isObject(a) === true && utils.isArray(a) === false && utils.isBigNumber(a) === false)
    })
    if (inputArgs.length !== this._inputTypes.length) {
      throw errors.InvalidNumberOfSolidityArgs(inputArgs.length, this._inputTypes.length)
    }
  }

  /**
   * Should be used to create payload from arguments
   *
   * @method toPayload
   * @param {Array} solidity function params
   * @param {object} optional payload options
   */
  toPayload(args: any[]) {
    let options = {
      to: undefined,
      data: undefined,
      value: undefined,
      from: undefined
    }

    if (args.length > this._inputTypes.length && utils.isObject(args[args.length - 1])) {
      options = args[args.length - 1]
    }

    this.validateArgs(args)

    options.to = this._address
    options.data = '0x' + this.signature() + coder.encodeParams(this._inputTypes, args)
    return options
  }

  /**
   * Should be used to get function signature
   *
   * @method signature
   * @return {string} function signature
   */
  signature(): string {
    return utils.sha3(this._name).slice(0, 8)
  }

  unpackOutput(output: string) {
    if (!output) {
      return
    }

    const encodedOutput = output.length >= 2 ? output.slice(2) : output
    let result = coder.decodeParams(this._outputTypes, encodedOutput)
    return result.length === 1 ? result[0] : result
  }

  /**
   * Calls a contract function or to sendTransaction to solidity function
   *
   * @method call
   * @param {...Object} Contract function arguments
   * @return {string} output bytes
   */
  async execute(requestManager: RequestManager, ...args) {
    if (!requestManager) {
      throw new Error(`Cannot call function ${this.displayName()} because there is no requestManager`)
    }

    if (this.needsToBeTransaction) {
      let payload = this.toPayload(args)
      if (payload.value > 0 && !this._payable) {
        throw new Error('Cannot send value to non-payable function')
      }
      if (!payload.from) {
        throw new Error('Missing "from" in transaction options')
      }
      let output = await requestManager.eth_sendTransaction(payload)
      return this.unpackOutput(output)
    } else {
      let defaultBlock = this.extractDefaultBlock(args)
      let payload = this.toPayload(args)
      let output = await requestManager.eth_call(payload, defaultBlock)
      return this.unpackOutput(output)
    }
  }

  /**
   * Should be used to estimateGas of solidity function
   *
   * @method estimateGas
   */
  estimateGas(...args) {
    let payload = this.toPayload(args)

    return this.requestManager.eth_estimateGas(payload)
  }

  /**
   * Return the encoded data of the call
   *
   * @method getData
   * @return {string} the encoded data
   */
  getData(...args) {
    let payload = this.toPayload(args)

    return payload.data
  }

  /**
   * Should be used to get function display name
   *
   * @method displayName
   * @return {string} display name of the function
   */
  displayName(): string {
    return utils.extractDisplayName(this._name)
  }

  /**
   * Should be used to get function type name
   *
   * @method typeName
   * @return {string} type name of the function
   */
  typeName(): string {
    return utils.extractTypeName(this._name)
  }

  /**
   * Should be called to attach function to contract
   *
   * @method attachToContract
   * @param {Contract}
   */
  attachToContract(contract) {
    let displayName = this.displayName()
    const fun = this

    contract[displayName] = function(...args) {
      const requestManager = this.requestManager || fun.requestManager

      return fun.execute(requestManager, ...args)
    }

    contract[displayName].estimateGas = this.estimateGas.bind(this)
  }
}
