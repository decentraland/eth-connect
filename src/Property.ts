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

import { RequestManager } from './RequestManager'

export interface IPropertyOptions<V> {
  getter: string
  outputFormatter: (_: any) => V
}

/**
 * @public
 */
export class Property<V> {
  getter: string
  outputFormatter: Function | null

  constructor(options: IPropertyOptions<V>) {
    this.getter = options.getter
    this.outputFormatter = options.outputFormatter
  }

  /**
   * Should be called to format output(result) of method
   *
   * @param result - The result to be formatted
   */
  formatOutput(result: any) {
    return this.outputFormatter(result)
  }

  async execute(requestManager: RequestManager) {
    const result = await requestManager.sendAsync({
      method: this.getter,
      params: []
    })
    return this.formatOutput(result)
  }
}
