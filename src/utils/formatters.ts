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

import utils = require('../utils/utils')
import config = require('../utils/config')
import { BigNumber as BigNumberType, BigNumberValueType } from './BigNumber'
import {
  Quantity,
  Tag,
  TransactionReceipt,
  BlockObject,
  Syncing,
  TransactionObject,
  TransactionOptions
} from '../Schema'

/**
 * Should format the output to a big number
 *
 * @param output - The provided output
 */
export function outputBigNumberFormatter(output: BigNumberValueType): BigNumberType {
  return utils.toBigNumber(output)
}

/**
 * Returns true if the provided blockNumber is 'latest', 'pending' or 'earliest
 *
 * @param blockNumber - The given blocknumber
 */
export function isPredefinedBlockNumber(blockNumber: Quantity | Tag): blockNumber is Tag {
  return blockNumber === 'latest' || blockNumber === 'pending' || blockNumber === 'earliest'
}

export function inputDefaultBlockNumberFormatter(blockNumber?: Quantity | Tag): string | Tag {
  if (blockNumber === undefined) {
    return config.defaultBlock
  }
  return inputBlockNumberFormatter(blockNumber) || config.defaultBlock
}

export function inputBlockNumberFormatter(blockNumber: Quantity | Tag): string | null {
  if (blockNumber === undefined || blockNumber == null) {
    return null
  } else if (isPredefinedBlockNumber(blockNumber)) {
    return blockNumber
  }
  return utils.toHex(blockNumber)
}

/**
 * Formats the input of a transaction and converts all values to HEX
 */
export function inputCallFormatter(options: {
  from: string
  to: string
  data: string
  gasPrice?: any
  gas?: any
  value?: any
  nonce?: any
}) {
  options.from = options.from

  if (options.from) {
    options.from = inputAddressFormatter(options.from)
  }

  if (options.to) {
    // it might be contract creation
    options.to = inputAddressFormatter(options.to)
  }

  if ('gasPrice' in options) options.gasPrice = utils.fromDecimal(options.gasPrice)
  if ('gas' in options) options.gas = utils.fromDecimal(options.gas)
  if ('value' in options) options.value = utils.fromDecimal(options.value)
  if ('nonce' in options) options.nonce = utils.fromDecimal(options.nonce)

  if (options.data && !options.data.startsWith('0x') && /^[A-Za-z0-9]+$/.test(options.data)) {
    options.data = '0x' + options.data
  }

  return options
}

/**
 * Formats the input of a transaction and converts all values to HEX
 *
 * @param transaction - options
 */
export function inputTransactionFormatter(options: TransactionOptions) {
  if (typeof options !== 'object') {
    throw new Error('Did not provide transaction options')
  }

  if (!options.from) {
    throw new Error('Missing "from" in transaction options')
  }

  options.from = inputAddressFormatter(options.from)

  if (options.to) {
    // it might be contract creation
    options.to = inputAddressFormatter(options.to)
  }

  if ('gasPrice' in options) options.gasPrice = utils.fromDecimal(options.gasPrice!)
  if ('gas' in options) options.gas = utils.fromDecimal(options.gas!)
  if ('value' in options) options.value = utils.fromDecimal(options.value!)
  if ('nonce' in options) options.nonce = utils.fromDecimal(options.nonce!)

  if (options.data && !options.data.startsWith('0x') && /^[A-Za-z0-9]+$/.test(options.data)) {
    options.data = '0x' + options.data
  }

  return options
}

/**
 * Formats the output of a transaction to its proper values
 *
 * @param tx - The transaction
 */
export function outputTransactionFormatter(tx: TransactionObject): TransactionObject | null {
  if (!tx) return null

  if (tx.blockNumber !== null) {
    tx.blockNumber = utils.toDecimal(tx.blockNumber)
  }
  if (tx.transactionIndex !== null) {
    tx.transactionIndex = utils.toDecimal(tx.transactionIndex)
  }
  tx.nonce = utils.toDecimal(tx.nonce)
  tx.gas = utils.toDecimal(tx.gas)
  tx.gasPrice = utils.toBigNumber(tx.gasPrice)
  tx.value = utils.toBigNumber(tx.value)
  return tx
}

/**
 * Formats the output of a transaction receipt to its proper values
 *
 * @param receipt - The transaction receipt
 */
export function outputTransactionReceiptFormatter(receipt: TransactionReceipt): TransactionReceipt | null {
  if (!receipt) return null

  if (receipt.blockNumber !== null) receipt.blockNumber = utils.toDecimal(receipt.blockNumber)
  if (receipt.transactionIndex !== null) receipt.transactionIndex = utils.toDecimal(receipt.transactionIndex)
  receipt.cumulativeGasUsed = utils.toDecimal(receipt.cumulativeGasUsed)
  receipt.gasUsed = utils.toDecimal(receipt.gasUsed)

  if (utils.isArray(receipt.logs)) {
    receipt.logs = receipt.logs.map(function(log) {
      return outputLogFormatter(log)
    })
  }

  if ('status' in receipt) receipt.status = utils.toDecimal(receipt.status!)

  return receipt
}

/**
 * Formats the output of a block to its proper value
 */
export function outputBlockFormatter(block: BlockObject): BlockObject | null {
  if (!block) return null
  // transform to number
  block.gasLimit = utils.toDecimal(block.gasLimit)
  block.gasUsed = utils.toDecimal(block.gasUsed)
  block.size = utils.toDecimal(block.size)
  block.timestamp = utils.toDecimal(block.timestamp)
  if (block.number !== null) block.number = utils.toDecimal(block.number)

  block.difficulty = utils.toDecimal(block.difficulty)
  block.totalDifficulty = utils.toDecimal(block.totalDifficulty)

  if (utils.isArray(block.transactions)) {
    block.transactions.forEach(function(item: TransactionObject | string) {
      if (!utils.isString(item)) return outputTransactionFormatter(item)
    })
  }

  return block
}

/**
 * Formats the output of a log
 */
export function outputLogFormatter(log: any) {
  if (!log) return null

  if (log.blockNumber) {
    log.blockNumber = utils.toDecimal(log.blockNumber)
  }

  if (log.transactionIndex) {
    log.transactionIndex = utils.toDecimal(log.transactionIndex)
  }

  if (log.logIndex) {
    log.logIndex = utils.toDecimal(log.logIndex)
  }

  return log
}

export function inputAddressFormatter(address: string) {
  if (utils.isStrictAddress(address)) {
    return address
  } else if (utils.isAddress(address)) {
    return '0x' + address
  }
  throw new Error(`Invalid address: ${JSON.stringify(address)}`)
}

export function outputSyncingFormatter(result: false | Syncing) {
  if (!result) {
    return result
  }

  result.startingBlock = utils.toDecimal(result.startingBlock)
  result.currentBlock = utils.toDecimal(result.currentBlock)
  result.highestBlock = utils.toDecimal(result.highestBlock)

  if (result.knownStates) {
    result.knownStates = utils.toDecimal(result.knownStates)
  }
  if (result.pulledStates) {
    result.pulledStates = utils.toDecimal(result.pulledStates)
  }

  return result
}
