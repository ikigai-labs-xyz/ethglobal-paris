const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
require("dotenv").config()

const createGroup = async (deployer, name, nickname) => {
    console.log("createGroup called with: ", deployer, name, nickname)
    const crypto4beer = await ethers.getContract("Beer4Crypto", deployer)

    const tx1 = await crypto4beer.createGroup(name, nickname)
    const receipt = await tx1.wait()
    const event = receipt.events?.find((event_params) => event_params.event === "GroupCreated")
    return event?.args?.id
}

const inviteMember = async (deployer, account, nickname, id) => {
    console.log(`inviteMember called with: account: ${account}, nickname: ${nickname}, id: ${id}`)
    const crypto4beer = await ethers.getContract("Beer4Crypto", deployer)

    const tx1 = await crypto4beer.inviteMember(account, nickname, id)
    await tx1.wait()
}

const getGroup = async (groupId) => {
    const { deployer } = await getNamedAccounts()
    const crypto4beer = await ethers.getContract("Beer4Crypto", deployer)

    const group = await crypto4beer.getGroup(groupId)
    console.log(`Group: ${group}`)
}

const createGroupEvent = async (deployer, groupId, eventDate, minDeposit, maxBetDate) => {
    console.log(
        `CreateEvent called with: 
            deployer: ${deployer}, 
            groupId: ${groupId}, 
            eventDate: ${eventDate}, 
            minDeposit: ${minDeposit}, 
            maxBetDate: ${maxBetDate}
        `
    )
    const crypto4beer = await ethers.getContract("Beer4Crypto", deployer)

    const tx1 = await crypto4beer.createGroupEvent(eventDate, minDeposit, groupId, maxBetDate)
    const receipt = await tx1.wait()
    const event = receipt.events.find((event_params) => event_params.event === "GroupEventCreated")
    return event.args.id
}

const createBet = async (better, eventId, predictedEthPrice, amount) => {
    console.log(
        `CreateBet called with:
            better: ${better},
            eventId: ${eventId},
            predictedEthPrice: ${predictedEthPrice},
        `
    )
    const crypto4beer = await ethers.getContract("Beer4Crypto", better)

    const tx1 = await crypto4beer.createBet(eventId, predictedEthPrice, { value: amount })
    await tx1.wait()
}

module.exports = {
    createGroup,
    inviteMember,
    getGroup,
    createGroupEvent,
    createBet,
}
