import { RequestManager, ContractFactory } from '../../dist'

export type Artifact = {
  abi: any[]
  bytecode: string
}

export async function deployContract(
  requestManager: RequestManager,
  account: string,
  name: string,
  contract: Artifact
) {
  const newContract = new ContractFactory(requestManager, contract.abi)

  const data = await newContract.getData({ data: contract.bytecode })

  const gasEstimate = await requestManager.eth_estimateGas({
    data
  })

  console.log(`> Will deploy contract ${name} with gas: ${gasEstimate}`)

  const options = { from: account, data: contract.bytecode, gas: gasEstimate, to: null }

  return newContract.deploy(options)
}
