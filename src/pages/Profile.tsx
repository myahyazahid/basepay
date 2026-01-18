import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import toast, { Toaster } from 'react-hot-toast';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { address, chain, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Redirect kalau belum connected
  React.useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

 const handleDisconnect = async () => {
  try {
    // 1. Disconnect dari wagmi
    disconnect();
    
    // 2. Clear SEMUA localStorage dan sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // 3. Clear cookies (kalau ada)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // 4. Show success toast
    toast.success('Wallet disconnected successfully', {
      duration: 1500,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#fff',
        borderRadius: '12px',
      },
    });
    
    // 5. Wait, then redirect dan FORCE RELOAD
    setTimeout(() => {
      navigate('/');
      // Force hard reload untuk clear semua state di memory
      window.location.href = '/';
    }, 1000);
    
  } catch (error) {
    console.error('Disconnect error:', error);
    // Tetap clear dan reload meskipun ada error
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
};

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
        },
      });
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (!address || !isConnected) {
    return null;
  }

  const isCorrectNetwork = chain?.id === 8453;

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">

            {/* Wallet Address Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
              <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Wallet Address</p>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-mono text-gray-800 flex-1 mr-2">
                  {shortenAddress(address)}
                </p>
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
                  title="Copy full address"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {/* Full Address */}
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-xs font-mono text-gray-600 break-all">
                  {address}
                </p>
              </div>
            </div>

            {/* Network Info Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Network Status</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isCorrectNetwork ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {chain?.name || 'Unknown Network'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Chain ID: {chain?.id || 'N/A'}
                    </p>
                  </div>
                </div>
                
                {isCorrectNetwork ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Connected
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    Wrong Network
                  </span>
                )}
              </div>

              {!isCorrectNetwork && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ Please switch to <span className="font-bold">Base Network</span> in your wallet
                  </p>
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <p>• Network: Base</p>
                    <p>• Chain ID: 8453</p>
                    <p>• RPC: https://mainnet.base.org</p>
                  </div>
                </div>
              )}
            </div>

            {/* Disconnect Button */}
            <div className="pt-4">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                <span>Disconnect Wallet</span>
              </button>
            </div>

            {/* Info Text */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs text-gray-600 text-center">
                Disconnecting will remove your wallet connection from this app. You can reconnect anytime.
              </p>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;