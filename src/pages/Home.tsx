import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import WalletConnectModal from '../components/wallet/WalletConnectModal';

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  // Auto redirect ke dashboard kalau sudah connected
  useEffect(() => {
    if (isConnected) {
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl flex flex-col">
        
        <div className="flex-1 flex flex-col justify-center px-6 py-12">
          
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BasePay
            </h1>
          </div>

          <div className="text-center mb-16">
            <p className="text-gray-500 text-sm font-medium">
              Crypto Payment Solution
            </p>
          </div>

          <div className="flex justify-center mb-16">
            <img 
              src="/src/assets/images/hero-illustration.png" 
              alt="BasePay Hero" 
              className="w-72 h-72 object-contain"
            />
          </div>

          <div className="text-center mb-10">
            <p className="text-blue-600 text-base font-medium leading-relaxed">
              Scan, pay, and understand<br />
              your onchain money
            </p>
          </div>

          <div className="px-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Connect Wallet
            </button>
          </div>

        </div>

        <div className="h-8 bg-white"></div>

      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Home;



































// import React from "react";

// const Home: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-white flex items-center justify-center p-4">
//       {/* Container - max width untuk desktop */}
//       {/* <div className="w-full max-w-[428px]"> */}
//        <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl flex flex-col">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-blue-600">BasePay</h1>
//         </div>

//         {/* Subtitle */}
//         <div className="text-center mb-6">
//           <p className="text-blue-600 text-lg">Crypto Payment Solution</p>
//         </div>

//         {/* Hero Illustration */}
//         {/* <div className="flex justify-center mb-12">
//           <img
//             src="/src/assets/images/hero-illustration.png"
//             alt="BasePay Hero"
//             className="w-64 h-64 object-contain"
//           />
//         </div> */}

//         {/* Hero Illustration */}
// <div className="flex justify-center mb-1">
//   <img
//     src="/src/assets/images/hero-illustration.png"
//     alt="BasePay Hero"
//     className="w-72 h-72 object-contain animate-float"
//     style={{ animationDuration: '5s' }}
//   />
// </div>

//         {/* Description */}
//         <div className="text-center mb-8 px-6">
//           <p className="text-blue-600 text-base">
//             Scan, pay, and understand
//             <br />
//             your onchain money
//           </p>
//         </div>

//         {/* Connect Wallet Button */}
//         <div className="px-6">
//           <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg">
//             Connect Wallet
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;
