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

import { RPCSendableMessage, toJsonRpcRequest, isValidResponse } from './utils/jsonrpc'
import { InvalidProvider, InvalidResponse } from './utils/errors'
import { BigNumber } from './utils/BigNumber'
import { IFuture, future } from 'fp-future'
import { eth } from './methods/eth'

import {
  SHHFilterOptions,
  Data,
  Quantity,
  SHHFilterMessage,
  SHHPost,
  LogObject,
  TransactionReceipt,
  BlockObject,
  TransactionObject,
  TransactionCallOptions,
  TransactionOptions,
  Syncing,
  TxHash,
  Address,
  FilterOptions,
  QueuedTransaction,
  PendingTransaction,
  ReplacedTransaction,
  Transaction,
  RevertedTransaction,
  ConfirmedTransaction,
  TransactionType,
  BlockIdentifier,
  TransactionStatus,
  FinishedTransactionAndReceipt,
  TransactionAndReceipt
} from './Schema'
import { sleep } from './utils/sleep'
import { inputTransactionId } from './utils/formatters'

export const TRANSACTION_FETCH_DELAY: number = 2 * 1000

export function inject(target: RequestManager, propertyKey: keyof typeof eth) {
  const method = eth[propertyKey]

  /* istanbul ignore if */
  if (!method) {
    throw new Error(`Could not find the method/property named ${propertyKey.toString()}`)
  }

  Object.defineProperty(target, propertyKey, {
    value: function (this: RequestManager, ...args: any[]) {
      return method.execute(this, ...args)
    }
  })
}

/**
 * @public
 * It's responsible for passing messages to providers
 * It's also responsible for polling the ethereum node for incoming messages
 * Default poll timeout is 1 second
 */
export class RequestManager {
  // @internal
  requests = new Map<number, IFuture<any>>()

  /** Returns the current client version. */
  @inject web3_clientVersion!: () => Promise<string>

  /** Returns Keccak-256 (not the standardized SHA3-256) of the given data. */
  @inject web3_sha3!: (data: Data) => Promise<Data>

  /** Returns the current network id. */
  @inject net_version!: () => Promise<string>

  /** Returns number of peers currently connected to the client. */
  @inject net_peerCount!: () => Promise<Quantity>

  /** Returns true if client is actively listening for network connections. */
  @inject net_listening!: () => Promise<boolean>

  /** Returns the current ethereum protocol version. */
  @inject eth_protocolVersion!: () => Promise<number>

  /** Returns an object with data about the sync status or false. */
  @inject eth_syncing!: () => Promise<false | Syncing>

  /** Returns the client coinbase address. */
  @inject eth_coinbase!: () => Promise<Address>

  /** Returns true if client is actively mining new blocks. */
  @inject eth_mining!: () => Promise<boolean>

  /** Returns the number of hashes per second that the node is mining with. */
  @inject eth_hashrate!: () => Promise<Quantity>

  /** Returns the current price per gas in wei. */
  @inject eth_gasPrice!: () => Promise<BigNumber>

  /** Returns a list of addresses owned by client. */
  @inject eth_accounts!: () => Promise<Address[]>

  /** Returns the number of most recent block. */
  @inject eth_blockNumber!: () => Promise<Quantity>

  /** Returns the balance of the account of given address. */
  @inject eth_getBalance!: (address: Address, block: BlockIdentifier) => Promise<BigNumber>

  /** Returns the value from a storage position at a given address. */
  @inject eth_getStorageAt!: (address: Address, position: Quantity, block: BlockIdentifier) => Promise<Data>

  /** Returns the number of transactions sent from an address. */
  @inject eth_getTransactionCount!: (address: Address, block: BlockIdentifier) => Promise<number>

  /** Returns the number of transactions in a block from a block matching the given block hash. */
  @inject eth_getBlockTransactionCountByHash!: (blockHash: TxHash) => Promise<number>

  /** Returns the number of transactions in a block matching the given block number. */
  @inject eth_getBlockTransactionCountByNumber!: (block: BlockIdentifier) => Promise<number>

