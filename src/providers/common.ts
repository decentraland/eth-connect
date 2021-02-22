export type Callback = (err: Error | null, message?: any) => void

export type RPCMessage = {
  jsonrpc: '2.0'
  id: number
  method: string
  params: any[] | { [key: string]: any }
}

export type RPCError = {
  jsonrpc: '2.0'
  id: number
  error: any
}

export type RPCResponse =
  | RPCError
  | {
      jsonrpc: '2.0'
      id: number
      result: any
    }

export function toRPC(message: RPCMessage): RPCMessage {
  message.jsonrpc = '2.0'

  if (!message.id || typeof message.id !== 'number' || Math.floor(message.id) !== message.id) {
    throw new Error(`Invalid RPC message(invalid id) message: ${JSON.stringify(message)}`)
  }

  if (!message.method || typeof message.method !== 'string' || message.method.trim().length === 0) {
    throw new Error(`Invalid RPC message(invalid method) message: ${JSON.stringify(message)}`)
  }

  if (!message.params || typeof message.params !== 'object') {
    throw new Error(`Invalid RPC message(invalid params) message: ${JSON.stringify(message)}`)
  }
  return message
}
