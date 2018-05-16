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

import { Method } from '../Method'

/// @returns an array of objects describing web3.eth.filter api methods
export function eth() {
  let newFilterCall = function(args) {
    let type = args[0]

    switch (type) {
      case 'latest':
        args.shift()
        this.params = 0
        return 'eth_newBlockFilter'
      case 'pending':
        args.shift()
        this.params = 0
        return 'eth_newPendingTransactionFilter'
      default:
        return 'eth_newFilter'
    }
  }

  let newFilter = new Method({
    name: 'newFilter',
    call: newFilterCall,
    params: 1
  })

  let uninstallFilter = new Method({
    name: 'uninstallFilter',
    call: 'eth_uninstallFilter',
    params: 1
  })

  let getLogs = new Method({
    name: 'getLogs',
    call: 'eth_getFilterLogs',
    params: 1
  })

  let poll = new Method({
    name: 'poll',
    call: 'eth_getFilterChanges',
    params: 1
  })

  return [newFilter, uninstallFilter, getLogs, poll]
}

/// @returns an array of objects describing web3.shh.watch api methods
export function shh() {
  return [
    new Method({
      name: 'newFilter',
      call: 'shh_newMessageFilter',
      params: 1
    }),
    new Method({
      name: 'uninstallFilter',
      call: 'shh_deleteMessageFilter',
      params: 1
    }),
    new Method({
      name: 'getLogs',
      call: 'shh_getFilterMessages',
      params: 1
    }),
    new Method({
      name: 'poll',
      call: 'shh_getFilterMessages',
      params: 1
    })
  ]
}
