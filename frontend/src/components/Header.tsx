import logo from "../assets/logo.svg";
import { WalletBtn } from "./WalletBtn";
import Button from "./Button";

function Header() {
  return (
    <div className='grid grid-cols-12 gap-4 justify-center items-center pt-5'>
      <div className='col-start-1 col-span-7'>
        <div className='flex flex-row items-center justify-center gap-5 '>
          <img src={logo} alt='' />
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

   
      {/* 
        <div className="col-start-7 col-span-3 p-1 m-1 bg-black rounded-xl text-sm font-bold text-white">
          DEMO: Lending & Borrowing Mock App
        </div> */}

      <div className='col-start-8 col-span-5 p-2 m-5'>
        <WalletBtn />
      </div>
    </div>
  );
}

export default Header;
