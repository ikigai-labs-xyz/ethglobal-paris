function MainBox() {

  return (
<>
    <div className='grid grid-cols-12  items-center justify-center text-center '>


    <div className='col-start-3 col-span-8 rounded-lg border border-gray-200 bg-white shadow-md p-5'>

    <div className='grid grid-cols-8'>

      <div className='col-start-1 col-span-8 p-5'>
        <div className="text-3xl font-extrabold text-black">Real Time Hack Prevention</div>
        <div className="text-slate-500 font-bold text-lg">learn how Firewalls can prevent hacks</div>
      </div>

      <div className='p-5 col-start-3 col-span-4 gap-5 justify-center items-center '>

      <a href="/no-hack" target="_blank" rel="noopener noreferrer">
        <div className="p-3 m-1 bg-black rounded-xl font-lg text-white hover:bg-slate-500">
          without Circuit Breaker
        </div>
      </a>

      <a href="/hack">
        <div className="p-3 m-1 bg-black rounded-xl font-lg text-white hover:bg-slate-500">
          with Circuit Breaker
        </div>
        </a>

      </div>

      </div>

      </div>

      <div className='col-start-4 col-span-6 text-center mt-12'>
        <div className="text-slate-800">
          <div className='font-bold'>made with ❤️ @ETHGlobal Paris 2023   🇫🇷🥐</div>
          <div className="font-sm">
              based on TurtleShell's Firewall SDK and EIP-7265
          </div>
        </div>
      </div>


</div>

</>

  );
}

export default MainBox;