const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-blocks");
const { moveTime } = require("../utils/move-time");
const {
  propose,
  vote,
  queue,
  execute,
} = require("../utils/governance/governance");

const VOTING_DELAY = 1; // How many blocks till a proposal vote becomes active
const MIN_DELAY = 1; // Min delay before voting can be enacted
const VOTING_PERIOD = 13; // Time during which you can vote after a proposal is created

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Governance", async () => {
      let governor,
        governanceToken,
        governanceTokenAddress,
        timeLock,
        timeLockAddress,
        deployer,
        governanceTokenDecimals;

      const PROPOSAL_DESCRIPTION = "Proposal #1: Give grant to team";

      beforeEach(async () => {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        governor = await ethers.getContract("ProtocolGovernor");
        timeLock = await ethers.getContract("TimeLock");
        timeLockAddress = await timeLock.getAddress();
        governanceToken = await ethers.getContract("GovernanceToken");
        governanceTokenAddress = await governanceToken.getAddress();
        const governanceTokenDecimals = await governanceToken.decimals();

        // transfer governanceToken from deployer to timelock
        const amount = ethers.parseUnits("1000", governanceTokenDecimals);
        await governanceToken.transfer(timeLockAddress, amount);
      });

      it("should have transferred governanceToken supply to timelock", async () => {
        const timeLockBalance = await governanceToken.balanceOf(
          timeLockAddress
        );
        expect(timeLockBalance).to.equal(
          ethers.parseUnits("1000", governanceTokenDecimals)
        );
      });

      it("should create a proposal to send 1000 tokens to user1, votes, waits, queues, and then executes", async () => {
        const teamAddress = (await getNamedAccounts()).user1;
        console.log("teamAddress", teamAddress);

        const grantAmount = ethers.parseUnits("1000", governanceTokenDecimals);
        const transferCalldata = governanceToken.interface.encodeFunctionData(
          "transfer",
          [teamAddress, grantAmount]
        );

        console.log("----- Create proposal -----");
        const proposalId = await propose(
          governor,
          [governanceTokenAddress],
          [0],
          [transferCalldata],
          PROPOSAL_DESCRIPTION
        );

        console.log("proposalId", proposalId);

        const proposalSate = await governor.state(proposalId);
        expect(proposalSate).to.equal(0);

        await moveBlocks(VOTING_DELAY + 1);

        console.log("----- Vote FOR proposal -----");
        const voteWay = 1; // We vote FOR the proposal (0=against, 1=for, 2=abstain)
        const reason = "I support this proposal because I do what I want";
        await vote(governor, proposalId, voteWay, reason);
        proposalState = await governor.state(proposalId);
        assert.equal(proposalState.toString(), 1);

        await moveBlocks(VOTING_PERIOD + 1);

        console.log("----- Queue execution -----");
        await queue(
          governor,
          [governanceTokenAddress],
          [0],
          [transferCalldata],
          PROPOSAL_DESCRIPTION
        );

        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);

        proposalState = await governor.state(proposalId);
        console.log(`Current Proposal State: ${proposalState}`);

        console.log("----- Execute proposal -----");
        await execute(
          governor,
          [governanceTokenAddress],
          [0],
          [transferCalldata],
          PROPOSAL_DESCRIPTION
        );

        expect(await governanceToken.balanceOf(teamAddress)).to.equal(
          grantAmount
        );
      });
    });
