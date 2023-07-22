const { getNamedAccounts, ethers } = require("hardhat")

const main = async hre => {
  const { user1 } = await getNamedAccounts()
  const usdc = await ethers.getContract("Usdc")
  const attackContract = await ethers.getContract("AttackContract")
  const attackContractAddress = await attackContract.getAddress()
  console.log(`Attack contract address: ${attackContractAddress}`)

  const nonFirewalledProtocol = await ethers.getContract("NonFirewalledProtocol")
  const nonFirewalledProtocolAddress = await nonFirewalledProtocol.getAddress()
  console.log(`Non firewalled protocol address: ${nonFirewalledProtocolAddress}`)

  // usdc balance before hack of protocol
  const usdcBalanceBeforeProtocol = await usdc.balanceOf(nonFirewalledProtocolAddress)
  console.log(`USDC balance of non firewalled protocol before hack: ${usdcBalanceBeforeProtocol.toString()}`)

  // usdc balance of attacker before hack
  const usdcBalanceBeforeAttacker = await usdc.balanceOf(attackContractAddress)
  console.log(`USDC balance of attacker before hack: ${usdcBalanceBeforeAttacker.toString()}`)

  const attackTx = await attackContract.attack(nonFirewalledProtocolAddress)
  await attackTx.wait()

  console.log(`Attack complete`)
  // usdc balance of non firewalled protocol
  const usdcBalanceProtocol = await usdc.balanceOf(nonFirewalledProtocolAddress)
  console.log(`USDC balance of non firewalled protocol: ${usdcBalanceProtocol.toString()}`)
  // usdc balance of attacker
  const usdcBalanceAttacker = await usdc.balanceOf(attackContractAddress)
  console.log(`USDC balance of attacker: ${usdcBalanceAttacker.toString()}`)
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
