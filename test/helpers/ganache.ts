import ganache from 'ganache'

export function createGanacheProvider() {
  const provider = ganache.provider<'ethereum'>({
    chain: {
      networkId: 3,
      vmErrorsOnRPCResponse: true
    },
    wallet: {
      accounts: [
        {
          balance: '0xFFFFFFFFFFFFFFFFFFFFFFFF',
          secretKey: '0x8485898485bbe08a0a9b97fdf695aec8e9f1d196c589d4b6ff50a0232518b682'
        }
      ],
      defaultBalance: 999999
    }
  })
  return provider
}

export function createGanacheServer() {
  return ganache.server<'ethereum'>({
    chain: {
      networkId: 3,
      vmErrorsOnRPCResponse: true
    },
    wallet: {
      accounts: [
        {
          balance: '0xFFFFFFFFFFFFFFFFFFFFFFFF',
          secretKey: '0x8485898485bbe08a0a9b97fdf695aec8e9f1d196c589d4b6ff50a0232518b682'
        }
      ],
      defaultBalance: 999999
    },
    server: {
      ws: true
    }
  })
}
