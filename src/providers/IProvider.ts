export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

interface ProviderConnectInfo {
  readonly chainId: string
}

interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

export type EIP1193Events = {
  connect: ProviderConnectInfo
  disconnect: ProviderRpcError
  chainChanged: string
  accountsChanged: string[]
}

export interface IEthereumProviderEIP1193 {
  request(args: RequestArguments): Promise<unknown>
  on(event: string, listener: (event: unknown) => void): IEthereumProviderEIP1193
}
