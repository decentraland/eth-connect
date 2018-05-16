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
import formatters = require('../utils/formatters')
import utils = require('../utils/utils')
import { Method } from '../Method'
import { Property } from '../Property'
import watches = require('./watches')
import { Filter } from '../Filter'
import { RequestManager } from '../RequestManager'

let blockCall = function(args) {
  return utils.isString(args[0]) && args[0].indexOf('0x') === 0 ? 'eth_getBlockByHash' : 'eth_getBlockByNumber'
}

let transactionFromBlockCall = function(args) {
  return utils.isString(args[0]) && args[0].indexOf('0x') === 0
    ? 'eth_getTransactionByBlockHashAndIndex'
    : 'eth_getTransactionByBlockNumberAndIndex'
}

let uncleCall = function(args) {
  return utils.isString(args[0]) && args[0].indexOf('0x') === 0
    ? 'eth_getUncleByBlockHashAndIndex'
    : 'eth_getUncleByBlockNumberAndIndex'
}

let getBlockTransactionCountCall = function(args) {
  return utils.isString(args[0]) && args[0].indexOf('0x') === 0
    ? 'eth_getBlockTransactionCountByHash'
    : 'eth_getBlockTransactionCountByNumber'
}

let uncleCountCall = function(args) {
  return utils.isString(args[0]) && args[0].indexOf('0x') === 0
    ? 'eth_getUncleCountByBlockHash'
    : 'eth_getUncleCountByBlockNumber'
}

export namespace eth {
  export function filter(
    requestManager: RequestManager,
    options,
    callback: Function,
    filterCreationErrorCallback?: Function
  ) {
    return new Filter(
      options,
      'eth',
      requestManager,
      watches.eth(),
      formatters.outputLogFormatter,
      callback,
      filterCreationErrorCallback
    )
  }

  export const getBalance = new Method({
    name: 'getBalance',
    call: 'eth_getBalance',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
    outputFormatter: formatters.outputBigNumberFormatter
  })

  export const getStorageAt = new Method({
    name: 'getStorageAt',
    call: 'eth_getStorageAt',
    params: 3,
    inputFormatter: [null, utils.toHex, formatters.inputDefaultBlockNumberFormatter]
  })

  export const getCode = new Method({
    name: 'getCode',
    call: 'eth_getCode',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter]
  })

  export const getBlock = new Method({
    name: 'getBlock',
    call: blockCall,
    params: 2,
    inputFormatter: [
      formatters.inputBlockNumberFormatter,
      function(val) {
        return !!val
      }
    ],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const getUncle = new Method({
    name: 'getUncle',
    call: uncleCall,
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const getCompilers = new Method({
    name: 'getCompilers',
    call: 'eth_getCompilers',
    params: 0,
    inputFormatter: []
  })

  export const getBlockTransactionCount = new Method({
    name: 'getBlockTransactionCount',
    call: getBlockTransactionCountCall,
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const getBlockUncleCount = new Method({
    name: 'getBlockUncleCount',
    call: uncleCountCall,
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const getTransaction = new Method({
    name: 'getTransaction',
    call: 'eth_getTransactionByHash',
    params: 1,
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const getTransactionFromBlock = new Method({
    name: 'getTransactionFromBlock',
    call: transactionFromBlockCall,
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const getTransactionReceipt = new Method({
    name: 'getTransactionReceipt',
    call: 'eth_getTransactionReceipt',
    params: 1,
    outputFormatter: formatters.outputTransactionReceiptFormatter
  })

  export const getTransactionCount = new Method({
    name: 'getTransactionCount',
    call: 'eth_getTransactionCount',
    params: 2,
    inputFormatter: [null, formatters.inputDefaultBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const sendRawTransaction = new Method({
    name: 'sendRawTransaction',
    call: 'eth_sendRawTransaction',
    params: 1,
    inputFormatter: [null]
  })

  export const sendTransaction = new Method({
    name: 'sendTransaction',
    call: 'eth_sendTransaction',
    params: 1,
    inputFormatter: [formatters.inputTransactionFormatter]
  })

  export const signTransaction = new Method({
    name: 'signTransaction',
    call: 'eth_signTransaction',
    params: 1,
    inputFormatter: [formatters.inputTransactionFormatter]
  })

  export const sign = new Method({
    name: 'sign',
    call: 'eth_sign',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, null]
  })

  export const call = new Method({
    name: 'call',
    call: 'eth_call',
    params: 2,
    inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter]
  })

  export const estimateGas = new Method({
    name: 'estimateGas',
    call: 'eth_estimateGas',
    params: 1,
    inputFormatter: [formatters.inputCallFormatter],
    outputFormatter: utils.toDecimal
  })

  export const compileSolidity = new Method({
    name: 'compile.solidity',
    call: 'eth_compileSolidity',
    params: 1
  })

  export const compileLLL = new Method({
    name: 'compile.lll',
    call: 'eth_compileLLL',
    params: 1
  })

  export const compileSerpent = new Method({
    name: 'compile.serpent',
    call: 'eth_compileSerpent',
    params: 1
  })

  export const submitWork = new Method({
    name: 'submitWork',
    call: 'eth_submitWork',
    params: 3
  })

  export const getWork = new Method({
    name: 'getWork',
    call: 'eth_getWork',
    params: 0
  })

  export const coinbase = new Property({
    name: 'coinbase',
    getter: 'eth_coinbase'
  })

  export const mining = new Property({
    name: 'mining',
    getter: 'eth_mining'
  })

  export const hashrate = new Property({
    name: 'hashrate',
    getter: 'eth_hashrate',
    outputFormatter: utils.toDecimal
  })

  export const syncing = new Property({
    name: 'syncing',
    getter: 'eth_syncing',
    outputFormatter: formatters.outputSyncingFormatter
  })

  export const gasPrice = new Property({
    name: 'gasPrice',
    getter: 'eth_gasPrice',
    outputFormatter: formatters.outputBigNumberFormatter
  })

  export const accounts = new Property({
    name: 'accounts',
    getter: 'eth_accounts'
  })

  export const blockNumber = new Property({
    name: 'blockNumber',
    getter: 'eth_blockNumber',
    outputFormatter: utils.toDecimal
  })

  export const protocolVersion = new Property({
    name: 'protocolVersion',
    getter: 'eth_protocolVersion'
  })

  export const nodeVersion = new Property({
    name: 'version.node',
    getter: 'web3_clientVersion'
  })

  export const networkVersion = new Property({
    name: 'version.network',
    getter: 'net_version',
    inputFormatter: utils.toDecimal
  })

  export const ethereumVersion = new Property({
    name: 'version.ethereum',
    getter: 'eth_protocolVersion',
    inputFormatter: utils.toDecimal
  })

  export const whisperVersion = new Property({
    name: 'version.whisper',
    getter: 'shh_version',
    inputFormatter: utils.toDecimal
  })
}
