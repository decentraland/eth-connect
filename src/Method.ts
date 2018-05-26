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

import errors = require('./utils/errors')
import { RequestManager } from './RequestManager'

export class Method {
  name: string
  callName: string | ((args) => string)
  params: number
  inputFormatter: Function[] | null
  outputFormatter?: Function | null
  requestManager: RequestManager

  constructor(options: {
    name: string
    callName: string | ((args) => string)
    params: number
    inputFormatter?: any[]
    outputFormatter?: any
  }) {
    this.name = options.name
    this.callName = options.callName
    this.params = options.params || 0
    this.inputFormatter = options.inputFormatter || null
    this.outputFormatter = options.outputFormatter || null
    this.requestManager = null
  }

  setRequestManager(rm: RequestManager) {
    this.requestManager = rm
  }

  /**
   * Should be used to determine name of the jsonrpc method based on arguments
   *
   * @method getCall
   * @param {Array} arguments
   * @return {string} name of jsonrpc method
   */
  getCall(args: any[]) {
    return typeof this.callName === 'function' ? this.callName(args) : this.callName
  }

  /**
   * Should be called to check if the number of arguments is correct
   *
   * @method validateArgs
   * @param {Array} arguments
   * @throws {Error} if it is not
   */
  validateArgs(args: any[]) {
    if (args.length !== this.params) {
      throw errors.InvalidNumberOfRPCParams(this.name, args.length, this.params)
    }
  }

  /**
   * Should be called to format input args of method
   *
   * @method formatInput
   * @param {Array}
   * @return {Array}
   */
  formatInput(args: any[]) {
    if (!this.inputFormatter) {
      return args
    }

    return this.inputFormatter.map(function(formatter, index) {
      return formatter ? formatter(args[index]) : args[index]
    })
  }

  /**
   * Should be called to format output(result) of method
   *
   * @method formatOutput
   * @param {object}
   * @return {object}
   */
  formatOutput(result) {
    return this.outputFormatter && result ? this.outputFormatter(result) : result
  }

  /**
   * Should create payload from given input args
   *
   * @method toPayload
   * @param {Array} args
   * @return {object}
   */
  toPayload(args: any[]) {
    let call = this.getCall(args)
    let params = this.formatInput(args)

    this.validateArgs(params)

    return {
      method: call,
      params: params
    }
  }

  attachToObject(obj: object) {
    let func = (...args) => this.execute(this.requestManager, ...args)
    Object.defineProperty(func, 'name', { value: this.callName })

    let name = this.name.split('.')
    if (name.length > 1) {
      obj[name[0]] = obj[name[0]] || {}

      if (name[1] in obj[name[0]]) throw new Error(`Cannot override property ${name[0]}.${name[1]}`)

      obj[name[0]][name[1]] = func
    } else {
      if (name[0] in obj) throw new Error(`Cannot override property ${name[0]}`)
      obj[name[0]] = func
    }
  }

  async execute(requestManager: RequestManager, ...args: any[]) {
    let payload = this.toPayload(args)
    if (!requestManager) throw new Error('Missing RequestManager in method#exec')
    const result = await requestManager.sendAsync(payload)
    return this.formatOutput(result)
  }
}
