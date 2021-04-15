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

import { AbiCoder } from '../abi/coder'
import { AbiInput, AbiOutput } from '../Schema'
import * as utils from '../utils/utils'
import { bytesToHex } from '../utils/utils'

const ethersAbiCoder = new AbiCoder()

/**
 * SolidityCoder prototype should be used to encode/decode solidity params of any type
 */
export namespace coder {
  /**
   * Should be used to encode list of params
   *
   * @method encodeParams
   * @param {Array} types
   * @param {Array} params
   * @return {string} encoded list of params
   */
  export function encodeParams(types: AbiInput[], params: any[]): string {
    return bytesToHex(ethersAbiCoder.encode(types, params))
  }

  /**
   * Should be used to decode list of params
   *
   * @method decodeParam
   * @param {Array} types
   * @param {string} bytes
   * @return {Array} array of plain params
   */
  export function decodeParams(outputs: AbiOutput[], bytes: string): any {
    if (outputs.length > 0 && (!bytes || bytes === '0x' || bytes === '0X')) {
      throw new Error(
        "Returned values aren't valid, did it run Out of Gas? " +
          'You might also see this error if you are not using the ' +
          'correct ABI for the contract you are retrieving data from, ' +
          'requesting data from a block number that does not exist, ' +
          'or querying a node which is not fully synced.'
      )
    }

    return ethersAbiCoder.decode(outputs, utils.hexToBytes('0x' + bytes.replace(/0x/i, '')))
  }
}
