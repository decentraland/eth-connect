import { testAllProviders } from './helpers/testAllProviders'
import { doCatalystTest } from './integration.catalyst'
import { doOverloadTest } from './integration.overload'
import { doEscrowTest } from './integration.escrow'
import { doERC20Test } from './integration.erc20'
import { doEventsTest } from './integration.events'
import { doPersonalTest } from './integration.personal'

describe('integration', function () {
  testAllProviders((rm) => {
    doCatalystTest(rm)
    doOverloadTest(rm)
    doEscrowTest(rm)
    doERC20Test(rm)
    doEventsTest(rm)
    doPersonalTest(rm)
  })
})
