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

import formatters = require('../utils/formatters')
import { Method } from '../Method'
import { Property } from '../Property'

export namespace personal {
  export const newAccount = new Method({
    name: 'newAccount',
    call: 'personal_newAccount',
    params: 1,
    inputFormatter: [null]
  })

  export const importRawKey = new Method({
    name: 'importRawKey',
    call: 'personal_importRawKey',
    params: 2
  })

  export const sign = new Method({
    name: 'sign',
    call: 'personal_sign',
    params: 3,
    inputFormatter: [null, formatters.inputAddressFormatter, null]
  })

  export const ecRecover = new Method({
    name: 'ecRecover',
    call: 'personal_ecRecover',
    params: 2
  })

  export const unlockAccount = new Method({
    name: 'unlockAccount',
    call: 'personal_unlockAccount',
    params: 3,
    inputFormatter: [formatters.inputAddressFormatter, null, null]
  })

  export const sendTransaction = new Method({
    name: 'sendTransaction',
    call: 'personal_sendTransaction',
    params: 2,
    inputFormatter: [formatters.inputTransactionFormatter, null]
  })

  export const lockAccount = new Method({
    name: 'lockAccount',
    call: 'personal_lockAccount',
    params: 1,
    inputFormatter: [formatters.inputAddressFormatter]
  })

  export const listAccounts = new Property({
    name: 'listAccounts',
    getter: 'personal_listAccounts'
  })
}
