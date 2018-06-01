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
import { Inputs, Outputs } from '../utils/formatters'
import utils = require('../utils/utils')
import { Method } from '../Method'

import { Property } from '../Property'

// @ts-ignore: needed for typing (TODO check how to delete it)
import BigNumber from 'bignumber.js'
import { RequestManager } from '..'

export type Input<A> = (val: A) => any
export type OutputFormatter<X> = (val: any) => X

function newMethod<A1, X>(opts: {
  name: string
  inputs: [Input<A1>]
  output: OutputFormatter<X>
}): (rm: RequestManager) => (a1: A1) => Promise<X>
function newMethod<A1, A2, X>(opts: {
  name: string
  inputs: [Input<A1>, Input<A2>]
  output: OutputFormatter<X>
}): (rm: RequestManager) => (a1: A1, a2: A2) => Promise<X>
function newMethod<A1, A2, A3, X>(opts: {
  name: string
  inputs: [Input<A1>, Input<A2>, Input<A3>]
  output: OutputFormatter<X>
}): (rm: RequestManager) => (a1: A1, a2: A2, a3: A3) => Promise<X>
function newMethod<A1, A2, A3, A4, X>(opts: {
  name: string
  inputs: [Input<A1>, Input<A2>, Input<A3>, Input<A4>]
  output: OutputFormatter<X>
}): (rm: RequestManager) => (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<X>
function newMethod(opts: {
  name: string
  inputs: Input<any>[]
  output: OutputFormatter<any>
}): (rm: RequestManager) => (...args: any[]) => Promise<any> {
  return (rm: RequestManager) => async (...args) => {
    const payload = {
      method: opts.name,
      params: opts.inputs.map((format, i) => format(args[i]))
    }
    const result = await rm.sendAsync(payload)
    return opts.output(result)
  }
}

export namespace eth {
  export const eth_getBalance = newMethod({
    name: 'eth_getBalance',
    inputs: [Inputs.address, Inputs.blockNumber],
    output: formatters.outputBigNumberFormatter
  })

  export const eth_getStorageAt = new Method({
    callName: 'eth_getStorageAt',
    params: 3,
    inputFormatter: [Inputs.address, utils.toHex, Inputs.blockNumber]
  })

  export const eth_getCode = newMethod({
    name: 'eth_getCode',
    inputs: [Inputs.address, Inputs.blockNumber],
    output: Outputs.data
  })

  export const eth_getBlockByHash = newMethod({
    name: 'eth_getBlockByHash',
    inputs: [Inputs.txHash, Inputs.boolean],
    output: Outputs.blockObject
  })

  export const eth_getBlockByNumber = newMethod({
    name: 'eth_getBlockByNumber',
    inputs: [Inputs.blockNumber, Inputs.boolean],
    output: Outputs.blockObject
  })

  export const eth_getUncleByBlockHashAndIndex = new Method({
    callName: 'eth_getUncleByBlockHashAndIndex',
    params: 2,
    inputFormatter: [Inputs.blockNumber, utils.toHex],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getUncleByBlockNumberAndIndex = new Method({
    callName: 'eth_getUncleByBlockNumberAndIndex',
    params: 2,
    inputFormatter: [Inputs.blockNumber, utils.toHex],
    outputFormatter: formatters.outputBlockFormatter
  })

  export const eth_getCompilers = new Method({
    callName: 'eth_getCompilers',
    params: 0,
    inputFormatter: []
  })

  export const eth_getBlockTransactionCountByHash = newMethod({
    name: 'eth_getBlockTransactionCountByHash',
    inputs: [Inputs.txHash],
    output: Outputs.number
  })

  export const eth_getBlockTransactionCountByNumber = newMethod({
    name: 'eth_getBlockTransactionCountByNumber',
    inputs: [Inputs.blockNumber],
    output: Outputs.number
  })

  export const eth_getUncleCountByBlockHash = new Method({
    callName: 'eth_getUncleCountByBlockHash',
    params: 1,
    inputFormatter: [Inputs.blockNumber],
    outputFormatter: Outputs.number
  })

  export const eth_getUncleCountByBlockNumber = new Method({
    callName: 'eth_getUncleCountByBlockNumber',
    params: 1,
    inputFormatter: [Inputs.blockNumber],
    outputFormatter: Outputs.number
  })

  export const eth_getTransactionByHash = new Method({
    callName: 'eth_getTransactionByHash',
    params: 1,
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const eth_getTransactionByBlockHashAndIndex = new Method({
    callName: 'eth_getTransactionByBlockHashAndIndex',
    params: 2,
    inputFormatter: [Inputs.blockNumber, utils.toHex],
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const eth_getTransactionByBlockNumberAndIndex = new Method({
    callName: 'eth_getTransactionByBlockNumberAndIndex',
    params: 2,
    inputFormatter: [Inputs.blockNumber, utils.toHex],
    outputFormatter: formatters.outputTransactionFormatter
  })

  export const eth_getTransactionReceipt = new Method({
    callName: 'eth_getTransactionReceipt',
    params: 1,
    outputFormatter: formatters.outputTransactionReceiptFormatter
  })

  export const eth_getTransactionCount = newMethod({
    name: 'eth_getTransactionCount',
    inputs: [Inputs.address, formatters.inputDefaultBlockNumberFormatter],
    output: Outputs.number
  })

  export const eth_sendRawTransaction = new Method({
    callName: 'eth_sendRawTransaction',
    params: 1,
    inputFormatter: [null]
  })

  export const web3_sha3 = new Method({
    callName: 'web3_sha3',
    params: 1,
    inputFormatter: [null]
  })

  export const eth_sendTransaction = new Method({
    callName: 'eth_sendTransaction',
    params: 1,
    inputFormatter: [formatters.inputTransactionFormatter]
  })

  export const eth_signTransaction = new Method({
    callName: 'eth_signTransaction',
    params: 1,
    inputFormatter: [formatters.inputTransactionFormatter]
  })

  export const eth_sign = new Method({
    callName: 'eth_sign',
    params: 2,
    inputFormatter: [Inputs.address, null]
  })

  export const eth_call = new Method({
    callName: 'eth_call',
    params: 2,
    inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter]
  })

  export const eth_estimateGas = new Method({
    callName: 'eth_estimateGas',
    params: 1,
    inputFormatter: [formatters.inputCallFormatter],
    outputFormatter: Outputs.number
  })

  export const eth_compileSolidity = new Method({
    callName: 'eth_compileSolidity',
    params: 1
  })

  export const eth_compileLLL = new Method({
    callName: 'eth_compileLLL',
    params: 1
  })

  export const eth_compileSerpent = new Method({
    callName: 'eth_compileSerpent',
    params: 1
  })

  export const eth_submitWork = new Method({
    callName: 'eth_submitWork',
    params: 3,
    outputFormatter: utils.toBoolean
  })

  export const eth_getWork = new Method({
    callName: 'eth_getWork',
    params: 0
  })

  export const eth_coinbase = new Property({
    getter: 'eth_coinbase'
  })

  export const eth_mining = new Property({
    getter: 'eth_mining',
    outputFormatter: utils.toBoolean
  })

  export const eth_hashrate = new Property({
    getter: 'eth_hashrate',
    outputFormatter: Outputs.number
  })

  export const eth_syncing = new Property({
    getter: 'eth_syncing',
    outputFormatter: formatters.outputSyncingFormatter
  })

  export const eth_gasPrice = new Property({
    getter: 'eth_gasPrice',
    outputFormatter: formatters.outputBigNumberFormatter
  })

  export const eth_accounts = new Property({
    getter: 'eth_accounts'
  })

  export const eth_blockNumber = new Property({
    getter: 'eth_blockNumber',
    outputFormatter: Outputs.number
  })

  export const eth_protocolVersion = new Property({
    getter: 'eth_protocolVersion',
    outputFormatter: Outputs.number
  })

  export const web3_clientVersion = new Property({
    getter: 'web3_clientVersion'
  })

  export const net_version = new Property({
    getter: 'net_version',
    outputFormatter: Outputs.number
  })

  export const shh_version = new Method({
    callName: 'shh_version',
    params: 0,
    outputFormatter: Outputs.number
  })

  export const shh_info = new Method({
    callName: 'shh_info',
    params: 0
  })

  export const shh_setMaxMessageSize = new Method({
    callName: 'shh_setMaxMessageSize',
    params: 1
  })

  export const shh_setMinPoW = new Method({
    callName: 'shh_setMinPoW',
    params: 1
  })

  export const shh_markTrustedPeer = new Method({
    callName: 'shh_markTrustedPeer',
    params: 1
  })

  export const shh_newKeyPair = new Method({
    callName: 'shh_newKeyPair',
    params: 0
  })

  export const shh_addPrivateKey = new Method({
    callName: 'shh_addPrivateKey',
    params: 1
  })

  export const shh_deleteKeyPair = new Method({
    callName: 'shh_deleteKeyPair',
    params: 1
  })

  export const shh_hasKeyPair = new Method({
    callName: 'shh_hasKeyPair',
    params: 1
  })

  export const shh_getPublicKey = new Method({
    callName: 'shh_getPublicKey',
    params: 1
  })

  export const shh_getPrivateKey = new Method({
    callName: 'shh_getPrivateKey',
    params: 1
  })

  export const shh_newSymKey = new Method({
    callName: 'shh_newSymKey',
    params: 0
  })

  export const shh_addSymKey = new Method({
    callName: 'shh_addSymKey',
    params: 1
  })

  export const shh_generateSymKeyFromPassword = new Method({
    callName: 'shh_generateSymKeyFromPassword',
    params: 1
  })

  export const shh_hasSymKey = new Method({
    callName: 'shh_hasSymKey',
    params: 1
  })

  export const shh_getSymKey = new Method({
    callName: 'shh_getSymKey',
    params: 1
  })

  export const shh_deleteSymKey = new Method({
    callName: 'shh_deleteSymKey',
    params: 1
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
    inputFormatter: [null]
  })

  export const personal_importRawKey = new Method({
    callName: 'personal_importRawKey',
    params: 2
  })

  export const personal_sign = new Method({
    callName: 'personal_sign',
    params: 3,
    inputFormatter: [null, Inputs.address, null]
  })

  export const personal_ecRecover = new Method({
    callName: 'personal_ecRecover',
    params: 2
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
    inputFormatter: [formatters.inputTransactionFormatter, null]
  })

  export const personal_lockAccount = new Method({
    callName: 'personal_lockAccount',
    params: 1,
    inputFormatter: [formatters.inputAddressFormatter],
    outputFormatter: utils.toBoolean
  })

  export const personal_listAccounts = new Property({
    getter: 'personal_listAccounts'
  })

  export const net_listening = new Property({
    getter: 'net_listening',
    outputFormatter: utils.toBoolean
  })

  export const net_peerCount = new Property({
    getter: 'net_peerCount',
    outputFormatter: Outputs.number
  })

  export const eth_newFilter = new Method({
    callName: 'eth_newFilter',
    params: 1,
    outputFormatter: utils.toHex
  })

  export const eth_getLogs = new Method({
    callName: 'eth_getLogs',
    params: 1,
    inputFormatter: [utils.toHex]
  })

  export const eth_newBlockFilter = new Method({
    callName: 'eth_newBlockFilter',
    params: 0,
    outputFormatter: utils.toHex
  })

  export const eth_newPendingTransactionFilter = new Method({
    callName: 'eth_newPendingTransactionFilter',
    params: 0,
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
    inputFormatter: [utils.toHex]
  })

  export const eth_getFilterChanges = new Method({
    callName: 'eth_getFilterChanges',
    params: 1,
    inputFormatter: [utils.toHex]
  })

  export const eth_submitHashrate = new Method({
    callName: 'eth_submitHashrate',
    params: 2,
    outputFormatter: utils.toBoolean
  })

  export const shh_newIdentity = new Method({
    callName: 'shh_newIdentity',
    params: 0
  })

  export const shh_hasIdentity = new Method({
    callName: 'shh_hasIdentity',
    params: 1,
    outputFormatter: utils.toBoolean
  })

  export const shh_newGroup = new Method({
    callName: 'shh_newGroup',
    params: 0
  })

  export const shh_addToGroup = new Method({
    callName: 'shh_addToGroup',
    params: 1,
    outputFormatter: utils.toBoolean
  })

  export const shh_newFilter = new Method({
    callName: 'shh_newFilter',
    params: 1,
    outputFormatter: utils.toHex
  })

  export const shh_uninstallFilter = new Method({
    callName: 'shh_uninstallFilter',
    params: 1,
    outputFormatter: utils.toBoolean
  })

  export const shh_newMessageFilter = new Method({
    callName: 'shh_newMessageFilter',
    params: 1
  })

  export const shh_deleteMessageFilter = new Method({
    callName: 'shh_deleteMessageFilter',
    params: 1
  })

  export const shh_getLogs = new Method({
    callName: 'shh_getLogs',
    params: 1
  })

  export const shh_getFilterMessages = new Method({
    callName: 'shh_getFilterMessages',
    params: 1
  })

  export const shh_getFilterChanges = new Method({
    callName: 'shh_getFilterChanges',
    params: 1
  })

  export const shh_getMessages = new Method({
    callName: 'shh_getMessages',
    params: 1
  })

  export const bzz_blockNetworkRead = new Method({
    callName: 'bzz_blockNetworkRead',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_syncEnabled = new Method({
    callName: 'bzz_syncEnabled',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_swapEnabled = new Method({
    callName: 'bzz_swapEnabled',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_download = new Method({
    callName: 'bzz_download',
    params: 2,
    inputFormatter: [null, null]
  })

  export const bzz_upload = new Method({
    callName: 'bzz_upload',
    params: 2,
    inputFormatter: [null, null]
  })

  export const bzz_retrieve = new Method({
    callName: 'bzz_retrieve',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_store = new Method({
    callName: 'bzz_store',
    params: 2,
    inputFormatter: [null, null]
  })

  export const bzz_get = new Method({
    callName: 'bzz_get',
    params: 1,
    inputFormatter: [null]
  })

  export const bzz_put = new Method({
    callName: 'bzz_put',
    params: 2,
    inputFormatter: [null, null]
  })

  export const bzz_modify = new Method({
    callName: 'bzz_modify',
    params: 4,
    inputFormatter: [null, null, null, null]
  })

  export const bzz_hive = new Property({
    getter: 'bzz_hive'
  })

  export const bzz_info = new Property({
    getter: 'bzz_info'
  })
}
