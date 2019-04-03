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

import * as utils from './utils/utils'
import { coder } from './solidity/coder'
import { RequestManager } from './RequestManager'
import { Contract } from './Contract'
import { future } from 'fp-future'
import { TransactionOptions, TxHash, Data } from './Schema'

/**
 * Should be called to check if the contract gets properly deployed on the blockchain.
 * @param requestManager - The reference to a RequestManager instance
 */
async function checkForContractAddress(requestManager: RequestManager, txId: TxHash): Promise<string> {
  const receiptFuture = future()

  let count = 0

  const fetcher = () => {
    count++
    // stop watching after 50 blocks (timeout)
    if (count > 50) {
      receiptFuture.reject(new Error("Contract transaction couldn't be found after 50 blocks"))
    } else {
      requestManager.eth_getTransactionReceipt(txId).then(
        receipt => {
          if (receipt && receipt.blockHash) {
            receiptFuture.resolve(receipt)
          } else {
            setTimeout(fetcher, 1000)
          }
        },
        /* istanbul ignore next */
        error => receiptFuture.reject(error)
      )
    }
  }

  fetcher()

  const receipt = await receiptFuture
  const code = await requestManager.eth_getCode(receipt.contractAddress, 'latest')

  if (code && code.length > 3) {
    return receipt.contractAddress
  }

  /* istanbul ignore next */
  throw Object.assign(new Error("The contract code couldn't be stored, please check your gas amount."), {
    response: code,
    receipt
  })
}

/**
 * Should be called to encode constructor params
 * @param abi - The given contract ABI
 */
function encodeConstructorParams(abi: any[], params: any[]) {
  return (
    abi
      .filter(function(json) {
        return json.type === 'constructor' && json.inputs.length === params.length
      })
      .map(function(json) {
        return json.inputs.map(function(input: any) {
          return input.type
        })
      })
      .map(function(types) {
        return coder.encodeParams(types, params)
      })[0] || ''
  )
}

/**
 * @public
 * Should be called to create new ContractFactory instance
 */
export class ContractFactory {
  constructor(public requestManager: RequestManager, public abi: any[]) {}
  /**
   * Should be called to create new contract on a blockchain
   */
  async deploy(param1: any, param2: any, options: TransactionOptions): Promise<Contract>
  async deploy(param1: any, options: TransactionOptions): Promise<Contract>
  async deploy(options: TransactionOptions): Promise<Contract>
  async deploy(...args: any[]) {
    // parse arguments
    let options: TransactionOptions | void

    let last = args[args.length - 1]

    if (utils.isObject(last) && !utils.isArray(last)) {
      options = args.pop()
    }

    /* istanbul ignore if */
    if (!options) {
      throw new Error('Missing options object')
    }

    /* istanbul ignore if */
    if (!options.data || typeof options.data !== 'string') {
      throw new Error('Invalid options.data')
    }

    if (options.value && options.value > 0) {
      let constructorAbi =
        this.abi.filter(function(json) {
          return json.type === 'constructor' && json.inputs.length === args.length
        })[0] || {}

      /* istanbul ignore if */
      if (!constructorAbi.payable) {
        throw new Error('Cannot send value to non-payable constructor')
      }
    }

    let bytes = encodeConstructorParams(this.abi, args)
    options.data += bytes

    if (!options.gas) {
      const estimatedGas = await this.requestManager.eth_estimateGas(options)
      if (estimatedGas) options.gas = estimatedGas
    }

    // wait for the contract address and check if the code was deployed
    const hash = await this.requestManager.eth_sendTransaction(options)

    if (!hash) throw new Error('Error while sending contract creation transaction. A TxHash was not retrieved')

    const address = await checkForContractAddress(this.requestManager, hash)
    const contract = await this.at(address)
    contract.transactionHash = hash

    return contract
  }

  /**
   * Should be called to get access to existing contract on a blockchain
   *
   * @param address - The contract address
   */
  async at(address: string): Promise<Contract> {
    if (!utils.isAddress(address)) {
      throw new TypeError(`Invalid address ${JSON.stringify(address)}`)
    }
    return new Contract(this.requestManager, this.abi, address)
  }

  /**
   * Gets the data, which is data to deploy plus constructor params
   */
  async getData(...args: any[]): Promise<Data> {
    let options: { data?: string } | void

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

    options.data = options.data + bytes

    return options.data
  }
}
