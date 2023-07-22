const util = require("util")
const exec = util.promisify(require("child_process").exec)
const fs = require("fs")
const path = require("path")
const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

const frontendAddressesFile = "../frontend/constants/contractAddresses.json"
const frontendLendingBorrowingAbiFile = "../frontend/constants/lending_borrowing_abi.json"
const frontendERC20AbiFile = "../frontend/constants/erc20_abi.json"

module.exports = async hre => {
  await updateAddresses()
  await updateAbi()
}

const updateAddresses = async () => {
  const firewalledProtocol = await ethers.getContract("FirewalledProtocol")
  const nonFirewalledProtocol = await ethers.getContract("NonFirewalledProtocol")
  const turtleShellFirewall = await ethers.getContract("TurtleShellFirewall")
  const usdc = await ethers.getContract("Usdc")

  const adresses = JSON.parse(fs.readFileSync(frontendAddressesFile, "utf8"))
  const chainId = network.config.chainId

  adresses[chainId] = {
    firewalledProtocol: await firewalledProtocol.getAddress(),
    nonFirewalledProtocol: await nonFirewalledProtocol.getAddress(),
    turtleShellFirewall: await turtleShellFirewall.getAddress(),
    usdc: await usdc.getAddress(),
  }

  fs.writeFileSync(frontendAddressesFile, JSON.stringify(adresses))
}

const updateAbi = async () => {
  const contractPath = path.resolve(__dirname, "../contracts/defiProtocol/FirewalledProtocol.sol")
  const abisDir = path.resolve(__dirname, "../abis")

  // compile the contract with solcjs, output files to the contract's directory
  const { stdout, stderr } = await exec(
    `solcjs --abi ${contractPath} --output-dir ${abisDir} --include-path node_modules/ --base-path .`,
  )

  // check for any errors during compilation
  if (stderr) {
    console.error("Error during compilation:", stderr)
    return
  }

  console.log(stdout)

  // read the generated ABI
  const abiFile = path.resolve(abisDir, "contracts_LendingBorrowing_sol_LendingBorrowing.abi")
  const abi = JSON.parse(fs.readFileSync(abiFile, "utf8"))

  fs.writeFileSync(frontendLendingBorrowingAbiFile, JSON.stringify(abi, null, 2))
}

module.exports.tags = ["all", "frontend"]
