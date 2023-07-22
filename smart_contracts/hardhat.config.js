const { developmentChains } = require("./helper-hardhat-config")
const { propose, queue, execute } = require("./utils/governance/governance")

const VOTING_DELAY = 1 // How many blocks till a proposal vote becomes active
const MIN_DELAY = 1 // Min delay before voting can be enacted
const VOTING_PERIOD = 13 // Time during which you can vote after a proposal is created

require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("@nomiclabs/hardhat-etherscan")
require("solidity-coverage")
require("hardhat-contract-sizer")
require("dotenv").config()

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
const MANTLE_TESTNET_RPC_URL = process.env.MANTLE_TESTNET_RPC_URL
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

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
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      saveDeployments: true,
      chainId: 5,
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

task("attack-firewalled-protocol", "Attack FirewalledProtocol").setAction(async (taskArgs, hre) => {
  const isDevelopmentChain = developmentChains.includes(hre.network.name)

  const attackContract = await ethers.getContract("AttackContract")
  const attackContractAddress = await attackContract.getAddress()
  const firewalledProtocol = await ethers.getContract("FirewalledProtocol")
  const firewalledProtocolAddress = await firewalledProtocol.getAddress()

  const attackTx = await attackContract.attack(firewalledProtocolAddress)
  await attackTx.wait(1)

  // creating the proposal

  const moveBlocks = async function (network, amount) {
    console.log("Moving blocks...")
    for (let index = 0; index < amount; index++) {
      await network.provider.request({
        method: "evm_mine",
        params: [],
      })
    }
    console.log(`Moved ${amount} blocks`)
  }

  const usdc = await ethers.getContract("Usdc")
  const usdcAddress = await usdc.getAddress()
  const protocolGovernor = await ethers.getContract("ProtocolGovernor")
  const firewallFreezer = await ethers.getContract("TurtleShellFreezer")
  const firewallFreezerAddress = await firewallFreezer.getAddress()
  const blockNumber = await ethers.provider.getBlockNumber()

  const targets = [firewallFreezerAddress]
  const etherValues = [0]
  const encodedFunctionCalls = [
    firewallFreezer.interface.encodeFunctionData("unlockFunds", [attackContractAddress, usdcAddress]),
  ]
  const description = `Unlock funds from FirewalledProtocol #${blockNumber}`

  const proposalId = await propose(protocolGovernor, targets, etherValues, encodedFunctionCalls, description)
  console.log(`Created new proposal (id: ${proposalId})\nDescription: ${description}`)

  if (isDevelopmentChain) {
    await moveBlocks(hre.network, VOTING_DELAY + 1)
  }
})

// task("create-unlock-proposal", "Create a proposal to unlock funds").setAction(async (taskArgs, hre) => {
//   const moveBlocks = async function (network, amount) {
//     console.log("Moving blocks...")
//     for (let index = 0; index < amount; index++) {
//       await network.provider.request({
//         method: "evm_mine",
//         params: [],
//       })
//     }
//     console.log(`Moved ${amount} blocks`)
//   }

//   const { deployer } = await getNamedAccounts()
//   const isDevelopmentChain = developmentChains.includes(hre.network.name)

//   const usdc = await ethers.getContract("Usdc", deployer)
//   const usdcAddress = await usdc.getAddress()
//   const protocolGovernor = await ethers.getContract("ProtocolGovernor", deployer)
//   const firewallFreezer = await ethers.getContract("TurtleShellFreezer", deployer)
//   const firewallFreezerAddress = await firewallFreezer.getAddress()
//   const blockNumber = await ethers.provider.getBlockNumber()

//   const targets = [firewallFreezerAddress]
//   const etherValues = [0]
//   const encodedFunctionCalls = [firewallFreezer.interface.encodeFunctionData("unlockFunds", [deployer, usdcAddress])]
//   const description = `Unlock funds from FirewalledProtocol #${blockNumber}`

