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

import * as utils from './utils/utils'
import * as formatters from './utils/formatters'

import { SolidityEvent } from './SolidityEvent'
import { RequestManager } from './RequestManager'
import { Contract } from './Contract'
import { EthFilter } from './Filter'
import { FilterOptions } from './Schema'

export type EventData = {
  data: string
  topics: string[]
  address: string
}

export class AllSolidityEvents {
  constructor(public _requestManager: RequestManager, public _json: any, public _address: string) {}

  encode(options: { fromBlock?: any; toBlock?: any } = {}) {
    let result: {
      address: string
      fromBlock?: any
      toBlock?: any
    } = {
      address: this._address
    }

    if (options.fromBlock !== undefined) result.fromBlock = formatters.inputBlockNumberFormatter(options.fromBlock)
    if (options.toBlock !== undefined) result.toBlock = formatters.inputBlockNumberFormatter(options.toBlock)

    return result
  }

  decode(data: EventData) {
    data.data = data.data || ''

    let eventTopic = utils.isArray(data.topics) && utils.isString(data.topics[0]) ? data.topics[0].slice(2) : ''

    let match = this._json.filter(function(j: any) {
      return eventTopic === utils.sha3(utils.transformToFullName(j))
    })[0]

    if (!match) {
      // cannot find matching event?
      return formatters.outputLogFormatter(data)
    }

    let event = new SolidityEvent(this._requestManager, match, this._address)
    return event.decode(data)
  }

  async execute(options: FilterOptions) {
    let filterOptions = this.encode(options)
    let formatter = this.decode.bind(this)
    return new EthFilter<any>(this._requestManager, filterOptions, formatter)
  }

  attachToContract(contract: Contract) {
    let execute = this.execute.bind(this)
    contract.allEvents = execute
  }
}
