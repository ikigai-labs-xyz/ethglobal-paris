const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("AttackContract", () => {
      //   let attacker,
      //     attackerSigner,
      //     attackContract,
      //     attackContractAddress,
      //     usdc,
      //     lendingBorrowing,
      //     turtleshell,
      //     lendingBorrowingAddress
      //   const depositAmount = ethers.parseUnits("5000", 6)
      //   const withdrawAmount = ethers.parseUnits("30", 6)
      //   beforeEach(async () => {
      //     await deployments.fixture(["TurtleShellFirewall", "usdc"])
      //     deployer = (await getNamedAccounts()).deployer
      //     user = (await getNamedAccounts()).user1
      //     attacker = (await getNamedAccounts()).user2
      //     usdc = await ethers.getContract("Usdc", deployer)
      //     const usdcTokenAddress = await usdc.getAddress()
      //     turtleshell = await ethers.getContract("TurtleShellFirewall", deployer)
      //     const turtleshellAddress = await turtleshell.getAddress()
      //     lendingBorrowing = await ethers.deployContract("LendingBorrowing", [usdcTokenAddress, turtleshellAddress], {})
      //     lendingBorrowingAddress = await lendingBorrowing.getAddress()
      //     await lendingBorrowing.initialize()
      //     attackerSigner = await ethers.getSigner(attacker)
      //     await usdc.mint(attacker, depositAmount)
      //     await usdc.connect(attackerSigner).approve(lendingBorrowingAddress, ethers.MaxInt256)
      //     attackContract = await ethers.deployContract("AttackContract", [usdcTokenAddress, lendingBorrowingAddress])
      //     attackContractAddress = await attackContract.getAddress()
      //   })
      //   it.only("exploits the reentrancy vulnerability", async () => {
      //     const initialBalance = await usdc.balanceOf(attacker)
      //     // Transfer some USDC from the attacker's wallet to the AttackContract
      //     await usdc.connect(attackerSigner).transfer(attackContractAddress, depositAmount)
      //     await attackContract.connect(attackerSigner).attack(depositAmount)
      //     await attackContract.connect(attackerSigner).steal()
      //     const finalBalance = await usdc.balanceOf(attacker)
      //     console.log("finalBalance", finalBalance.toString())
      //     assert.isTrue(
      //       finalBalance > initialBalance,
      //       "AttackContract did not manage to exploit the reentrancy vulnerability",
      //     )
      //   })
    })
