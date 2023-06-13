import ganache from 'ganache'

export class NodeConnectionFactory {
  connectionOptions = {
    accounts: [
      {
        balance: '0xFFFFFFFFFFFFFFFFFFFFFFFF',
        secretKey: '0x8485898485bbe08a0a9b97fdf695aec8e9f1d196c589d4b6ff50a0232518b682'
      }
    ],
    network_id: 3,
    logger: {
      log(..._args) {}
    },
    default_balance_ether: 999999,
    vmErrorsOnRPCResponse: true,
    ws: true
  }

  createProvider() {
    return ganache.provider(this.connectionOptions)
  }

  createServer() {
    return ganache.server(this.connectionOptions)
  }
}
