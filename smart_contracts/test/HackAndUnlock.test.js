const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")
const { moveTime } = require("../utils/move-time")
const { vote, queue, execute, propose } = require("../utils/governance/governance")

const VOTING_DELAY = 1 // How many blocks till a proposal vote becomes active
const MIN_DELAY = 1 // Min delay before voting can be enacted
const VOTING_PERIOD = 13 // Time during which you can vote after a proposal is created

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("HackAndUnlock", () => {
      let deployer,
        usdc,
        usdcAddress,
        turtleShell,
        FirewalledProtocol,
        attackContract,
        attackContractAddress,
        turtleShellFreezer,
        turtleShellFreezerAddress,
        firewalledProtocolAddress,
        governor,
        governorAddress

      beforeEach(async () => {
        await deployments.fixture(["all"])

        deployer = (await getNamedAccounts()).deployer
        user = (await getNamedAccounts()).user1

        usdc = await ethers.getContract("Usdc", deployer)
        usdcAddress = await usdc.getAddress()

        turtleShell = await ethers.getContract("TurtleShellFirewall", deployer)
        turtleShellAddress = await turtleShell.getAddress()

        turtleShellFreezer = await ethers.getContract("TurtleShellFreezer", deployer)
        turtleShellFreezerAddress = await turtleShellFreezer.getAddress()

        FirewalledProtocol = await ethers.getContract("FirewalledProtocol", deployer)
        firewalledProtocolAddress = await FirewalledProtocol.getAddress()

        attackContract = await ethers.getContract("AttackContract", deployer)
        attackContractAddress = await attackContract.getAddress()

        governor = await ethers.getContract("ProtocolGovernor", deployer)
        governorAddress = await governor.getAddress()
      })
      it("trigger firewall and unlock the funds", async () => {
        // attack
        const tx = await attackContract.attack(firewalledProtocolAddress)
        const attackReceipt = await tx.wait()

        // check if funds got locked
        const lockedFunds = await turtleShellFreezer.getFrozenFundsOf(attackContractAddress, usdcAddress)
        expect(lockedFunds).not.to.be.equal(0n)

        const ownerOfTurtleShellFreezer = await turtleShellFreezer.owner()
        console.log("ownerOfTurtleShellFreezer", ownerOfTurtleShellFreezer)
        const timelock = await ethers.getContract("TimeLock", deployer)
        const timelockAddress = await timelock.getAddress()
        console.log("timeLockAddress", timelockAddress)

        const blockNumber = attackReceipt.blockNumber
        const description = `Unlock funds from #${blockNumber}`

        const targets = [turtleShellFreezerAddress]
        const etherValues = [0]
        const encodedFunctionCalls = [
          turtleShellFreezer.interface.encodeFunctionData("unlockFunds", [attackContractAddress, usdcAddress]),
        ]

        const proposalId = await propose(governor, targets, etherValues, encodedFunctionCalls, description)

        // wait for voting delay after proposal creation to pass
        await moveBlocks(VOTING_DELAY + 1)

        // vote on proposal
        await vote(governor, proposalId, 1, "vote for proposal")

        // wait for voting duration to pass
        await moveBlocks(VOTING_PERIOD + 1)

        // queue
        await queue(governor, targets, etherValues, encodedFunctionCalls, description)

        await moveTime(MIN_DELAY + 1)

        // execute
        await execute(governor, targets, etherValues, encodedFunctionCalls, description)

        // check if funds had been unlocked
        const fundsNow = await turtleShellFreezer.getFrozenFundsOf(attackContractAddress, usdcAddress)
        expect(fundsNow).to.be.equal(0n)
      })
    })
