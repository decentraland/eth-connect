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

/**
 * @public
 */
export class Method<V> {
  callName: string
  params: number
  inputFormatter: Function[] | null
  outputFormatter: (something: any) => V
  requestManager: RequestManager

  constructor(options: { callName: string; params: number; inputFormatter?: any[]; outputFormatter: (val: any) => V }) {
    this.callName = options.callName
    this.params = options.params || 0
    this.inputFormatter = options.inputFormatter || null
    this.outputFormatter = options.outputFormatter
    this.requestManager = null
  }

  /**
   * Should be called to check if the number of arguments is correct
   *
   * @param arguments - The list of arguments
   */
  validateArgs(args: any[]) {
    if (args.length !== this.params) {
      throw errors.InvalidNumberOfRPCParams(this.callName, args.length, this.params)
    }
  }

  /**
   * Should be called to format input args of method
   *
   * @param args - The array of arguments
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
   * @param result - The result to be formatted
   */
  formatOutput(result: any): V | null {
    return result !== null ? this.outputFormatter(result) : null
  }

  /**
   * Should create payload from given input args
   *
   * @param args - The given input arguments
   */
  toPayload(args: any[]) {
    let params = this.formatInput(args)

    this.validateArgs(params)

    return {
      method: this.callName,
      params: params
    }
  }

  async execute(requestManager: RequestManager, ...args: any[]) {
    let payload = this.toPayload(args)
    if (!requestManager) throw new Error('Missing RequestManager in method#exec')
    const result = await requestManager.sendAsync(payload)
    return this.formatOutput(result)
  }
}
