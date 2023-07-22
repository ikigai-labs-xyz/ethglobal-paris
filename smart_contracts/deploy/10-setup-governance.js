const { network, ethers } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

  const timeLock = await ethers.getContract("TimeLock", deployer);
  const governor = await ethers.getContract("ProtocolGovernor", deployer);
  const governorAddress = await governor.getAddress();

  log("----------------------------------------------------");
  log("Setting up governance roles...");

  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

  const proposerTx = await timeLock.grantRole(proposerRole, governorAddress);
  await proposerTx.wait(1);
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO); // allow anyone to execute
  await executorTx.wait(1);
  const revokeTx = await timeLock.revokeRole(adminRole, deployer); // anything the timelock wants to do has to go through the governance process
  await revokeTx.wait(1);

  log("----------------------------------------------------");
};

module.exports.tags = ["all", "SetupGovernance"];
