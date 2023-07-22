const { network, ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")

module.exports = async hre => {
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const waitBlockConfirmations = 1

  /***********************************
   *
   * Deploy USDC smart contract
   *
   ************************************/

  log("---------------------------------")
  log(`Deploy Usdc with owner : ${deployer}`)

  const arguments = []
  const usdc = await deploy("Usdc", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  })
}

module.exports.tags = ["all", "Usdc"]
