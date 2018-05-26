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
 * @file contract.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @date 2014
 */

import utils = require('./utils/utils')
import { coder } from './solidity/coder'
import { RequestManager } from './RequestManager'
import { Contract } from './Contract'
import { future } from './utils/future'
import { TransactionOptions } from './Schema'
import { EthBlockFilter } from './Filter'

/**
 * Should be called to check if the contract gets properly deployed on the blockchain.
 *
 * @method checkForContractAddress
 * @param {object} contract
 * @param {Function} callback
 * @returns {Undefined}
 */
async function checkForContractAddress(contract: Contract) {
  const receiptFuture = future()
  // TODO fix filter
  const filter = new EthBlockFilter(contract.requestManager)

  await filter.watch(e => {
    let count = 0

    count++

    // stop watching after 50 blocks (timeout)
    if (count > 50) {
      filter
        .stop()
        .then(() => receiptFuture.reject(new Error("Contract transaction couldn't be found after 50 blocks")))
        .catch(receiptFuture.reject)
    } else {
      contract.requestManager.eth_getTransactionReceipt(contract.transactionHash).then(
        receipt => {
          if (receipt && receipt.blockHash) {
            filter
              .stop()
              .then(() => receiptFuture.resolve(receipt))
              .catch(receiptFuture.reject)
          }
        },
        error => {
          filter.stop().then(() => receiptFuture.reject(error), receiptFuture.reject)
        }
      )
    }
  })

  const receipt = await receiptFuture
  const code = await contract.requestManager.eth_getCode(receipt.contractAddress, 'latest')

  if (code.length > 3) {
    contract.address = receipt.contractAddress
    return contract
  }

  throw Object.assign(new Error("The contract code couldn't be stored, please check your gas amount."), {
    response: code,
    receipt
  })
}

/**
 * Should be called to encode constructor params
 *
 * @method encodeConstructorParams
 * @param {Array} abi
 * @param {Array} constructor params
 */
function encodeConstructorParams(abi, params) {
  return (
    abi
      .filter(function(json) {
        return json.type === 'constructor' && json.inputs.length === params.length
      })
      .map(function(json) {
        return json.inputs.map(function(input) {
          return input.type
        })
      })
      .map(function(types) {
        return coder.encodeParams(types, params)
      })[0] || ''
  )
}

/**
 * Should be called to create new ContractFactory instance
 *
 * @method ContractFactory
 * @param {Array} abi
 */
export class ContractFactory {
  constructor(public requestManager: RequestManager, public abi: any[]) {}
  /**
   * Should be called to create new contract on a blockchain
   *
   * @method new
   * @param {Any} contract constructor param1 (optional)
   * @param {Any} contract constructor param2 (optional)
   * @param {object} contract transaction object (required)
   * @param {Function} callback
   * @returns {Contract} returns contract instance
   */
  async deploy(param1, param2, options: TransactionOptions): Promise<Contract>
  async deploy(param1, options: TransactionOptions): Promise<Contract>
  async deploy(options: TransactionOptions): Promise<Contract>
  async deploy(...args) {
    let contract = new Contract(this.requestManager, this.abi, null)

    // parse arguments
    let options: TransactionOptions

    let last = args[args.length - 1]

    if (utils.isObject(last) && !utils.isArray(last)) {
      options = args.pop()
    }

    if (!options) {
      throw new Error('Missing options object')
    }

    if (!options.data || typeof options.data !== 'string') {
      throw new Error('Invalid options.data')
    }

    if (options.value > 0) {
      let constructorAbi =
        this.abi.filter(function(json) {
          return json.type === 'constructor' && json.inputs.length === args.length
        })[0] || {}

      if (!constructorAbi.payable) {
        throw new Error('Cannot send value to non-payable constructor')
      }
    }

    let bytes = encodeConstructorParams(this.abi, args)
    options.data += bytes

    // wait for the contract address and check if the code was deployed
    const hash = await this.requestManager.eth_sendTransaction(options)

    // add the transaction hash
    contract.transactionHash = hash

    await checkForContractAddress(contract)

    return contract
  }

  /**
   * Should be called to get access to existing contract on a blockchain
   *
   * @method at
   * @param {Address} contract address (required)
   * @param {Function} callback {optional)
   * @returns {Contract} returns contract if no callback was passed,
   * otherwise calls callback function (err, contract)
   */
  async at(address: string): Promise<Contract> {
    if (!utils.isAddress(address)) throw new TypeError(`Invalid address ${JSON.stringify(address)}`)
    let contract = new Contract(this.requestManager, this.abi, address)
    return contract
  }

  /**
   * Gets the data, which is data to deploy plus constructor params
   *
   * @method getData
   */
  async getData(...args: any[]) {
    let options = { data: undefined }

    const last = args[args.length - 1]

    if (utils.isObject(last) && !utils.isArray(last)) {
      options = args.pop()
    }

    if (!options) {
      throw new Error('Missing options object')
    }

    if (!options.data || typeof options.data !== 'string') {
      throw new Error('Invalid options.data')
    }

    const bytes = encodeConstructorParams(this.abi, args)

    options.data += bytes

    return options.data
  }
}
