import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Globe, HelpCircle, Info, LogOut, Copy, CheckCircle } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../config/supabase';

interface UserProfile {
  username: string | null;
  email: string | null;
  avatar: string | null;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  
  const [profile, setProfile] = useState<UserProfile>({
    username: null,
    email: null,
    avatar: null,
  });
  const [basepayName, setBasepayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect kalau belum connected
  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) return;

      try {
        setLoading(true);

        // Get user data
        const { data: userData } = await supabase
          .from('user')
          .select('username, email, avatar, id_user')
          .eq('wallet', address.toLowerCase())
          .single();

        if (userData) {
          setProfile({
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar,
          });

          // Get basepay name (primary name)
          const { data: nameData } = await supabase
            .from('basepay_names')
            .select('name')
            .eq('id_user', userData.id_user)
            .eq('is_primary', true)
            .eq('is_active', true)
            .single();

          if (nameData) {
            setBasepayName(nameData.name);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [address]);

  const handleDisconnect = () => {
    disconnect();
    
    // Clear storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
    
    toast.success('Wallet disconnected successfully', {
      duration: 2000,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#fff',
        borderRadius: '12px',
      },
    });
    
    setTimeout(() => {
      navigate('/');
      window.location.href = '/';
    }, 800);
  };

  const copyBasepayName = () => {
    if (basepayName) {
      navigator.clipboard.writeText(`${basepayName}.paybase`);
      toast.success('BasePay name copied!', {
        duration: 2000,
        position: 'top-center',
      });
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!address || !isConnected) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
          
          {/* Header */}
          <div className="bg-white px-5 py-4 border-b border-gray-200 flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
          </div>

          {/* Profile Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 mx-4 mt-4 rounded-3xl p-8 text-center shadow-lg">
            {/* Avatar */}
            <div className="w-32 h-32 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                  <svg className="w-20 h-20 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Username */}
            <h2 className="text-2xl font-bold text-white mb-2">
              {profile.username || 'Anonymous'}
            </h2>

            {/* BasePay Name */}
            {basepayName ? (
              <button
                onClick={copyBasepayName}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-white text-sm font-medium transition-colors"
              >
                <span>{basepayName}.paybase</span>
                <Copy className="w-4 h-4" />
              </button>
            ) : (
              <p className="text-blue-100 text-sm">
                {shortenAddress(address)}
              </p>
            )}
          </div>

          {/* Network Status Card */}
          <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Network Status</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  chain?.id === 8453 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {chain?.id === 8453 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Info className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {chain?.name || 'Unknown Network'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Chain ID: {chain?.id || 'N/A'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                chain?.id === 8453 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {chain?.id === 8453 ? 'Connected' : 'Wrong Network'}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="mx-4 mt-4 space-y-2">
            {/* Edit Profile */}
            <button
              onClick={() => navigate('/EditProfile')}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors active:scale-98"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-900 font-medium">Edit Profile</span>
            </button>

            {/* Language */}
            <button
              onClick={() => toast('Language settings coming soon!', { position: 'top-center' })}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors active:scale-98"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-900 font-medium">Language</span>
            </button>

            {/* Help Center */}
            <button
              onClick={() => toast('Help center coming soon!', { position: 'top-center' })}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors active:scale-98"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-900 font-medium">Help Center</span>
            </button>

            {/* About Basepay */}
            <button
              onClick={() => toast('About BasePay coming soon!', { position: 'top-center' })}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors active:scale-98"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-900 font-medium">About Basepay</span>
            </button>
          </div>

          {/* Disconnect Button */}
          <div className="mx-4 mt-6 mb-8">
            <button
              onClick={handleDisconnect}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;




// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, LogOut, Copy, CheckCircle, AlertCircle } from 'lucide-react';
// import { useAccount, useDisconnect } from 'wagmi';
// import toast, { Toaster } from 'react-hot-toast';

// const Profile: React.FC = () => {
//   const navigate = useNavigate();
//   const { address, chain, isConnected } = useAccount();
//   const { disconnect } = useDisconnect();

//   // Redirect kalau belum connected
//   React.useEffect(() => {
//     if (!isConnected) {
//       navigate('/');
//     }
//   }, [isConnected, navigate]);

//  const handleDisconnect = async () => {
//   try {
//     // 1. Disconnect dari wagmi
//     disconnect();
    
//     // 2. Clear SEMUA localStorage dan sessionStorage
//     localStorage.clear();
//     sessionStorage.clear();
    
//     // 3. Clear cookies (kalau ada)
//     document.cookie.split(";").forEach((c) => {
//       document.cookie = c
//         .replace(/^ +/, "")
//         .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
//     });
    
//     // 4. Show success toast
//     toast.success('Wallet disconnected successfully', {
//       duration: 1500,
//       position: 'top-center',
//       style: {
//         background: '#10b981',
//         color: '#fff',
//         borderRadius: '12px',
//       },
//     });
    
//     // 5. Wait, then redirect dan FORCE RELOAD
//     setTimeout(() => {
//       navigate('/');
//       // Force hard reload untuk clear semua state di memory
//       window.location.href = '/';
//     }, 1000);
    
//   } catch (error) {
//     console.error('Disconnect error:', error);
//     // Tetap clear dan reload meskipun ada error
//     localStorage.clear();
//     sessionStorage.clear();
//     window.location.href = '/';
//   }
// };

//   const copyAddress = () => {
//     if (address) {
//       navigator.clipboard.writeText(address);
//       toast.success('Address copied!', {
//         duration: 2000,
//         position: 'top-center',
//         style: {
//           background: '#10b981',
//           color: '#fff',
//           borderRadius: '12px',
//         },
//       });
//     }
//   };

//   const shortenAddress = (addr: string) => {
//     return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
//   };

//   if (!address || !isConnected) {
//     return null;
//   }

//   const isCorrectNetwork = chain?.id === 8453;

//   return (
//     <>
//       <Toaster />
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
//         <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
          
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
//             <button 
//               onClick={() => navigate('/dashboard')}
//               className="flex items-center gap-2 text-white mb-4"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               <span className="font-medium">Back</span>
//             </button>
//             <h1 className="text-2xl font-bold text-white">Profile</h1>
//           </div>

//           {/* Content */}
//           <div className="px-6 py-6 space-y-6">

//             {/* Wallet Address Card */}
//             <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
//               <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Wallet Address</p>
//               <div className="flex items-center justify-between mb-4">
//                 <p className="text-sm font-mono text-gray-800 flex-1 mr-2">
//                   {shortenAddress(address)}
//                 </p>
//                 <button
//                   onClick={copyAddress}
//                   className="p-2 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
//                   title="Copy full address"
//                 >
//                   <Copy className="w-4 h-4 text-gray-600" />
//                 </button>
//               </div>
              
//               {/* Full Address */}
//               <div className="bg-white rounded-xl p-3 border border-gray-200">
//                 <p className="text-xs font-mono text-gray-600 break-all">
//                   {address}
//                 </p>
//               </div>
//             </div>

//             {/* Network Info Card */}
//             <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
//               <p className="text-xs text-gray-500 mb-3 uppercase font-semibold">Network Status</p>
              
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   {isCorrectNetwork ? (
//                     <CheckCircle className="w-6 h-6 text-green-600" />
//                   ) : (
//                     <AlertCircle className="w-6 h-6 text-red-600" />
//                   )}
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900">
//                       {chain?.name || 'Unknown Network'}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       Chain ID: {chain?.id || 'N/A'}
//                     </p>
//                   </div>
//                 </div>
                
//                 {isCorrectNetwork ? (
//                   <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
//                     Connected
//                   </span>
//                 ) : (
//                   <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
//                     Wrong Network
//                   </span>
//                 )}
//               </div>

//               {!isCorrectNetwork && (
//                 <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
//                   <p className="text-xs text-red-600 font-medium">
//                     ⚠️ Please switch to <span className="font-bold">Base Network</span> in your wallet
//                   </p>
//                   <div className="mt-2 text-xs text-gray-600 space-y-1">
//                     <p>• Network: Base</p>
//                     <p>• Chain ID: 8453</p>
//                     <p>• RPC: https://mainnet.base.org</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Disconnect Button */}
//             <div className="pt-4">
//               <button
//                 onClick={handleDisconnect}
//                 className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
//               >
//                 <LogOut className="w-5 h-5" />
//                 <span>Disconnect Wallet</span>
//               </button>
//             </div>

//             {/* Info Text */}
//             <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
//               <p className="text-xs text-gray-600 text-center">
//                 Disconnecting will remove your wallet connection from this app. You can reconnect anytime.
//               </p>
//             </div>

//           </div>

//         </div>
//       </div>
//     </>
//   );
// };

// export default Profile;