  /** Returns the number of uncles in a block from a block matching the given block hash. */
  @inject eth_getUncleCountByBlockHash!: (blockHash: TxHash) => Promise<number>

  /** Returns the number of uncles in a block from a block matching the given block number. */
  @inject eth_getUncleCountByBlockNumber!: (block: BlockIdentifier) => Promise<number>

  /** Returns code at a given address. */
  @inject eth_getCode!: (address: Address, block: BlockIdentifier) => Promise<Data>

  /**
   * The sign method calculates an Ethereum specific signature with:
   *
   * sign(keccak256("Ethereum Signed Message:" + len(message) + message))).
   *
   * By adding a prefix to the message makes the calculated signature recognisable as an Ethereum specific signature.
   * This prevents misuse where a malicious DApp can sign arbitrary data (e.g. transaction) and use the signature to
   * impersonate the victim.
   *
   * Note the address to sign with must be unlocked.
   *
   * @deprecated see https://github.com/ethereum/go-ethereum/pull/2940
   */
  @inject eth_sign!: (address: Address, message: Data) => Promise<Data>

  /** Creates new message call transaction or a contract creation, if the data field contains code. */
  @inject eth_sendTransaction!: (options: TransactionOptions) => Promise<TxHash>

  /** Creates new message call transaction or a contract creation for signed transactions. */
  @inject eth_sendRawTransaction!: (rawTransaction: Data) => Promise<TxHash>

  /** Executes a new message call immediately without creating a transaction on the block chain. */
  @inject eth_call!: (options: TransactionCallOptions, block: BlockIdentifier) => Promise<Data>
  /**
   * Generates and returns an estimate of how much gas is necessary to allow the transaction to complete.
   * The transaction will not be added to the blockchain. Note that the estimate may be significantly more
   * than the amount of gas actually used by the transaction, for a variety of reasons including EVM mechanics
   * and node performance.
   */
  @inject eth_estimateGas!: (data: Partial<TransactionCallOptions> & Partial<TransactionOptions>) => Promise<Quantity>

  /** Returns information about a block by hash. */
  @inject eth_getBlockByHash!: (blockHash: TxHash, fullTransactionObjects: boolean) => Promise<BlockObject>

  /** Returns information about a block by block number. */
  @inject eth_getBlockByNumber!: (block: BlockIdentifier, fullTransactionObjects: boolean) => Promise<BlockObject>

  /** Returns the information about a transaction requested by transaction hash. */
  @inject eth_getTransactionByHash!: (hash: TxHash) => Promise<TransactionObject>

  /** Returns information about a transaction by block hash and transaction index position. */
  @inject eth_getTransactionByBlockHashAndIndex!: (blockHash: TxHash, txIndex: Quantity) => Promise<TransactionObject>

  /** Returns information about a transaction by block number and transaction index position. */
  @inject
  eth_getTransactionByBlockNumberAndIndex!: (block: BlockIdentifier, txIndex: Quantity) => Promise<TransactionObject>
  /**
   * Returns the receipt of a transaction by transaction hash.
   * Note That the receipt is not available for pending transactions.
   */
  @inject eth_getTransactionReceipt!: (hash: TxHash) => Promise<TransactionReceipt>

  /** Returns information about a uncle of a block by hash and uncle index position. */
  @inject eth_getUncleByBlockHashAndIndex!: (blockHash: TxHash, index: Quantity) => Promise<BlockObject>

  /** Returns information about a uncle of a block by number and uncle index position. */
  @inject eth_getUncleByBlockNumberAndIndex!: (block: BlockIdentifier, index: Quantity) => Promise<BlockObject>

  /**
   * Creates a filter object, based on filter options, to notify when the state changes (logs). To check if the state
   * has changed, call eth_getFilterChanges.
   *
   * A note on specifying topic filters:
   * Topics are order-dependent. A transaction with a log with topics [A, B] will be matched by the following topic
   * filters:
   *
   * [] "anything"
   * [A] "A in first position (and anything after)"
   * [null, B] "anything in first position AND B in second position (and anything after)"
   * [A, B] "A in first position AND B in second position (and anything after)"
   * [[A, B], [A, B]] "(A OR B) in first position AND (A OR B) in second position (and anything after)"
   */
  @inject eth_newFilter!: (options: FilterOptions) => Promise<Data> // this should be quantity

