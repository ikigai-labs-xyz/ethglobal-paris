const { ethers } = require("hardhat")

const propose = async (governor, targets, etherValues, encodedFunctionCalls, description) => {
  const tx = await governor.propose(targets, etherValues, encodedFunctionCalls, description)
  const proposeReceipt = await tx.wait()
  const events = proposeReceipt.logs?.map(log => governor.interface.parseLog(log))

  const proposalCreatedEvent = events?.find(event => event?.name === "ProposalCreated")
  const proposalId = proposalCreatedEvent?.args?.proposalId

  return proposalId
}

const vote = async (governor, proposalId, voteWay, reason) => {
  const tx = await governor.castVoteWithReason(proposalId, voteWay, reason)
  await tx.wait()
}

const queue = async (governor, targets, etherValues, encodedFunctionCalls, description) => {
  const descriptionHash = ethers.id(description)

  const queueTx = await governor.queue(targets, etherValues, encodedFunctionCalls, descriptionHash)
  await queueTx.wait()
}

const execute = async (governor, targets, etherValues, encodedFunctionCalls, description) => {
  const descriptionHash = ethers.id(description)

  const executeTx = await governor.execute(targets, etherValues, encodedFunctionCalls, descriptionHash)
  await executeTx.wait()
}

module.exports = { propose, vote, queue, execute }
