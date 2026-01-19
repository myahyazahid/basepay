import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useConnect } from 'wagmi';
import toast from 'react-hot-toast';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { connectors, connect, isPending } = useConnect();

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      onClose();
      toast.success('Wallet connected!');
    } catch (error: any) {
      console.error('Connection failed:', error);
      toast.error(error?.message || 'Failed to connect wallet');
    }
  };

  // Map connector names to user-friendly info
  const getWalletInfo = (connector: any) => {
    const name = connector.name.toLowerCase();
    
    if (name.includes('injected') || name.includes('metamask')) {
      return { name: 'MetaMask', icon: '🦊', description: 'Browser Extension' };
    }
    if (name.includes('walletconnect')) {
      return { name: 'WalletConnect', icon: '🔗', description: 'Scan QR Code' };
    }
    if (name.includes('coinbase')) {
      return { name: 'Coinbase Wallet', icon: '🔵', description: 'Mobile & Extension' };
    }
    
    return { name: connector.name, icon: '💼', description: 'Connect' };
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-full"
            >
              <Dialog.Panel className="w-full max-w-[390px] transform overflow-hidden rounded-t-3xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Connect Wallet
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Wallet Options */}
                <div className="px-4 py-6 space-y-3 max-h-[60vh] overflow-y-auto">
                  {connectors.map((connector) => {
                    const walletInfo = getWalletInfo(connector);
                    return (
                      <button
                        key={connector.uid}
                        onClick={() => handleConnect(connector)}
                        disabled={isPending}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-3xl">{walletInfo.icon}</span>
                        <div className="text-left flex-1">
                          <span className="text-base font-medium text-gray-900 block">
                            {walletInfo.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {walletInfo.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Info Text */}
                <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                  <p className="text-xs text-gray-600 text-center">
                    By connecting, you agree to Base network usage
                  </p>
                </div>

                {/* Bottom Safe Area */}
                <div className="h-8 bg-white"></div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default WalletConnectModal;


// import React, { Fragment } from 'react';
// import { Dialog, Transition } from '@headlessui/react';
// import { X } from 'lucide-react';
// import { useConnect, useDisconnect } from 'wagmi';
// import toast from 'react-hot-toast';

// interface WalletConnectModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
//   isOpen,
//   onClose,
// }) => {
//   const { connectors, connect, isPending } = useConnect();
//   const { disconnect } = useDisconnect();

//   const handleConnect = async (connector: any) => {
//     try {
//       console.log('User clicked connect:', connector.name);
      
//       // Disconnect dulu untuk clear cache
//       disconnect();
      
//       // Clear storage
//       localStorage.removeItem('wagmi.store');
//       localStorage.removeItem('wagmi.cache');
//       localStorage.removeItem('wagmi.recentConnectorId');
      
//       await new Promise(resolve => setTimeout(resolve, 100));
      
//       // Connect dengan connector
//       await connect({ connector });
      
//       console.log('Connection successful');
      
//       onClose();
//       toast.success('Wallet connected!', {
//         duration: 2000,
//         position: 'top-center',
//       });
      
//     } catch (error: any) {
//       console.error('Connection failed:', error);
      
//       if (error?.message?.includes('User rejected') || error?.message?.includes('rejected')) {
//         toast.error('Connection cancelled', {
//           duration: 2000,
//           position: 'top-center',
//         });
//       } else {
//         toast.error(error?.message || 'Failed to connect wallet', {
//           duration: 3000,
//           position: 'top-center',
//         });
//       }
//     }
//   };

//   const getWalletInfo = (connector: any) => {
//     const name = connector.name.toLowerCase();
    
//     if (name.includes('injected') || name.includes('metamask')) {
//       return { name: 'Browser Wallet', icon: '🦊', description: 'Injected Provider' };
//     }
//     if (name.includes('walletconnect')) {
//       return { name: 'WalletConnect', icon: '🔗', description: 'Scan QR Code' };
//     }
//     if (name.includes('coinbase')) {
//       return { name: 'Coinbase Wallet', icon: '🔵', description: 'Mobile & Extension' };
//     }
    
//     return { name: connector.name, icon: '💼', description: 'Connect' };
//   };

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-50" onClose={onClose}>
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black bg-opacity-40" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-end justify-center">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 translate-y-full"
//               enterTo="opacity-100 translate-y-0"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 translate-y-0"
//               leaveTo="opacity-0 translate-y-full"
//             >
//               <Dialog.Panel className="w-full max-w-[390px] transform overflow-hidden rounded-t-3xl bg-white shadow-xl transition-all">
//                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//                   <Dialog.Title className="text-lg font-semibold text-gray-900">
//                     Connect Wallet
//                   </Dialog.Title>
//                   <button
//                     onClick={onClose}
//                     className="text-gray-400 hover:text-gray-600 transition-colors"
//                   >
//                     <X className="w-6 h-6" />
//                   </button>
//                 </div>

//                 <div className="px-4 py-6 space-y-3 max-h-[60vh] overflow-y-auto">
//                   {connectors.map((connector) => {
//                     const walletInfo = getWalletInfo(connector);
//                     return (
//                       <button
//                         key={connector.uid}
//                         onClick={() => handleConnect(connector)}
//                         disabled={isPending}
//                         className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         <span className="text-3xl">{walletInfo.icon}</span>
//                         <div className="text-left flex-1">
//                           <span className="text-base font-medium text-gray-900 block">
//                             {walletInfo.name}
//                           </span>
//                           <span className="text-xs text-gray-500">
//                             {walletInfo.description}
//                           </span>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
//                   <p className="text-xs text-gray-600 text-center">
//                     By connecting, you agree to Base network usage
//                   </p>
//                 </div>

//                 <div className="h-8 bg-white"></div>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };

// export default WalletConnectModal;