  /**
   * Creates a filter in the node, to notify when a new block arrives. To check if the state has changed, call
   * eth_getFilterChanges.
   */
  @inject eth_newBlockFilter!: () => Promise<Data> // this should be quantity

  /**
   * Creates a filter in the node, to notify when new pending transactions arrive. To check if the state has changed,
   * call eth_getFilterChanges.
   */
  @inject eth_newPendingTransactionFilter!: () => Promise<Data> // this should be quantity

  /**
   * Uninstalls a filter with given id. Should always be called when watch is no longer needed. Additonally Filters
   * timeout when they aren't requested with eth_getFilterChanges for a period of time.
   */
  @inject eth_uninstallFilter!: (filterId: Data) => Promise<boolean>

  /**
   * Polling method for a filter, which returns an array of logs which occurred since last poll.
   */
  @inject eth_getFilterChanges!: (filterId: Data) => Promise<Array<TxHash> | Array<LogObject>>

  /** Returns an array of all logs matching filter with given id. */
  @inject eth_getFilterLogs!: (filterId: Data) => Promise<Array<TxHash> | Array<LogObject>>

  /** Returns an array of all logs matching a given filter object. */
  @inject eth_getLogs!: (options: FilterOptions) => Promise<Array<TxHash> | Array<LogObject>>

  /**
   * Returns the hash of the current block, the seedHash, and the boundary condition to be met ("target").
   *
   * @returns Array with the following properties:
   * @alpha
   *
   * DATA, 32 Bytes - current block header pow-hash
   * DATA, 32 Bytes - the seed hash used for the DAG.
   * DATA, 32 Bytes - the boundary condition ("target"), 2^256 / difficulty.
   */
  @inject eth_getWork!: (blockHeaderHash: Data) => Promise<Array<TxHash>>

  /** Used for submitting a proof-of-work solution. */
  @inject eth_submitWork!: (data: Data, powHash: TxHash, digest: TxHash) => Promise<boolean>

  /** Used for submitting mining hashrate. */
  @inject eth_submitHashrate!: (hashRate: Data, id: Data) => Promise<boolean>

  /** Sends a whisper message. */
  @inject shh_post!: (data: SHHPost) => Promise<boolean>

  /** Returns the current whisper protocol version. */
  @inject shh_version!: () => Promise<string>

  /** Creates new whisper identity in the client. */
  @inject shh_newIdentity!: () => Promise<Data>

  /** Checks if the client hold the private keys for a given identity. */
  @inject shh_hasIdentity!: (identity: Data) => Promise<boolean>
  @inject shh_newGroup!: () => Promise<Data>
  @inject shh_addToGroup!: (group: Data) => Promise<boolean>

  /** Creates filter to notify, when client receives whisper message matching the filter options. */
  @inject shh_newFilter!: (options: SHHFilterOptions) => Promise<Data> // this should be quantity

  /**
   * Uninstalls a filter with given id. Should always be called when watch is no longer needed.
   * Additonally Filters timeout when they aren't requested with shh_getFilterChanges for a period of time.
   */
  @inject shh_uninstallFilter!: (filterId: Data) => Promise<boolean>

  /**
   * Polling method for whisper filters. Returns new messages since the last call of this method.
   *
   * Note calling the shh_getMessages method, will reset the buffer for this method, so that you won't receive duplicate
   * messages.
   */
  @inject shh_getFilterChanges!: (filterId: Data) => Promise<Array<SHHFilterMessage>>

  /** Get all messages matching a filter. Unlike shh_getFilterChanges this returns all messages. */
  @inject shh_getMessages!: (filterId: Data) => Promise<Array<SHHFilterMessage>>

