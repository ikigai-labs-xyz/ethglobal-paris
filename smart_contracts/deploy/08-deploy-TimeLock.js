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
  const MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact

  /***********************************
   *
   * Deploy smart contract
   *
   ************************************/

  log("---------------------------------");
  log(`Deploy TimeLock with owner : ${deployer}`);

  const arguments = [MIN_DELAY, [], [], deployer];
  await deploy("TimeLock", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  log("---------------------------------");
  log(`deployed TimeLock with owner : ${deployer}`);

  log("----------------------------------------------------");
};

module.exports.tags = ["all", "TimeLock"];
