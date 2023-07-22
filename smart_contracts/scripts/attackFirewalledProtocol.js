const { getNamedAccounts, ethers } = require("hardhat")

const main = async hre => {
  const { user1 } = await getNamedAccounts()
  const usdc = await ethers.getContract("Usdc")
  const attackContract = await ethers.getContract("AttackContract")
  const attackContractAddress = await attackContract.getAddress()
  console.log(`Attack contract address: ${attackContractAddress}`)

  const firewalledProtocol = await ethers.getContract("FirewalledProtocol")
  const firewalledProtocolAddress = await firewalledProtocol.getAddress()
  console.log(`Non firewalled protocol address: ${firewalledProtocolAddress}`)

  // usdc balance before hack of protocol
  const usdcBalanceBeforeProtocol = await usdc.balanceOf(firewalledProtocolAddress)
  console.log(`USDC balance of non firewalled protocol before hack: ${usdcBalanceBeforeProtocol.toString()}`)

  // usdc balance of attacker before hack
  const usdcBalanceBeforeAttacker = await usdc.balanceOf(attackContractAddress)
  console.log(`USDC balance of attacker before hack: ${usdcBalanceBeforeAttacker.toString()}`)

  const attackTx = await attackContract.attack(firewalledProtocolAddress, { gasLimit: 1000000 })
  await attackTx.wait()

  console.log(`Attack complete`)
  // usdc balance of non firewalled protocol
  const usdcBalanceProtocol = await usdc.balanceOf(firewalledProtocolAddress)
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
