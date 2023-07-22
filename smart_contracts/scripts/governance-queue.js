const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
require("dotenv").config()
const { queue } = require("../utils/governance/governance")

async function main() {
  const governor = await ethers.getContract("ProtocolGovernor")
  const governanceToken = await ethers.getContract("GovernanceToken")
  const governanceTokenAddress = await governanceToken.getAddress()
  const user = process.argv[2] // Get user address from command line argument
  const tokenAddress = process.argv[3] // Get token address from command line argument
  const proposal_description = process.argv[4] // Get proposal description from command line argument
  const transferCalldata = governanceToken.interface.encodeFunctionData("unlockFunds", [user, tokenAddress])

  await queue(governor, [governanceTokenAddress], [0], [transferCalldata], proposal_description)
  console.log("Queued successfully")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
