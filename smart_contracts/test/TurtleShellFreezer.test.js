const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("TurtleShellFreezer", () => {
      let deployer, user, governorFreezer, turtleShellFreezer, usdc, tokenAmount, tokenAddress

      beforeEach(async () => {
        await deployments.fixture(["TurtleShellFreezer", "Usdc"])

        /// deployer mocks governance in test
        deployer = (await getNamedAccounts()).deployer
        user = (await getNamedAccounts()).user1
        protocol = (await getNamedAccounts()).user2

        turtleShellFreezer = await ethers.getContract("TurtleShellFreezer", protocol)
        governorFreezer = await ethers.getContract("TurtleShellFreezer", deployer)
        usdc = await ethers.getContract("Usdc", protocol)
        governorUsdc = await ethers.getContract("Usdc", deployer)
        tokenAddress = usdc.target

        const rawTokenAmount = 1000
        tokenAmount = ethers.parseEther(rawTokenAmount.toString())
        await governorUsdc.mint(protocol, tokenAmount)

        await governorFreezer.setProtocol(protocol)
      })

      describe("freezeFunds", () => {
        beforeEach(async () => {
          await usdc.approve(turtleShellFreezer.target, tokenAmount)
        })

        it("reverts if caller not protocol", async () => {
          await governorFreezer.setProtocol(deployer)
          await expect(turtleShellFreezer.freezeFunds(user, tokenAmount, tokenAddress)).to.be.reverted
        })

        it("checks allowance", async () => {
          await usdc.approve(turtleShellFreezer.target, 0)
          await expect(turtleShellFreezer.freezeFunds(user, tokenAmount, tokenAddress)).to.be.reverted
        })

        it("updates frozen funds balance", async () => {
          await turtleShellFreezer.freezeFunds(user, tokenAmount, tokenAddress)
          const frozenFunds = await turtleShellFreezer.getFrozenFundsOf(user, tokenAddress)
          assert.equal(frozenFunds, tokenAmount)
        })

        it("transfers tokens to freezer vault", async () => {
          const vaultTokenBalanceBefore = await usdc.balanceOf(turtleShellFreezer.target)
          await turtleShellFreezer.freezeFunds(user, tokenAmount, tokenAddress)
          const vaultTokenBalanceAfter = await usdc.balanceOf(turtleShellFreezer.target)

          expect(vaultTokenBalanceAfter).to.equal(vaultTokenBalanceBefore + tokenAmount)
        })
      })

      describe("returnFunds", () => {
        beforeEach(async () => {
          await usdc.approve(turtleShellFreezer.target, tokenAmount)
          await turtleShellFreezer.freezeFunds(user, tokenAmount, tokenAddress)
        })

        it("reverts if caller is not the owner", async () => {
          await expect(turtleShellFreezer.returnFunds(user, tokenAddress)).to.be.reverted
        })

        it("updates frozen funds balance", async () => {
          await governorFreezer.returnFunds(user, tokenAddress)
          const frozenFunds = await turtleShellFreezer.getFrozenFundsOf(user, tokenAddress)
          assert.equal(frozenFunds, 0)
        })

        it("transfers funds back to the protocol", async () => {
          const protocolTokenBalanceBefore = await usdc.balanceOf(protocol)
          await governorFreezer.returnFunds(user, tokenAddress)
          const protocolTokenBalanceAfter = await usdc.balanceOf(protocol)

          expect(protocolTokenBalanceAfter).to.equal(protocolTokenBalanceBefore + tokenAmount)
        })
      })

      describe("unlockFunds", () => {
        beforeEach(async () => {
          await usdc.approve(turtleShellFreezer.target, tokenAmount)
          await turtleShellFreezer.freezeFunds(user, tokenAmount, tokenAddress)
        })

        it("reverts if caller is not the owner", async () => {
          await expect(turtleShellFreezer.unlockFunds(user, tokenAddress)).to.be.reverted
        })

        it("updates frozen funds balance", async () => {
          await governorFreezer.unlockFunds(user, tokenAddress)
          const frozenFunds = await turtleShellFreezer.getFrozenFundsOf(user, tokenAddress)
          assert.equal(frozenFunds, 0)
        })

        it("transfers tokens to user", async () => {
          const userTokenBalanceBefore = await usdc.balanceOf(user)
          const tx = await governorFreezer.unlockFunds(user, tokenAddress)
          await tx.wait()
          const userTokenBalanceAfter = await usdc.balanceOf(user)

          expect(userTokenBalanceAfter).to.equal(userTokenBalanceBefore + tokenAmount)
        })
      })
    })
