import * as ganache from 'ganache-cli'

export type ConnectionOptions = {
  accounts?: Array<object>
  debug?: boolean
  logger?: object | Function
  mnemonic?: string
  port?: number
  seed?: string
  total_accounts?: number
  fork?: string
  network_id?: number
  time?: Date
  locked?: boolean
  unlocked_accounts?: Array<string>
  db_path?: string
  account_keys_path?: string
  default_balance_ether?: number
  vmErrorsOnRPCResponse?: boolean
  ws: boolean
}

export class NodeConnectionFactory {
  connectionOptions: ConnectionOptions

  constructor(options?: ConnectionOptions) {
    this.assignConnectionOptions(options)
  }

  createProvider() {
    return ganache.provider(this.connectionOptions)
  }

  createServer() {
    return ganache.server(this.connectionOptions)
  }

  private assignConnectionOptions(options?: ConnectionOptions) {
    this.connectionOptions = {
      accounts: [
        {
          balance: '0xFFFFFFFFFFFFFFFFFFFFFFFF',
          secretKey: '0x8485898485bbe08a0a9b97fdf695aec8e9f1d196c589d4b6ff50a0232518b682'
        }
      ],
      network_id: 3,
      // logger: {
      //   log(...args) {
      //   }
      // },
      default_balance_ether: 999999,
      vmErrorsOnRPCResponse: true,
      ws: true,
      ...options
    }
  }
}
