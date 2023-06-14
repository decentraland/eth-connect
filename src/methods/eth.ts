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
import * as formatters from '../utils/formatters'
import * as utils from '../utils/utils'
import { Method } from '../Method'
import { Property } from '../Property'
import { BigNumber } from '../utils/BigNumber'
import { BlockObject, Data, Syncing, TransactionObject, TransactionReceipt } from '../Schema'

/**
 * @public
 */
export namespace eth {
  export const eth_getBalance = new Method<BigNumber>({
    callName: 'eth_getBalance',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
    outputFormatter: formatters.outputBigNumberFormatter
  })

  export const eth_getStorageAt = new Method<Data>({
    callName: 'eth_getStorageAt',
    params: 3,
    inputFormatter: [formatters.inputAddressFormatter, utils.toHex, formatters.inputDefaultBlockNumberFormatter],
    outputFormatter: utils.toData
  })

  export const eth_getCode = new Method<Data>({
    callName: 'eth_getCode',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
    outputFormatter: utils.toData
  })

  export const eth_getBlockByHash = new Method<BlockObject | null>({
    callName: 'eth_getBlockByHash',
    params: 2,
    inputFormatter: [
      formatters.inputBlockNumberFormatter,
      function (val) {
        return !!val
      }
    ],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getBlockByNumber = new Method<BlockObject | null>({
    callName: 'eth_getBlockByNumber',
    params: 2,
    inputFormatter: [
      formatters.inputBlockNumberFormatter,
      function (val) {
        return !!val
      }
    ],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getUncleByBlockHashAndIndex = new Method<BlockObject | null>({
    callName: 'eth_getUncleByBlockHashAndIndex',
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getUncleByBlockNumberAndIndex = new Method<BlockObject | null>({
    callName: 'eth_getUncleByBlockNumberAndIndex',
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getBlockTransactionCountByHash = new Method<number>({
    callName: 'eth_getBlockTransactionCountByHash',
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_getBlockTransactionCountByNumber = new Method<number>({
    callName: 'eth_getBlockTransactionCountByNumber',
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_getUncleCountByBlockHash = new Method<number>({
    callName: 'eth_getUncleCountByBlockHash',
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_getUncleCountByBlockNumber = new Method<number>({
    callName: 'eth_getUncleCountByBlockNumber',
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_getTransactionByHash = new Method<TransactionObject | null>({
    callName: 'eth_getTransactionByHash',
    params: 1,
    inputFormatter: [formatters.inputTransactionId],
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const eth_getTransactionByBlockHashAndIndex = new Method<TransactionObject | null>({
    callName: 'eth_getTransactionByBlockHashAndIndex',
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const eth_getTransactionByBlockNumberAndIndex = new Method<TransactionObject | null>({
    callName: 'eth_getTransactionByBlockNumberAndIndex',
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const eth_getTransactionReceipt = new Method<TransactionReceipt | null>({
    callName: 'eth_getTransactionReceipt',
    params: 1,
    inputFormatter: [formatters.inputTransactionId],
    outputFormatter: formatters.outputTransactionReceiptFormatter
  })

  export const eth_getTransactionCount = new Method<number>({
    callName: 'eth_getTransactionCount',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_sendRawTransaction = new Method<Data>({
    callName: 'eth_sendRawTransaction',
    params: 1,
    inputFormatter: [null /* signed data transaction, hex string */],
    outputFormatter: utils.toData
  })

  export const web3_sha3 = new Method<Data>({
    callName: 'web3_sha3',
    params: 1,
    inputFormatter: [null],
    outputFormatter: utils.toData
  })

  export const eth_sendTransaction = new Method<Data>({
    callName: 'eth_sendTransaction',
    params: 1,
    inputFormatter: [formatters.inputTransactionFormatter],
    outputFormatter: utils.toData
  })

  export const eth_sign = new Method<Data>({
    callName: 'eth_sign',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, null],
    outputFormatter: utils.toData
  })

  export const eth_call = new Method<Data>({
    callName: 'eth_call',
    params: 2,
    inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter],
    outputFormatter: utils.toData
  })

  export const eth_estimateGas = new Method<number>({
    callName: 'eth_estimateGas',
    params: 1,
    inputFormatter: [formatters.inputCallFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_submitWork = new Method<boolean>({
    callName: 'eth_submitWork',
    params: 3,
    inputFormatter: [
      null, // DATA, 8 Bytes - The nonce found (64 bits)
      null, // DATA, 32 Bytes - The header’s pow-hash (256 bits)
      null // DATA, 32 Bytes - The mix digest (256 bits)
    ],
    outputFormatter: utils.toBoolean
  })

  export const eth_getWork = new Method({
    callName: 'eth_getWork',
    params: 0,
    inputFormatter: [],
    outputFormatter: utils.toArray
  })

  export const eth_coinbase = new Property({
    getter: 'eth_coinbase',
    outputFormatter: utils.toAddress
  })

  export const eth_mining = new Property({
    getter: 'eth_mining',
    outputFormatter: utils.toBoolean
  })

  export const eth_hashrate = new Property({
    getter: 'eth_hashrate',
    outputFormatter: utils.toDecimal
  })

  export const eth_syncing = new Property<Syncing>({
    getter: 'eth_syncing',
    outputFormatter: formatters.outputSyncingFormatter
  })

  export const eth_gasPrice = new Property({
    getter: 'eth_gasPrice',
    outputFormatter: formatters.outputBigNumberFormatter
  })

  export const eth_accounts = new Property({
    getter: 'eth_accounts',
    outputFormatter: utils.toArray
  })

  export const eth_blockNumber = new Property({
    getter: 'eth_blockNumber',
    outputFormatter: utils.toDecimal
  })

  export const eth_protocolVersion = new Property({
    getter: 'eth_protocolVersion',
    outputFormatter: utils.toDecimal
  })

  export const web3_clientVersion = new Property({
    getter: 'web3_clientVersion',
    outputFormatter: utils.toString
  })

  export const net_version = new Property({
    getter: 'net_version',
    outputFormatter: utils.toString
  })

  export const shh_version = new Method({
    callName: 'shh_version',
    params: 0,
    inputFormatter: [],
    outputFormatter: utils.toDecimal
  })

  // subscribe and unsubscribe missing

  export const shh_post = new Method({
    callName: 'shh_post',
    params: 1,
    inputFormatter: [null],
    outputFormatter: utils.toBoolean
  })

  export const personal_newAccount = new Method({
    callName: 'personal_newAccount',
    params: 1,
    inputFormatter: [null],
    outputFormatter: utils.toAddress
  })

  export const personal_importRawKey = new Method({
    callName: 'personal_importRawKey',
    params: 2,
    inputFormatter: [null /* private key */, null /* passphrase */],
    outputFormatter: utils.toAddress
  })

  export const personal_sign = new Method({
    callName: 'personal_sign',
    params: 3,
    inputFormatter: [utils.toStringData, formatters.inputAddressFormatter, null],
    outputFormatter: utils.toData
  })

  export const personal_ecRecover = new Method({
    callName: 'personal_ecRecover',
    params: 2,
    inputFormatter: [utils.toStringData /* message */, null /* signature */],
    outputFormatter: utils.toAddress
  })

  export const personal_unlockAccount = new Method({
    callName: 'personal_unlockAccount',
    params: 3,
    inputFormatter: [formatters.inputAddressFormatter, null, utils.toNullDecimal],
    outputFormatter: utils.toBoolean
  })

  export const personal_sendTransaction = new Method({
    callName: 'personal_sendTransaction',
    params: 2,
    inputFormatter: [formatters.inputTransactionFormatter, null],
    outputFormatter: utils.toData
  })

  export const personal_lockAccount = new Method({
    callName: 'personal_lockAccount',
    params: 1,
    inputFormatter: [formatters.inputAddressFormatter],
    outputFormatter: utils.toBoolean
  })

  export const personal_listAccounts = new Property({
    getter: 'personal_listAccounts',
    outputFormatter: utils.toArray
  })

  export const net_listening = new Property({
    getter: 'net_listening',
    outputFormatter: utils.toBoolean
  })

  export const net_peerCount = new Property({
    getter: 'net_peerCount',
    outputFormatter: utils.toDecimal
  })

  export const eth_newFilter = new Method({
    callName: 'eth_newFilter',
    params: 1,
    inputFormatter: [formatters.inputFilterOptions],
    outputFormatter: utils.toHex
  })

  export const eth_getLogs = new Method({
    callName: 'eth_getLogs',
    params: 1,
    inputFormatter: [utils.toHex],
    outputFormatter: utils.toArray
  })

  export const eth_newBlockFilter = new Method({
    callName: 'eth_newBlockFilter',
    params: 0,
    inputFormatter: [],
    outputFormatter: utils.toHex
  })

  export const eth_newPendingTransactionFilter = new Method({
    callName: 'eth_newPendingTransactionFilter',
    params: 0,
    inputFormatter: [],
    outputFormatter: utils.toHex
  })

  export const eth_uninstallFilter = new Method({
    callName: 'eth_uninstallFilter',
    params: 1,
    inputFormatter: [utils.toHex],
    outputFormatter: utils.toBoolean
  })

  export const eth_getFilterLogs = new Method({
    callName: 'eth_getFilterLogs',
    params: 1,
    inputFormatter: [utils.toHex],
    outputFormatter: utils.toArray
  })

  export const eth_getFilterChanges = new Method({
    callName: 'eth_getFilterChanges',
    params: 1,
    inputFormatter: [utils.toHex],
    outputFormatter: utils.toArray
  })

  export const eth_submitHashrate = new Method({
    callName: 'eth_submitHashrate',
    params: 2,
    inputFormatter: [null /* hashrate */, null /* id */],
    outputFormatter: utils.toBoolean
  })

  export const shh_newIdentity = new Method({
    callName: 'shh_newIdentity',
    params: 0,
    inputFormatter: [],
    outputFormatter: utils.toData
  })

  export const shh_hasIdentity = new Method({
    callName: 'shh_hasIdentity',
    params: 1,
    inputFormatter: [
      null // DATA, 60 Bytes - The identity address to check.
    ],
    outputFormatter: utils.toBoolean
  })

  export const shh_newGroup = new Method({
    callName: 'shh_newGroup',
    params: 0,
    inputFormatter: [],
    outputFormatter: utils.toData
  })

  export const shh_addToGroup = new Method({
    callName: 'shh_addToGroup',
    params: 1,
    inputFormatter: [
      null // DATA, 60 Bytes - The identity address to add to a group (?)
    ],
    outputFormatter: utils.toBoolean
  })

  export const shh_newFilter = new Method({
    callName: 'shh_newFilter',
    params: 1,
    inputFormatter: [null],
    outputFormatter: utils.toHex
  })

  export const shh_uninstallFilter = new Method({
    callName: 'shh_uninstallFilter',
    params: 1,
    inputFormatter: [null],
    outputFormatter: utils.toBoolean
  })

  export const shh_getLogs = new Method({
    callName: 'shh_getLogs',
    params: 1,
    inputFormatter: [null],
    outputFormatter: utils.toArray
  })

  export const shh_getFilterMessages = new Method({
    callName: 'shh_getFilterMessages',
    params: 1,
    inputFormatter: [null],
    outputFormatter: utils.toArray
  })

  export const shh_getFilterChanges = new Method({
    callName: 'shh_getFilterChanges',
    params: 1,
    inputFormatter: [null],
    outputFormatter: utils.toArray
  })

  export const shh_getMessages = new Method({
    callName: 'shh_getMessages',
    params: 1,
    inputFormatter: [null],
    outputFormatter: utils.toArray
  })
}
