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

import { RPCResponse } from '../providers/common'

export let messageId = 0

export type RPCSendableMessage = {
  method: string
  params: any[]
}

/**
 * Should be called to valid json create payload object
 */
export function toPayload(method: string, params: any[]) {
  if (!method) {
    throw new Error('jsonrpc method should be specified!')
  }

  if (typeof method !== 'string') {
    throw new Error(`jsonrpc must be a string, got ${typeof method}!`)
  }
  // advance message ID
  messageId++

  return {
    jsonrpc: '2.0',
    id: messageId,
    method: method,
    params: params || []
  }
}

/**
 * Should be called to check if jsonrpc response is valid
 */
export function isValidResponse(response: RPCResponse | RPCResponse[]) {
  return Array.isArray(response) ? response.every(validateSingleMessage) : validateSingleMessage(response)

  function validateSingleMessage(message: RPCResponse) {
    return (
      !!message &&
      !('error' in message) &&
      message.jsonrpc === '2.0' &&
      typeof message.id === 'number' &&
      (message.result != null || message.result !== undefined)
    ) // only undefined is not valid json object
    // the null is not a valid response for rpc nodes
  }
}

/**
 * Should be called to create batch payload object
 *
 * @param messages - An array of objects with method (required) and params (optional) fields
 */
export function toBatchPayload(messages: RPCSendableMessage[]) {
  return messages.map(function (message) {
    return toPayload(message.method, message.params)
  })
}
