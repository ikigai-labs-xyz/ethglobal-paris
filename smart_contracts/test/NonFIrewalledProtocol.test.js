const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("NonFirewalledProtocol", () => {
      let deployer, user, NonFirewalledProtocol, nonFirewalledProtocolAddress, usdc
      const depositAmount = ethers.parseUnits("5000", 6)
      const withdrawAmount = ethers.parseUnits("30", 6)

      beforeEach(async () => {
        await deployments.fixture(["Usdc"])

        deployer = (await getNamedAccounts()).deployer
        user = (await getNamedAccounts()).user1

        usdc = await ethers.getContract("Usdc", deployer)
        const usdcTokenAddress = await usdc.getAddress()

        NonFirewalledProtocol = await ethers.deployContract("NonFirewalledProtocol", [usdcTokenAddress], {})
        nonFirewalledProtocolAddress = await NonFirewalledProtocol.getAddress()

        const amount = ethers.parseUnits("10000", 6)
        await usdc.mint(deployer, amount)

        await usdc.approve(nonFirewalledProtocolAddress, ethers.MaxInt256)
      })

      describe("deposit", () => {
        it("sets deposited amount", async () => {
          await NonFirewalledProtocol.deposit(depositAmount)

          const balanceDeployer = await NonFirewalledProtocol.balances(deployer)
          assert.equal(balanceDeployer.toString(), depositAmount.toString())

          const balanceUser = await NonFirewalledProtocol.balances(user)
          assert.equal(balanceUser.toString(), "0")
        })

        it("transfers funds from user to contract", async () => {
          const startFirewalledProtocolBalance = await usdc.balanceOf(nonFirewalledProtocolAddress)
          assert.equal(startFirewalledProtocolBalance.toString(), "0")

          const startDeployerBalance = await usdc.balanceOf(deployer)

          await NonFirewalledProtocol.deposit(depositAmount)

          const finalDeployerBalance = await usdc.balanceOf(deployer)
          assert.equal(finalDeployerBalance.toString(), (startDeployerBalance - depositAmount).toString())

          const finalFirewalledProtocolBalance = await usdc.balanceOf(nonFirewalledProtocolAddress)
          assert.equal(
            finalFirewalledProtocolBalance.toString(),
            (startFirewalledProtocolBalance + depositAmount).toString(),
          )
        })

        it("tracks total TVL by itself", async () => {
          const tvlBefore = await NonFirewalledProtocol.getTVL()
          await NonFirewalledProtocol.deposit(depositAmount)
          const tvlAfter = await NonFirewalledProtocol.getTVL()

          assert.equal(tvlAfter.toString(), (tvlBefore + depositAmount).toString())
        })
      })

      describe("withdraw", () => {
        beforeEach(async () => {
          await NonFirewalledProtocol.deposit(depositAmount)
        })

        it("sets withdrawn amount", async () => {
          await NonFirewalledProtocol.withdraw(withdrawAmount)

          const balanceDeployer = await NonFirewalledProtocol.balances(deployer)
          assert.equal(balanceDeployer.toString(), (depositAmount - withdrawAmount).toString())
        })

        it("transfers funds from contract to user", async () => {
          const startFirewalledProtocolBalance = await usdc.balanceOf(nonFirewalledProtocolAddress)

          const startDeployerBalance = await usdc.balanceOf(deployer)

          await NonFirewalledProtocol.withdraw(withdrawAmount)

          const finalDeployerBalance = await usdc.balanceOf(deployer)
          assert.equal(finalDeployerBalance.toString(), (startDeployerBalance + withdrawAmount).toString())

          const finalFirewalledProtocolBalance = await usdc.balanceOf(nonFirewalledProtocolAddress)
          assert.equal(
            finalFirewalledProtocolBalance.toString(),
            (startFirewalledProtocolBalance - withdrawAmount).toString(),
          )
        })

        it("tracks total TVL by itself", async () => {
          const tvlBefore = await NonFirewalledProtocol.getTVL()
          await NonFirewalledProtocol.withdraw(depositAmount)
          const tvlAfter = await NonFirewalledProtocol.getTVL()

          assert.equal(tvlAfter.toString(), (tvlBefore - depositAmount).toString())
        })

        describe("Withdraw more than 15% of the total TVL", () => {
          it("does not revert", async () => {
            const largeWithdrawAmount = ethers.parseUnits("2000", 6)
            await NonFirewalledProtocol.withdraw(largeWithdrawAmount)
          })
        })
      })
    })
