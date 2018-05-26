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
import { Contract } from './Contract'

export interface IPropertyOptions {
  name: string
  getter: string
  setter?: string
  inputFormatter?: Function
  outputFormatter?: Function
}

export class Property {
  name: string
  getter: string
  setter: string
  outputFormatter: Function | null
  inputFormatter: Function | null
  requestManager: RequestManager

  constructor(options: IPropertyOptions) {
    this.name = options.name
    this.getter = options.getter
    this.setter = options.setter
    this.outputFormatter = options.outputFormatter || null
    this.inputFormatter = options.inputFormatter || null
    this.requestManager = null
  }

  setRequestManager(rm: RequestManager) {
    this.requestManager = rm
  }

  /**
   * Should be called to format input args of method
   *
   * @method formatInput
   * @param {Array}
   * @return {Array}
   */
  formatInput(arg: any) {
    return this.inputFormatter ? this.inputFormatter(arg) : arg
  }

  /**
   * Should be called to format output(result) of method
   *
   * @method formatOutput
   * @param {object}
   * @return {object}
   */
  formatOutput(result: any) {
    return this.outputFormatter && result !== null && result !== undefined ? this.outputFormatter(result) : result
  }

  /**
   * Should attach function to method
   *
   * @method attachToObject
   * @param {object}
   * @param {Function}
   */
  attachToObject(obj: Contract) {
    const property = this
    let proto = {
      get: function() {
        const requestManager = this.requestManager || property.requestManager

        if (!requestManager) {
          throw new Error(`Cannot read property ${property.name} because there is no requestManager`)
        }

        return property.execute(requestManager)
      },
      enumerable: true
    }

    let names = this.name.split('.')
    let name = names[0]

    if (names.length > 1) {
      obj[names[0]] = obj[names[0]] || {}
      name = names[1]

      if (name in obj[name[0]]) throw new Error(`Cannot override property ${name[0]}.${name}`)

      Object.defineProperty(obj[names[0]], name, proto)
    } else {
      if (name in obj) throw new Error(`Cannot override property ${name}`)

      Object.defineProperty(obj, name, proto)
    }
  }

  async execute(requestManager: RequestManager) {
    const result = await requestManager.sendAsync({
      method: this.getter,
      params: []
    })
    return this.formatOutput(result)
  }
}
