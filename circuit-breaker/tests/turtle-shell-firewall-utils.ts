import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  FirewallStatusUpdate,
  ParameterChanged
} from "../generated/TurtleShellFirewall/TurtleShellFirewall"

export function createFirewallStatusUpdateEvent(
  user: Address,
  newStatus: boolean
): FirewallStatusUpdate {
  let firewallStatusUpdateEvent = changetype<FirewallStatusUpdate>(
    newMockEvent()
  )

  firewallStatusUpdateEvent.parameters = new Array()

  firewallStatusUpdateEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  firewallStatusUpdateEvent.parameters.push(
    new ethereum.EventParam("newStatus", ethereum.Value.fromBoolean(newStatus))
  )

  return firewallStatusUpdateEvent
}

export function createParameterChangedEvent(
  user: Address,
  newParameter: BigInt
): ParameterChanged {
  let parameterChangedEvent = changetype<ParameterChanged>(newMockEvent())

  parameterChangedEvent.parameters = new Array()

  parameterChangedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  parameterChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newParameter",
      ethereum.Value.fromUnsignedBigInt(newParameter)
    )
  )

  return parameterChangedEvent
}
