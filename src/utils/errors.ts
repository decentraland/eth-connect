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

export function InvalidNumberOfSolidityArgs(given: number, expected: number) {
  return new Error(`Invalid number of arguments to Solidity function. given: ${given}, expected: ${expected}`)
}

export function InvalidNumberOfRPCParams(methodName: string, given: number, expected: number) {
  return new Error(
    `Invalid number of input parameters to RPC method "${methodName}" given: ${given}, expected: ${expected}`
  )
}

export function InvalidConnection(host: string) {
  return new Error("CONNECTION ERROR: Couldn't connect to node " + host + '.')
}

export function InvalidProvider() {
  return new Error('Provider not set or invalid')
}

export function InvalidResponse(result: any) {
  let message =
    !!result && !!result.error && !!result.error.message
      ? result.error.message
      : 'Invalid JSON RPC response: ' + JSON.stringify(result)
  return new Error(message)
}

export function ConnectionTimeout(ms: number) {
  return new Error('CONNECTION TIMEOUT: timeout of ' + ms + ' ms achived')
}
