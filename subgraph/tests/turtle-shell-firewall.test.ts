import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { FirewallStatusUpdate } from "../generated/schema"
import { FirewallStatusUpdate as FirewallStatusUpdateEvent } from "../generated/TurtleShellFirewall/TurtleShellFirewall"
import { handleFirewallStatusUpdate } from "../src/turtle-shell-firewall"
import { createFirewallStatusUpdateEvent } from "./turtle-shell-firewall-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let newStatus = "boolean Not implemented"
    let newFirewallStatusUpdateEvent = createFirewallStatusUpdateEvent(
      user,
      newStatus
    )
    handleFirewallStatusUpdate(newFirewallStatusUpdateEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("FirewallStatusUpdate created and stored", () => {
    assert.entityCount("FirewallStatusUpdate", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FirewallStatusUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "FirewallStatusUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newStatus",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
