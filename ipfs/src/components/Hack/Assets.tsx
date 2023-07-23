function Assets() {
	return (
		<>
			<div className="flex flex-col">
				<div className="grid grid-cols-12 gap-5">
					<div className="col-start-1 col-span-3 text-xl font-base text-slate-800 text-left pl-3">Assets</div>

					<div className="col-start-1 col-span-12 bg-slate-50 shadow-md border-green-500/100 p-2 justify-between items-center">
						<div className="grid grid-cols-12 gap-5">
							<div className="col-start-1 col-span-2">
								<div className="flex flex-row gap-3 justify-center items-center">
									
									<div>USDC</div>
								</div>
							</div>

							<div className="col-start-3 col-span-2">
								<div className="flex flex-row gap-3 justify-center items-center">
									<div className="font-bold">Borrow: </div>
									<div>6%</div>
								</div>
							</div>

							<div className="col-start-6 col-span-2">
								<div className="flex flex-row gap-3 justify-center items-center">
									<div className="font-bold">Supply: </div>
									<div>6%</div>
								</div>
							</div>

							<div className="col-start-10 col-span-4">
								<div className="flex flex-row gap-3 justify-center items-center">
									<a>
										<div className="text-white font-bold bg-slate-500 px-3 py-1 rounded-full shadow-lg hover:bg-blue-500 hover:shadow-lg hover:shadow-lime-500">
										fetching data ...
										</div>
									</a>
									<a href="https://example.com">
										<div className="text-white font-bold bg-slate-500 px-3 py-1 rounded-full shadow-lg hover:bg-blue-500 hover:shadow-lg hover:shadow-lime-500">
									fetching data ...
										</div>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Assets
