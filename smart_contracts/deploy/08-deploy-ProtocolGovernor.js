const { network, ethers } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  /***********************************
   *
   * Deploy smart contract
   *
   ************************************/

  log("---------------------------------");
  log(`Deploy ProtocolGovernor with owner : ${deployer}`);

  const governanceToken = await ethers.getContract("GovernanceToken", deployer);
  const governanceTokenAddress = await governanceToken.getAddress();
  const timeLock = await ethers.getContract("TimeLock", deployer);
  const timeLockAddress = await timeLock.getAddress();

  const arguments = [governanceTokenAddress, timeLockAddress];
  await deploy("ProtocolGovernor", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  log("---------------------------------");
  log(`deployed ProtocolGovernor with owner : ${deployer}`);

  log("----------------------------------------------------");
};

module.exports.tags = ["all", "ProtocolGovernor"];