  /**
   * Decrypts the key with the given address from the key store.
   *
   * Both passphrase and unlock duration are optional when using the JavaScript console. If the passphrase is not
   * supplied as an argument, the console will prompt for the passphrase interactively.
   *
   * The unencrypted key will be held in memory until the unlock duration expires. If the unlock duration defaults to
   * 300 seconds. An explicit duration of zero seconds unlocks the key until geth exits.
   *
   * The account can be used with eth_sign and eth_sendTransaction while it is unlocked.
   */
  @inject personal_unlockAccount!: (account: Address, passPhrase?: Data, seconds?: Quantity) => Promise<boolean>

  /**
   * Generates a new private key and stores it in the key store directory. The key file is encrypted with the given
   * passphrase. Returns the address of the new account.
   *
   * At the geth console, newAccount will prompt for a passphrase when it is not supplied as the argument.
   */
  @inject personal_newAccount!: (passPhrase: Data) => Promise<Address>

  /** Returns all the Ethereum account addresses of all keys in the key store. */
  @inject personal_listAccounts!: () => Promise<Array<Address>>

  /** Removes the private key with given address from memory. The account can no longer be used to send transactions. */
  @inject personal_lockAccount!: (address: Address) => Promise<boolean>

  /**
   * Imports the given unencrypted private key (hex string) into the key store, encrypting it with the passphrase.
   * Returns the address of the new account.
   */
  @inject personal_importRawKey!: (keydata: Data, passPhrase: Data) => Promise<Address>

  /**
   * Imports the given unencrypted private key (hex string) into the key store, encrypting it with the passphrase.
   * Returns the address of the new account.
   */
  @inject personal_sendTransaction!: (txObject: TransactionOptions, passPhrase: Data) => Promise<TxHash>

  /**
   * The sign method calculates an Ethereum specific signature with:
   *   sign(keccack256("Ethereum Signed Message:" + len(message) + message))).
   *
   * By adding a prefix to the message makes the calculated signature recognisable as an Ethereum specific signature.
   * This prevents misuse where a malicious DApp can sign arbitrary data (e.g. transaction) and use the signature to
   * impersonate the victim.
   *
   * See ecRecover to verify the signature.
   */
  @inject personal_sign!: (data: Data, signerAddress: Address, passPhrase: Data) => Promise<Data>

  /**
   * ecRecover returns the address associated with the private key that was used to calculate the signature in
   * personal_sign.
   */
  @inject personal_ecRecover!: (message: Data, signature: Data) => Promise<Address>

  constructor(public provider: any) {
    // stub
  }

  /**
   * Should be used to asynchronously send request
   *
   * @param data - The RPC message to be sent
   */
  async sendAsync(data: RPCSendableMessage) {
    const provider = await this.provider

    /* istanbul ignore if */
    if (!provider) {
      throw InvalidProvider()
    }

    const payload = toJsonRpcRequest(data.method, data.params)

    const defer = future()

    this.requests.set(payload.id, defer)

    provider.sendAsync(payload, (err: any, result: any) => {
      this.requests.delete(payload.id)

      if (err) {
        defer.reject(err)
        return
      }

      /* istanbul ignore if */
      if (!isValidResponse(result)) {
        defer.reject(InvalidResponse(result))
        return
      }
      defer.resolve(result.result)
    })

    return defer
  }

  /**
   * Should be used to set provider of request manager
   *
   * @param p - The provider
   */
  setProvider(p: any) {
    this.provider = p
  }

  /**
   * Waits until the transaction finishes. Returns if it was successfull.
   * Throws if the transaction fails or if it lacks any of the supplied events
   * @param txId - Transaction id to watch
   */
  async getConfirmedTransaction(txId: string): Promise<FinishedTransactionAndReceipt> {
    const tx = await this.waitForCompletion(txId)

    if (this.isFailure(tx)) {
      throw new Error(`Transaction "${txId}" failed`)
    }

    return tx
  }

  /**
   * Wait until a transaction finishes by either being mined or failing
   * @param txId - Transaction id to watch
   * @param retriesOnEmpty - Number of retries when a transaction status returns empty
   */
  async waitForCompletion(txId: string, retriesOnEmpty?: number): Promise<FinishedTransactionAndReceipt> {
    const txIdString = inputTransactionId(txId)
    const isDropped = await this.isTxDropped(txIdString, retriesOnEmpty)

    if (isDropped) {
      const tx = await this.getTransactionAndReceipt(txIdString)
      return { ...tx, status: TransactionStatus.failed }
    }

    while (true) {
      const tx = await this.getTransactionAndReceipt(txIdString)

      if (!this.isPending(tx) && tx.receipt) {
        return {
          ...tx,
          status: this.isFailure(tx) ? TransactionStatus.failed : TransactionStatus.confirmed
        }
      }

      await sleep(TRANSACTION_FETCH_DELAY)
    }
  }

