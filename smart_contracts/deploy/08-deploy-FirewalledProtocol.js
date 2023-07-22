const { network, ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async hre => {
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS

  /***********************************
   *
   * Deploy smart contract
   *
   ************************************/

  log("---------------------------------")
  log(`Deploy with owner : ${deployer}`)

  const usdc = await ethers.getContract("Usdc", deployer)
  const usdcAddress = await usdc.getAddress()

  const turtleshell = await ethers.getContract("TurtleShellFirewall", deployer)
  const turtleshellAddress = await turtleshell.getAddress()

  const turtleShellFreezer = await ethers.getContract("TurtleShellFreezer", deployer)
  const turtleShellFreezerAddress = await turtleShellFreezer.getAddress()

  const arguments = [usdcAddress, turtleshellAddress, turtleShellFreezerAddress]
  await deploy("FirewalledProtocol", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
    /* adjust if ProviderError: transaction underpriced */
    //gasPrice: ethers.parseUnits("200", "gwei"),
    //gasLimit: 30000000,
  })

  log("---------------------------------")
  log(`deployed with owner : ${deployer}`)

  const firewalledProtocol = await ethers.getContract("FirewalledProtocol", deployer)
  const firewalledProtocolAddress = await firewalledProtocol.getAddress()

  const initializeTx = await firewalledProtocol.initialize()
  await initializeTx.wait(1)
  log(`Initialized FirewalledProtocol ${firewalledProtocolAddress}`)

  /***********************************
   *
   *  Verify the deployment
   *
   ************************************/
  // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
  // 	log(`Verifying ${contractAddress} ...`)
  // 	await verify(contractAddress, arguments)
  // }
  log("----------------------------------------------------")
}

module.exports.tags = ["all", "FirewalledProtocol"]
