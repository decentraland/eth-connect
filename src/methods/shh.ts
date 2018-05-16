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
/** @file shh.js
 * @authors:
 *   Fabian Vogelsteller <fabian@ethereum.org>
 *   Marek Kotewicz <marek@ethcore.io>
 * @date 2017
 */

import { Method } from '../Method'
import { Filter } from '../Filter'
import watches = require('./watches')

export namespace shh {
  export function newMessageFilter(options, filterCreationErrorCallback?) {
    return new Filter(options, 'shh', this._requestManager, watches.shh(), null, filterCreationErrorCallback)
  }

  export const version = new Method({
    name: 'version',
    call: 'shh_version',
    params: 0
  })
  export const info = new Method({
    name: 'info',
    call: 'shh_info',
    params: 0
  })
  export const setMaxMessageSize = new Method({
    name: 'setMaxMessageSize',
    call: 'shh_setMaxMessageSize',
    params: 1
  })
  export const setMinPoW = new Method({
    name: 'setMinPoW',
    call: 'shh_setMinPoW',
    params: 1
  })
  export const markTrustedPeer = new Method({
    name: 'markTrustedPeer',
    call: 'shh_markTrustedPeer',
    params: 1
  })
  export const newKeyPair = new Method({
    name: 'newKeyPair',
    call: 'shh_newKeyPair',
    params: 0
  })
  export const addPrivateKey = new Method({
    name: 'addPrivateKey',
    call: 'shh_addPrivateKey',
    params: 1
  })
  export const deleteKeyPair = new Method({
    name: 'deleteKeyPair',
    call: 'shh_deleteKeyPair',
    params: 1
  })
  export const hasKeyPair = new Method({
    name: 'hasKeyPair',
    call: 'shh_hasKeyPair',
    params: 1
  })
  export const getPublicKey = new Method({
    name: 'getPublicKey',
    call: 'shh_getPublicKey',
    params: 1
  })
  export const getPrivateKey = new Method({
    name: 'getPrivateKey',
    call: 'shh_getPrivateKey',
    params: 1
  })
  export const newSymKey = new Method({
    name: 'newSymKey',
    call: 'shh_newSymKey',
    params: 0
  })
  export const addSymKey = new Method({
    name: 'addSymKey',
    call: 'shh_addSymKey',
    params: 1
  })
  export const generateSymKeyFromPassword = new Method({
    name: 'generateSymKeyFromPassword',
    call: 'shh_generateSymKeyFromPassword',
    params: 1
  })
  export const hasSymKey = new Method({
    name: 'hasSymKey',
    call: 'shh_hasSymKey',
    params: 1
  })
  export const getSymKey = new Method({
    name: 'getSymKey',
    call: 'shh_getSymKey',
    params: 1
  })
  export const deleteSymKey = new Method({
    name: 'deleteSymKey',
    call: 'shh_deleteSymKey',
    params: 1
  })

  // subscribe and unsubscribe missing

  export const post = new Method({
    name: 'post',
    call: 'shh_post',
    params: 1,
    inputFormatter: [null]
  })
}