//   const proposalId = await propose(protocolGovernor, targets, etherValues, encodedFunctionCalls, description)
//   console.log(`Created new proposal (id: ${proposalId})\nDescription: ${description}`)

//   if (isDevelopmentChain) {
//     await moveBlocks(hre.network, VOTING_DELAY + 1)
//   }
// })

// hh vote --network localhost --proposalid string
task("vote", "Vote on proposal")
  .addParam("proposalid", "The proposal id to vote on")
  .setAction(async taskArgs => {
    const moveBlocks = async function (network, amount) {
      console.log("Moving blocks...")
      for (let index = 0; index < amount; index++) {
        await network.provider.request({
          method: "evm_mine",
          params: [],
        })
      }
      console.log(`Moved ${amount} blocks`)
    }

    const isDevelopmentChain = developmentChains.includes(hre.network.name)

    const governor = await ethers.getContract("ProtocolGovernor")
    const proposalId = taskArgs.proposalid // Get proposalId from command line argument
    console.log(`Voting on proposal ${proposalId}`)

    const voteWay = 1
    const reason = "I vote yes"
    const tx = await governor.castVoteWithReason(proposalId, voteWay, reason)
    await tx.wait()
    console.log("Voted successfully")

    if (isDevelopmentChain) {
      await moveBlocks(hre.network, VOTING_PERIOD + 1)
    }
  })

// hh queue --network localhost --user address --token address --description text
task("queue", "Queue a proposal")
  .addParam("description", "The proposal description")
  .setAction(async (taskArgs, hre) => {
    const moveTime = async function (network, amount) {
      await network.provider.send("evm_increaseTime", [amount])
      console.log(`Moved forward in time ${amount} seconds`)
    }

    const isDevelopmentChain = developmentChains.includes(hre.network.name)

    const governor = await ethers.getContract("ProtocolGovernor")
    const turtleShellFreezer = await ethers.getContract("TurtleShellFreezer")
    const usdc = await ethers.getContract("Usdc")
    const usdcAddress = await usdc.getAddress()
    const attackContract = await ethers.getContract("AttackContract")
    const attackContractAddress = await attackContract.getAddress()
    const turtleShellFreezerAddress = await turtleShellFreezer.getAddress()
    const proposal_description = taskArgs.description // Get proposal description from command line argument
    const transferCalldata = turtleShellFreezer.interface.encodeFunctionData("unlockFunds", [
      attackContractAddress,
      usdcAddress,
    ])

    await queue(governor, [turtleShellFreezerAddress], [0], [transferCalldata], proposal_description)
    console.log("Queued successfully")

    if (isDevelopmentChain) {
      await moveTime(hre.network, MIN_DELAY + 1)
    }
  })

// hh execute --network localhost --user address --token address --description text
task("execute", "Execute a proposal")
  .addParam("description", "The proposal description")
  .setAction(async taskArgs => {
    const governor = await ethers.getContract("ProtocolGovernor")
    const turtleShellFreezer = await ethers.getContract("TurtleShellFreezer")
    const usdc = await ethers.getContract("Usdc")
    const usdcAddress = await usdc.getAddress()
    const attackContract = await ethers.getContract("AttackContract")
    const attackContractAddress = await attackContract.getAddress()
    const turtleShellFreezerAddress = await turtleShellFreezer.getAddress()
    const proposal_description = taskArgs.description // Get proposal description from command line argument
    const transferCalldata = turtleShellFreezer.interface.encodeFunctionData("unlockFunds", [
      attackContractAddress,
      usdcAddress,
    ])

    const lockedFundsBefore = await turtleShellFreezer.getFrozenFundsOf(attackContractAddress, usdcAddress)
    console.log("Locked funds before:", ethers.formatEther(lockedFundsBefore))

    await execute(governor, [turtleShellFreezerAddress], [0], [transferCalldata], proposal_description)
    console.log("Executed successfully")

    const lockedFundsAfter = await turtleShellFreezer.getFrozenFundsOf(attackContractAddress, usdcAddress)
    console.log("Locked funds after resolve:", lockedFundsAfter)
  })
