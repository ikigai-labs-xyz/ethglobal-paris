const { network, ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async hre => {
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log(`Starting funding protocols`)

  const nonFirewalledProtocol = await ethers.getContract("NonFirewalledProtocol", deployer)
  const nonFirewalledProtocolAddress = await nonFirewalledProtocol.getAddress()

  const firewalledProtocol = await ethers.getContract("FirewalledProtocol", deployer)
  const firewalledProtocolAddress = await firewalledProtocol.getAddress()

  const usdc = await ethers.getContract("Usdc", deployer)

  const totalAmountRaw = ethers.parseEther("10000000")
  const depositAmountRaw = totalAmountRaw / 2n
  const totalAmount = String(totalAmountRaw)
  const depositAmount = String(depositAmountRaw)

  // mint 10 million USDC to the deployer
  const mintTx = await usdc.mint(deployer, totalAmount)
  await mintTx.wait(1)
  log(`Minted 10 million USDC to deployer (${deployer})`)

  const approveNonFirewalledProtocol = await usdc.approve(nonFirewalledProtocolAddress, ethers.MaxUint256)
  await approveNonFirewalledProtocol.wait(1)
  log(`Approved infinite USDC to non-protected protocol (${nonFirewalledProtocolAddress}) from deployer`)
  const approveFirewalledProtocol = await usdc.approve(firewalledProtocolAddress, ethers.MaxUint256)
  await approveFirewalledProtocol.wait(1)
  log(`Approved infinite USDC to protected (firewalled) protocol (${firewalledProtocolAddress}) from deployer`)

  // deposit 5million into the non firewalled protocol from deployer
  await nonFirewalledProtocol.deposit(depositAmount)
  log(`Deposited 5 million USDC to non-protected protocol (${nonFirewalledProtocolAddress}) from deployer`)

  // deposit 5million into the firewalled protocol from deployer
  await firewalledProtocol.deposit(depositAmount)
  log(`Deposited 5 million USDC to protected (firewalled) protocol (${firewalledProtocolAddress}) from deployer`)

  log("---------------------------------")
}

module.exports.tags = ["all", "FundProtocols"]
