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
// tslint:disable:variable-name

import formatters = require('../utils/formatters')
import utils = require('../utils/utils')
import { Method } from '../Method'
import { Property } from '../Property'

export namespace eth {
  export const eth_getBalance = new Method({
    name: 'eth_getBalance',
    callName: 'eth_getBalance',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
    outputFormatter: formatters.outputBigNumberFormatter
  })

  export const eth_getStorageAt = new Method({
    name: 'eth_getStorageAt',
    callName: 'eth_getStorageAt',
    params: 3,
    inputFormatter: [null, utils.toHex, formatters.inputDefaultBlockNumberFormatter]
  })

  export const eth_getCode = new Method({
    name: 'eth_getCode',
    callName: 'eth_getCode',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter]
  })

  export const eth_getBlockByHash = new Method({
    name: 'eth_getBlockByHash',
    callName: 'eth_getBlockByHash',
    params: 2,
    inputFormatter: [
      formatters.inputBlockNumberFormatter,
      function(val) {
        return !!val
      }
    ],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getBlockByNumber = new Method({
    name: 'eth_getBlockByNumber',
    callName: 'eth_getBlockByNumber',
    params: 2,
    inputFormatter: [
      formatters.inputBlockNumberFormatter,
      function(val) {
        return !!val
      }
    ],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getUncleByBlockHashAndIndex = new Method({
    name: 'eth_getUncleByBlockHashAndIndex',
    callName: 'eth_getUncleByBlockHashAndIndex',
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getUncleByBlockNumberAndIndex = new Method({
    name: 'eth_getUncleByBlockNumberAndIndex',
    callName: 'eth_getUncleByBlockNumberAndIndex',
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getCompilers = new Method({
    name: 'eth_getCompilers',
    callName: 'eth_getCompilers',
    params: 0,
    inputFormatter: []
  })

  export const eth_getBlockTransactionCountByHash = new Method({
    name: 'eth_getBlockTransactionCountByHash',
    callName: 'eth_getBlockTransactionCountByHash',
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_getBlockTransactionCountByNumber = new Method({
    name: 'eth_getBlockTransactionCountByNumber',
    callName: 'eth_getBlockTransactionCountByNumber',
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_getUncleCountByBlockHash = new Method({
    name: 'eth_getUncleCountByBlockHash',
    callName: 'eth_getUncleCountByBlockHash',
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_getUncleCountByBlockNumber = new Method({
    name: 'eth_getUncleCountByBlockNumber',
    callName: 'eth_getUncleCountByBlockNumber',
    params: 1,
    inputFormatter: [formatters.inputBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_getTransactionByHash = new Method({
    name: 'eth_getTransactionByHash',
    callName: 'eth_getTransactionByHash',
    params: 1,
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const eth_getTransactionByBlockHashAndIndex = new Method({
    name: 'eth_getTransactionByBlockHashAndIndex',
    callName: 'eth_getTransactionByBlockHashAndIndex',
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const eth_getTransactionByBlockNumberAndIndex = new Method({
    name: 'eth_getTransactionByBlockNumberAndIndex',
    callName: 'eth_getTransactionByBlockNumberAndIndex',
    params: 2,
    inputFormatter: [formatters.inputBlockNumberFormatter, utils.toHex],
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const eth_getTransactionReceipt = new Method({
    name: 'eth_getTransactionReceipt',
    callName: 'eth_getTransactionReceipt',
    params: 1,
    outputFormatter: formatters.outputTransactionReceiptFormatter
  })

  export const eth_getTransactionCount = new Method({
    name: 'eth_getTransactionCount',
    callName: 'eth_getTransactionCount',
    params: 2,
    inputFormatter: [null, formatters.inputDefaultBlockNumberFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_sendRawTransaction = new Method({
    name: 'eth_sendRawTransaction',
    callName: 'eth_sendRawTransaction',
    params: 1,
    inputFormatter: [null]
  })

  export const web3_sha3 = new Method({
    name: 'web3_sha3',
    callName: 'web3_sha3',
    params: 1,
    inputFormatter: [null]
  })

  export const eth_sendTransaction = new Method({
    name: 'eth_sendTransaction',
    callName: 'eth_sendTransaction',
    params: 1,
    inputFormatter: [formatters.inputTransactionFormatter]
  })

  export const eth_signTransaction = new Method({
    name: 'eth_signTransaction',
    callName: 'eth_signTransaction',
    params: 1,
    inputFormatter: [formatters.inputTransactionFormatter]
  })

  export const eth_sign = new Method({
    name: 'eth_sign',
    callName: 'eth_sign',
    params: 2,
    inputFormatter: [formatters.inputAddressFormatter, null]
  })

  export const eth_call = new Method({
    name: 'eth_call',
    callName: 'eth_call',
    params: 2,
    inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter]
  })

  export const eth_estimateGas = new Method({
    name: 'eth_estimateGas',
    callName: 'eth_estimateGas',
    params: 1,
    inputFormatter: [formatters.inputCallFormatter],
    outputFormatter: utils.toDecimal
  })

  export const eth_compileSolidity = new Method({
    name: 'eth_compileSolidity',
    callName: 'eth_compileSolidity',
    params: 1
  })

  export const eth_compileLLL = new Method({
    name: 'eth_compileLLL',
    callName: 'eth_compileLLL',
    params: 1
  })

  export const eth_compileSerpent = new Method({
    name: 'eth_compileSerpent',
    callName: 'eth_compileSerpent',
    params: 1
  })

  export const eth_submitWork = new Method({
    name: 'eth_submitWork',
    callName: 'eth_submitWork',
    params: 3
  })

  export const eth_getWork = new Method({
    name: 'eth_getWork',
    callName: 'eth_getWork',
    params: 0
  })

  export const eth_coinbase = new Property({
    name: 'eth_coinbase',
    getter: 'eth_coinbase'
  })

  export const eth_mining = new Property({
    name: 'eth_mining',
    getter: 'eth_mining'
  })

  export const eth_hashrate = new Property({
    name: 'eth_hashrate',
    getter: 'eth_hashrate',
    outputFormatter: utils.toDecimal
  })

  export const eth_syncing = new Property({
    name: 'eth_syncing',
    getter: 'eth_syncing',
    outputFormatter: formatters.outputSyncingFormatter
  })

  export const eth_gasPrice = new Property({
    name: 'eth_gasPrice',
    getter: 'eth_gasPrice',
    outputFormatter: formatters.outputBigNumberFormatter
  })

  export const eth_accounts = new Property({
    name: 'eth_accounts',
    getter: 'eth_accounts'
  })

  export const eth_blockNumber = new Property({
    name: 'eth_blockNumber',
    getter: 'eth_blockNumber',
    outputFormatter: utils.toDecimal
  })

  export const eth_protocolVersion = new Property({
    name: 'eth_protocolVersion',
    getter: 'eth_protocolVersion'
  })

  export const web3_clientVersion = new Property({
    name: 'web3_clientVersion',
    getter: 'web3_clientVersion'
  })

  export const net_version = new Property({
    name: 'net_version',
    getter: 'net_version',
    inputFormatter: utils.toDecimal
  })

  export const shh_version = new Method({
    name: 'shh_version',
    callName: 'shh_version',
    params: 0
  })

  export const shh_info = new Method({
    name: 'shh_info',
    callName: 'shh_info',
    params: 0
  })

  export const shh_setMaxMessageSize = new Method({
    name: 'shh_setMaxMessageSize',
    callName: 'shh_setMaxMessageSize',
    params: 1
  })

  export const shh_setMinPoW = new Method({
    name: 'shh_setMinPoW',
    callName: 'shh_setMinPoW',
    params: 1
  })

  export const shh_markTrustedPeer = new Method({
    name: 'shh_markTrustedPeer',
    callName: 'shh_markTrustedPeer',
    params: 1
  })

  export const shh_newKeyPair = new Method({
    name: 'shh_newKeyPair',
    callName: 'shh_newKeyPair',
    params: 0
  })

  export const shh_addPrivateKey = new Method({
    name: 'shh_addPrivateKey',
    callName: 'shh_addPrivateKey',
    params: 1
  })

  export const shh_deleteKeyPair = new Method({
    name: 'shh_deleteKeyPair',
    callName: 'shh_deleteKeyPair',
    params: 1
  })

  export const shh_hasKeyPair = new Method({
    name: 'shh_hasKeyPair',
    callName: 'shh_hasKeyPair',
    params: 1
  })

  export const shh_getPublicKey = new Method({
    name: 'shh_getPublicKey',
    callName: 'shh_getPublicKey',
    params: 1
  })

  export const shh_getPrivateKey = new Method({
    name: 'shh_getPrivateKey',
    callName: 'shh_getPrivateKey',
    params: 1
  })

  export const shh_newSymKey = new Method({
    name: 'shh_newSymKey',
    callName: 'shh_newSymKey',
    params: 0
  })

  export const shh_addSymKey = new Method({
    name: 'shh_addSymKey',
    callName: 'shh_addSymKey',
    params: 1
  })

  export const shh_generateSymKeyFromPassword = new Method({
    name: 'shh_generateSymKeyFromPassword',
    callName: 'shh_generateSymKeyFromPassword',
    params: 1
  })

  export const shh_hasSymKey = new Method({
    name: 'shh_hasSymKey',
    callName: 'shh_hasSymKey',
    params: 1
  })

  export const shh_getSymKey = new Method({
    name: 'shh_getSymKey',
    callName: 'shh_getSymKey',
    params: 1
  })

  export const shh_deleteSymKey = new Method({
    name: 'shh_deleteSymKey',
    callName: 'shh_deleteSymKey',
    params: 1
  })

  // subscribe and unsubscribe missing

  export const shh_post = new Method({
    name: 'shh_post',
    callName: 'shh_post',
    params: 1,
    inputFormatter: [null]
  })

  export const personal_newAccount = new Method({
    name: 'personal_newAccount',
    callName: 'personal_newAccount',
    params: 1,
    inputFormatter: [null]
  })

  export const personal_importRawKey = new Method({
    name: 'personal_importRawKey',
    callName: 'personal_importRawKey',
    params: 2
  })

  export const personal_sign = new Method({
    name: 'personal_sign',
    callName: 'personal_sign',
    params: 3,
    inputFormatter: [null, formatters.inputAddressFormatter, null]
  })

  export const personal_ecRecover = new Method({
    name: 'personal_ecRecover',
    callName: 'personal_ecRecover',
    params: 2
  })

  export const personal_unlockAccount = new Method({
    name: 'personal_unlockAccount',
    callName: 'personal_unlockAccount',
    params: 3,
    inputFormatter: [formatters.inputAddressFormatter, null, null]
  })

  export const personal_sendTransaction = new Method({
    name: 'personal_sendTransaction',
    callName: 'personal_sendTransaction',
    params: 2,
    inputFormatter: [formatters.inputTransactionFormatter, null]
  })

  export const personal_lockAccount = new Method({
    name: 'personal_lockAccount',
    callName: 'personal_lockAccount',
    params: 1,
    inputFormatter: [formatters.inputAddressFormatter]
  })

  export const personal_listAccounts = new Property({
    name: 'personal_listAccounts',
    getter: 'personal_listAccounts'
  })

  export const net_listening = new Property({
    name: 'net_listening',
    getter: 'net_listening'
  })

  export const net_peerCount = new Property({
    name: 'net_peerCount',
    getter: 'net_peerCount',
    outputFormatter: utils.toDecimal
  })

  export const eth_newFilter = new Method({
    name: 'eth_newFilter',
    callName: 'eth_newFilter',
    params: 1
  })

  export const eth_getLogs = new Method({
    name: 'eth_getLogs',
    callName: 'eth_getLogs',
    params: 1
  })

  export const eth_newBlockFilter = new Method({
    name: 'eth_newBlockFilter',
    callName: 'eth_newBlockFilter',
    params: 0
  })
  export const eth_newPendingTransactionFilter = new Method({
    name: 'eth_newPendingTransactionFilter',
    callName: 'eth_newPendingTransactionFilter',
    params: 0
  })

  export const eth_uninstallFilter = new Method({
    name: 'eth_uninstallFilter',
    callName: 'eth_uninstallFilter',
    params: 1
  })

  export const eth_getFilterLogs = new Method({
    name: 'eth_getFilterLogs',
    callName: 'eth_getFilterLogs',
    params: 1
  })

  export const eth_getFilterChanges = new Method({
    name: 'eth_getFilterChanges',
    callName: 'eth_getFilterChanges',
    params: 1
  })

  export const eth_submitHashrate = new Method({
    name: 'eth_submitHashrate',
    callName: 'eth_submitHashrate',
    params: 2
  })

  export const shh_newIdentity = new Method({
    name: 'shh_newIdentity',
    callName: 'shh_newIdentity',
    params: 0
  })

  export const shh_hasIdentity = new Method({
    name: 'shh_hasIdentity',
    callName: 'shh_hasIdentity',
    params: 1
  })

  export const shh_newGroup = new Method({
    name: 'shh_newGroup',
    callName: 'shh_newGroup',
    params: 0
  })

  export const shh_addToGroup = new Method({
    name: 'shh_addToGroup',
    callName: 'shh_addToGroup',
    params: 0
  })

  export const shh_newFilter = new Method({
    name: 'shh_newFilter',
    callName: 'shh_newFilter',
    params: 1
  })

  export const shh_uninstallFilter = new Method({
    name: 'shh_uninstallFilter',
    callName: 'shh_uninstallFilter',
    params: 1
  })

  export const shh_newMessageFilter = new Method({
    name: 'shh_newMessageFilter',
    callName: 'shh_newMessageFilter',
    params: 1
  })

  export const shh_deleteMessageFilter = new Method({
    name: 'shh_deleteMessageFilter',
    callName: 'shh_deleteMessageFilter',
    params: 1
  })

  export const shh_getLogs = new Method({
    name: 'shh_getLogs',
    callName: 'shh_getLogs',
    params: 1
  })

  export const shh_getFilterMessages = new Method({
    name: 'shh_getFilterMessages',
    callName: 'shh_getFilterMessages',
    params: 1
  })

  export const shh_getFilterChanges = new Method({
    name: 'shh_getFilterChanges',
    callName: 'shh_getFilterChanges',
    params: 1
  })

  export const shh_getMessages = new Method({
    name: 'shh_getMessages',
    callName: 'shh_getMessages',
    params: 1
  })

  export const bzz_blockNetworkRead = new Method({
    name: 'bzz_blockNetworkRead',
    callName: 'bzz_blockNetworkRead',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_syncEnabled = new Method({
    name: 'bzz_syncEnabled',
    callName: 'bzz_syncEnabled',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_swapEnabled = new Method({
    name: 'bzz_swapEnabled',
    callName: 'bzz_swapEnabled',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_download = new Method({
    name: 'bzz_download',
    callName: 'bzz_download',
    params: 2,
    inputFormatter: [null, null]
  })

  export const bzz_upload = new Method({
    name: 'bzz_upload',
    callName: 'bzz_upload',
    params: 2,
    inputFormatter: [null, null]
  })

  export const bzz_retrieve = new Method({
    name: 'bzz_retrieve',
    callName: 'bzz_retrieve',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_store = new Method({
    name: 'bzz_store',
    callName: 'bzz_store',
    params: 2,
    inputFormatter: [null, null]
  })

  export const bzz_get = new Method({
    name: 'bzz_get',
    callName: 'bzz_get',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_put = new Method({
    name: 'bzz_put',
    callName: 'bzz_put',
    params: 2,
    inputFormatter: [null, null]
  })

  export const bzz_modify = new Method({
    name: 'bzz_modify',
    callName: 'bzz_modify',
    params: 4,
    inputFormatter: [null, null, null, null]
  })

  export const bzz_hive = new Property({
    name: 'bzz_hive',
    getter: 'bzz_hive'
  })

  export const bzz_info = new Property({
    name: 'bzz_info',
    getter: 'bzz_info'
  })
}
