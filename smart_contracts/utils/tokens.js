const fs = require("fs");
const { networkConfig } = require("../helper-hardhat-config");

const getUSDC = (deployer) => {
  const usdcTokenAddress = networkConfig[network.config.chainId].usdcToken;
  const usdcAbi = JSON.parse(
    fs.readFileSync("./utils/abis/usdcAbi.json", "utf8")
  );
  return ethers.getContractAt(usdcAbi, usdcTokenAddress, deployer);
};

module.exports = { getUSDC };
