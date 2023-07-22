const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
require("dotenv").config()
const { vote } = require("../utils/governance/governance")

const main = async hre => {
  const governor = await ethers.getContract("ProtocolGovernor")
  const proposalId = process.argv[2] // Get proposalId from command line argument
  const voteWay = 1
  const reason = "I vote yes"
  await vote(governor, proposalId, voteWay, reason)
  console.log("Voted successfully")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