  /**
   * Returns a transaction in any of the possible states.
   * @param txId - The transaction ID
   */
  async getTransaction(txId: string): Promise<Transaction | null> {
    let currentNonce: number | null = null
    let status: TransactionObject
    const hash = inputTransactionId(txId)

    try {
      const accounts = await this.eth_accounts()
      const account = accounts[0]
      if (account) {
        currentNonce = await this.eth_getTransactionCount(account, 'latest')
      }
    } catch (error) {
      currentNonce = null
    }

    try {
      status = await this.eth_getTransactionByHash(hash)
      // not found
      if (status === null) {
        return null
      }
    } catch (e) {
      return null
    }

    if (status.blockNumber === null) {
      if (currentNonce !== null) {
        // replaced
        if (status.nonce < currentNonce) {
          const tx: ReplacedTransaction = {
            hash,
            type: TransactionType.replaced,
            nonce: status.nonce
          }
          return tx
        }

        // queued
        if (status.nonce > currentNonce) {
          const tx: QueuedTransaction = {
            hash,
            type: TransactionType.queued,
            nonce: status.nonce
          }
          return tx
        }
      }

      // pending
      const tx: PendingTransaction = {
        type: TransactionType.pending,
        ...status
      }
      return tx
    }

    let receipt: TransactionReceipt

    try {
      receipt = await this.eth_getTransactionReceipt(hash)

      // reverted
      if (receipt === null || receipt.status === 0x0) {
        const tx: RevertedTransaction = {
          type: TransactionType.reverted,
          ...status
        }
        return tx
      }
    } catch (e) {
      // TODO: should this be null or reverted?
      return null
    }

    // confirmed
    const tx: ConfirmedTransaction = {
      type: TransactionType.confirmed,
      ...status,
      receipt
    }
    return tx
  }

  /**
   * Wait retryAttemps * TRANSACTION_FETCH_DELAY for a transaction status to be in the mempool
   * @param txId - Transaction id to watch
   * @param retryAttemps - Number of retries when a transaction status returns empty
   */
  async isTxDropped(txId: string, _retryAttemps: number = 15): Promise<boolean> {
    let retryAttemps = _retryAttemps

    while (retryAttemps > 0) {
      const tx = await this.getTransactionAndReceipt(txId)

      if (tx !== null) {
        return false
      }

      retryAttemps -= 1
      await sleep(TRANSACTION_FETCH_DELAY)
    }

    return true
  }

  /**
   * Get the transaction status and receipt
   * @param txId - Transaction id
   */
  // prettier-ignore
  async getTransactionAndReceipt(txId: string): Promise<TransactionAndReceipt> {
    txId = inputTransactionId(txId)
    const [tx, receipt] = await Promise.all([
      this.eth_getTransactionByHash(txId),
      this.eth_getTransactionReceipt(txId)
    ])

    return { ...tx, receipt }
  }

  /**
   * Expects the result of getTransaction's geth command and returns true if the transaction is still pending.
   * It'll also check for a pending status prop against TRANSACTION_STATUS
   * @param tx - The transaction object
   */
  // tslint:disable-next-line:prefer-function-over-method
  isPending(tx: TransactionAndReceipt): boolean {
    return tx && tx.blockNumber === null
  }

  /**
   * Expects the result of getTransactionRecepeit's geth command and returns true if the transaction failed.
   * It'll also check for a failed status prop against TRANSACTION_STATUS
   * @param tx - The transaction object
   */
  // tslint:disable-next-line:prefer-function-over-method
  isFailure(tx: TransactionAndReceipt): boolean {
    return tx && (!tx.receipt || tx.receipt.status === 0)
  }
}
