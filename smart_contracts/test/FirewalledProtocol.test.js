const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FirewalledProtocol", () => {
      let deployer, user, FirewalledProtocol, turtleshell, firewalledProtocolAddress, usdc
      const depositAmount = ethers.parseUnits("5000", 6)
      const withdrawAmount = ethers.parseUnits("30", 6)

      beforeEach(async () => {
        await deployments.fixture(["TurtleShellFirewall", "Usdc"])

        deployer = (await getNamedAccounts()).deployer
        user = (await getNamedAccounts()).user1

        usdc = await ethers.getContract("Usdc", deployer)
        const usdcTokenAddress = await usdc.getAddress()
        turtleshell = await ethers.getContract("TurtleShellFirewall", deployer)
        const turtleshellAddress = await turtleshell.getAddress()

        FirewalledProtocol = await ethers.deployContract(
          "FirewalledProtocol",
          [usdcTokenAddress, turtleshellAddress],
          {},
        )
        firewalledProtocolAddress = await FirewalledProtocol.getAddress()
        await FirewalledProtocol.initialize()

        const amount = ethers.parseUnits("10000", 6)
        await usdc.mint(deployer, amount)

        await usdc.approve(firewalledProtocolAddress, ethers.MaxInt256)
      })

      describe("deposit", () => {
        it("sets deposited amount", async () => {
          await FirewalledProtocol.deposit(depositAmount)

          const balanceDeployer = await FirewalledProtocol.balances(deployer)
          assert.equal(balanceDeployer.toString(), depositAmount.toString())

          const balanceUser = await FirewalledProtocol.balances(user)
          assert.equal(balanceUser.toString(), "0")
        })

        it("transfers funds from user to contract", async () => {
          const startFirewalledProtocolBalance = await usdc.balanceOf(firewalledProtocolAddress)
          assert.equal(startFirewalledProtocolBalance.toString(), "0")

          const startDeployerBalance = await usdc.balanceOf(deployer)

          await FirewalledProtocol.deposit(depositAmount)

          const finalDeployerBalance = await usdc.balanceOf(deployer)
          assert.equal(finalDeployerBalance.toString(), (startDeployerBalance - depositAmount).toString())

          const finalFirewalledProtocolBalance = await usdc.balanceOf(firewalledProtocolAddress)
          assert.equal(
            finalFirewalledProtocolBalance.toString(),
            (startFirewalledProtocolBalance + depositAmount).toString(),
          )
        })

        it("tracks total TVL in turtleshell", async () => {
          const startTurtleshellBalance = await turtleshell.getParameterOf(firewalledProtocolAddress)
          assert.equal(startTurtleshellBalance.toString(), "0")

          await FirewalledProtocol.deposit(depositAmount)

          const finalTurtleshellBalance = await turtleshell.getParameterOf(firewalledProtocolAddress)
          assert.equal(finalTurtleshellBalance.toString(), depositAmount.toString())
        })
      })

      describe("withdraw", () => {
        beforeEach(async () => {
          await FirewalledProtocol.deposit(depositAmount)
        })

        describe("Withdraw less than 15% of the total TVL", () => {
          it("sets withdrawn amount", async () => {
            await FirewalledProtocol.withdraw(withdrawAmount)

            const balanceDeployer = await FirewalledProtocol.balances(deployer)
            assert.equal(balanceDeployer.toString(), (depositAmount - withdrawAmount).toString())
          })

          it("transfers funds from contract to user", async () => {
            const startFirewalledProtocolBalance = await usdc.balanceOf(firewalledProtocolAddress)

            const startDeployerBalance = await usdc.balanceOf(deployer)

            await FirewalledProtocol.withdraw(withdrawAmount)

            const finalDeployerBalance = await usdc.balanceOf(deployer)
            assert.equal(finalDeployerBalance.toString(), (startDeployerBalance + withdrawAmount).toString())

            const finalFirewalledProtocolBalance = await usdc.balanceOf(firewalledProtocolAddress)
            assert.equal(
              finalFirewalledProtocolBalance.toString(),
              (startFirewalledProtocolBalance - withdrawAmount).toString(),
            )
          })

          it("tracks total TVL in turtleshell", async () => {
            const startTurtleshellBalance = await turtleshell.getParameterOf(firewalledProtocolAddress)
            assert.equal(startTurtleshellBalance.toString(), depositAmount.toString())

            await FirewalledProtocol.withdraw(withdrawAmount)

            const finalTurtleshellBalance = await turtleshell.getParameterOf(firewalledProtocolAddress)
            assert.equal(finalTurtleshellBalance.toString(), (depositAmount - withdrawAmount).toString())
          })
        })

        describe("Withdraw more than 15% of the total TVL", () => {
          it("triggers firewall and reverts", async () => {
            const largeWithdrawAmount = ethers.parseUnits("2000", 6)
            await FirewalledProtocol.withdraw(largeWithdrawAmount)

            const firewallStatus = await turtleshell.getFirewallStatusOf(firewalledProtocolAddress)
            assert.equal(firewallStatus, true)
          })
        })
      })
    })
