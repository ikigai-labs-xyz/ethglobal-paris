import React from "react"

import "../styles/Animations.css"
import 'animate.css';

function Popup() {

	return (
		<div className="fixed top-0 left-0 w-screen h-96 bg-opacity-90 flex items-center justify-center z-10 fadeInDown">
			<div className=" bg-red-500 rounded-3xl p-3 animate-pulse">
				<h2 className="text-3xl font-bold mb-2">Circuit Breaker triggered</h2>
				<p className="text-lg font-semibold">
					a decentralized resolving mechanism has been activated to investigate on the unsual activity. <br/> Please visit snapshot to vote on the resolution.
				</p>
			</div>
		</div>
	)

}

export default Popup;
