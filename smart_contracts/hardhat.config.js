require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("@nomiclabs/hardhat-etherscan")
require("solidity-coverage")
require("hardhat-contract-sizer")
require("dotenv").config()

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
const MANTLE_TESTNET_RPC_URL = process.env.MANTLE_TESTNET_RPC_URL
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
        blockNumber: 16232680,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    mantle: {
      url: MANTLE_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY, USER_PRIVATE_KEY],
      saveDeployments: true,
      chainId: 5001,
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      5001: 0,
      31337: 0,
    },
    user1: {
      default: 1,
    },
    user2: {
      default: 2,
    },
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
}

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// hh vote --network localhost --proposalid string
task("vote", "Vote on proposal")
  .addParam("proposalid", "The proposal id to vote on")
  .setAction(async taskArgs => {
    const governor = await ethers.getContract("ProtocolGovernor")
    const proposalId = taskArgs.proposalid // Get proposalId from command line argument
    console.log(`Voting on proposal ${proposalId}`)

    const voteWay = 1
    const reason = "I vote yes"
    const tx = await governor.castVoteWithReason(proposalId, voteWay, reason)
    await tx.wait()
    console.log("Voted successfully")
  })

// hh queue --network localhost --user address --token address --description text
task("queue", "Queue a proposal")
  .addParam("user", "The user to transfer the frozen funds to")
  .addParam("token", "The token to transfer")
  .addParam("description", "The proposal description")
  .setAction(async taskArgs => {
    const governor = await ethers.getContract("ProtocolGovernor")
    const turtleShellFreezer = await ethers.getContract("TurtleShellFreezer")
    const turtleShellFreezerAddress = await turtleShellFreezer.getAddress()
    const user = taskArgs.user // Get user address from command line argument
    const tokenAddress = taskArgs.token // Get token address from command line argument
    const proposal_description = taskArgs.description // Get proposal description from command line argument
    const transferCalldata = turtleShellFreezer.interface.encodeFunctionData("unlockFunds", [user, tokenAddress])
    const descriptionHash = ethers.id(proposal_description)

    await governor.queue([turtleShellFreezerAddress], [0], [transferCalldata], descriptionHash)
    console.log("Queued successfully")
  })

// hh execute --network localhost --user address --token address --description text
task("execute", "Execute a proposal")
  .addParam("user", "The user to transfer the frozen funds to")
  .addParam("token", "The token to transfer")
  .addParam("description", "The proposal description")
  .setAction(async taskArgs => {
    const governor = await ethers.getContract("ProtocolGovernor")
    const turtleShellFreezer = await ethers.getContract("TurtleShellFreezer")
    const turtleShellFreezerAddress = await turtleShellFreezer.getAddress()
    const user = taskArgs.user // Get user address from command line argument
    const tokenAddress = taskArgs.token // Get token address from command line argument
    const proposal_description = taskArgs.description // Get proposal description from command line argument
    const transferCalldata = turtleShellFreezer.interface.encodeFunctionData("unlockFunds", [user, tokenAddress])
    const descriptionHash = ethers.id(proposal_description)

    const executeTx = await governor.execute([turtleShellFreezerAddress], [0], [transferCalldata], descriptionHash)
    await executeTx.wait()
    console.log("Executed successfully")
  })
