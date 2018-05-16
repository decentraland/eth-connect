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
import { Property } from '../Property'

export namespace swarm {
  export const blockNetworkRead = new Method({
    name: 'blockNetworkRead',
    call: 'bzz_blockNetworkRead',
    params: 1,
    inputFormatter: [null]
  })

  export const syncEnabled = new Method({
    name: 'syncEnabled',
    call: 'bzz_syncEnabled',
    params: 1,
    inputFormatter: [null]
  })

  export const swapEnabled = new Method({
    name: 'swapEnabled',
    call: 'bzz_swapEnabled',
    params: 1,
    inputFormatter: [null]
  })

  export const download = new Method({
    name: 'download',
    call: 'bzz_download',
    params: 2,
    inputFormatter: [null, null]
  })

  export const upload = new Method({
    name: 'upload',
    call: 'bzz_upload',
    params: 2,
    inputFormatter: [null, null]
  })

  export const retrieve = new Method({
    name: 'retrieve',
    call: 'bzz_retrieve',
    params: 1,
    inputFormatter: [null]
  })

  export const store = new Method({
    name: 'store',
    call: 'bzz_store',
    params: 2,
    inputFormatter: [null, null]
  })

  export const get = new Method({
    name: 'get',
    call: 'bzz_get',
    params: 1,
    inputFormatter: [null]
  })

  export const put = new Method({
    name: 'put',
    call: 'bzz_put',
    params: 2,
    inputFormatter: [null, null]
  })

  export const modify = new Method({
    name: 'modify',
    call: 'bzz_modify',
    params: 4,
    inputFormatter: [null, null, null, null]
  })

  export const hive = new Property({
    name: 'hive',
    getter: 'bzz_hive'
  })

  export const info = new Property({
    name: 'info',
    getter: 'bzz_info'
  })
}
