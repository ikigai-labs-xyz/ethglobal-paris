const { network, ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async hre => {
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer, user1 } = await getNamedAccounts()

  log(`Starting Firewalled protocol setup`)

  const firewalledProtocol = await ethers.getContract("FirewalledProtocol", deployer)
  const firewalledProtocolAddress = await firewalledProtocol.getAddress()

  const turtleShellFreezer = await ethers.getContract("TurtleShellFreezer", deployer)
  const turtleShellFreezerAddress = await turtleShellFreezer.getAddress()

  const setProtocolTx = await turtleShellFreezer.setProtocol(firewalledProtocolAddress)
  await setProtocolTx.wait(1)
  log(
    `Set the FirewalledProtocol (${firewalledProtocolAddress}) as the protocol address in the freezer contract ${turtleShellFreezerAddress}`,
  )

  // transfer ownership to timelock
  const timelock = await ethers.getContract("TimeLock", deployer)
  const timelockAddress = await timelock.getAddress()
  const transferOwnershipTx = await firewalledProtocol.transferOwnership(timelockAddress)
  await transferOwnershipTx.wait(1)
  log(
    `Transferred ownership of the FirewalledProtocol (${firewalledProtocolAddress}) to the timelock (${timelockAddress})`,
  )

  const transferOwnershipOfFreezerTx = await turtleShellFreezer.transferOwnership(timelockAddress)
  await transferOwnershipOfFreezerTx.wait(1)
  log(`Transferred ownership of TurtleShellFreezer (${turtleShellFreezerAddress}) to the timelock (${timelockAddress})`)

  log("---------------------------------")
}

module.exports.tags = ["all", "SetupFirewalledProtocol"]
