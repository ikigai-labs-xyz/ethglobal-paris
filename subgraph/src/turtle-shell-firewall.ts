import { FirewallStatusUpdate as FirewallStatusUpdateEvent } from "../generated/TurtleShellFirewall/TurtleShellFirewall"
import { Protocol } from "../generated/schema"

export function handleFirewallStatusUpdate(event: FirewallStatusUpdateEvent): void {
	let protocol = Protocol.load(event.params.user)
	if (!protocol) {
		protocol = new Protocol(event.params.user)
	}

	protocol.firewallStatus = event.params.newStatus

	protocol.save()
}
