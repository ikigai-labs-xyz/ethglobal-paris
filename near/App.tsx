const Header = (
    <div className='grid grid-cols-12 gap-4 justify-center items-center pt-5'>
            <div className='col-start-1 col-span-7'>
              <div className='flex flex-row items-center justify-center gap-5 '>
                <img src="https://assets.coingecko.com/coins/images/10365/small/near.jpg?1683515160" alt='' />
                <div className='flex flex-col'>
                  <div className='font-extrabold text-4xl text-black'>
                    Decentralised Circuit Breaker
                  </div>
                  <div className='font-base text-sm text-left text-slate-800'>
                    for a Lending & Borrowing Market
                  </div>
                </div>
              </div>
            </div>

         
        
            <div className='col-start-8 col-span-5 p-2 m-5'>
    
            </div>
          </div>
  );

 const TVL = {
    title: 'TVL',
    subtitle: 'Total Value Locked',
    amount: 1000000,
    currency: 'USDC',
};


  const Overview = (
    <div className='col-start-1 col-span-12 rounded-2xl border border-gray-200 bg-white shadow-xl p-5 mt-12'>
            


    <div>
            <div className="grid grid-cols-12 gap-5">
				<div className="col-start-1 col-span-3 text-xl font-base text-slate-800 text-left pl-3">
					Stats Overview
				</div>

				<div className="col-start-1 col-span-4 rounded-lg border border-gray-200 bg-white shadow-md ">
					<div className="text-black border-b border-slate-800/40 ">{TVL.subtitle}</div>
					<div className="flex flex-row items-center justify-center gap-3 py-2">
						<div className="text-slate-800 font-bold">{TVL.currency}</div>
						<div className="text-slate-800 text-lg">
						
						</div>
					</div>
				</div>

				<div className="col-start-5 col-span-4  rounded-lg border border-gray-200 bg-white shadow-md ">
					<div className="text-black border-b border-slate-800/40">Borrow</div>
					<div className="flex flex-row items-center justify-center gap-3 py-2">
						<div className="text-slate-800 text-lg">fetching data ...</div>
					</div>
				</div>

				<div className="col-start-9 col-span-4 rounded-lg border border-gray-200 bg-white shadow-md ">
					<div className="text-black border-b border-slate-800/40">Supply</div>
					<div className="flex flex-row items-center justify-center gap-3 py-2">
						<div className="text-slate-800 text-lg">fetching data ...</div>
					</div>
				</div>
			</div>

            </div>
    </div>
  );

  return (
    <>
    <Widget
      src="igris.near/widget/TailwindWrapper"
      props={{
        children: Header
      }}
    />

    <Widget
      src="igris.near/widget/TailwindWrapper"
      props={{
        children: Overview
      }}
    />
    </>
  );