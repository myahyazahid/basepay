import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Copy,
  ScanLine,
  QrCode,
  Clock,
  TrendingUp,
  Gift,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAccount, useReadContract, useSwitchChain } from "wagmi";
import { USDC_CONTRACT_ADDRESS, USDC_ABI } from "../config/wagmi";
import { formatUnits } from "viem";
// ← TAMBAH import hooks
import { useTransactions } from "../hooks/useTransactions";
import { useMonthlyCashflow } from "../hooks/useMonthlyCashflow";
import ProfileSetupModal from "../components/ProfileSetupModal";
import { checkProfileComplete } from "../utils/userManagement";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  // ← TAMBAH: Fetch data dari Supabase
  const { transactions, loading: txLoading } = useTransactions(address);
  const { cashflow, loading: cashflowLoading } = useMonthlyCashflow(address);

  // Redirect ke home kalau belum connected
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  // Redirect ke home kalau belum connected
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  // ← TAMBAH useEffect INI (Check profile completion)
  useEffect(() => {
    const checkProfile = async () => {
      if (isConnected && address && !profileChecked) {
        // Wait sebentar supaya user data sudah ter-insert
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const isComplete = await checkProfileComplete(address);

        if (!isComplete) {
          console.log("⚠️ Profile incomplete, showing setup modal");
          setShowProfileSetup(true);
        } else {
          console.log("✅ Profile is complete");
        }

        setProfileChecked(true);
      }
    };

    checkProfile();
  }, [isConnected, address, profileChecked]);

  // ... rest of useEffect yang sudah ada

  // Detect network change
  useEffect(() => {
    if (chain && chain.id !== 8453) {
      toast.error("Please switch to Base network", {
        duration: 4000,
        position: "top-center",
        icon: "⚠️",
      });
    }
  }, [chain]);

  // Fetch USDC Balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && chain?.id === 8453,
    },
  });

  // Refetch balance ketika network berubah
  useEffect(() => {
    if (chain?.id === 8453 && address) {
      refetchBalance();
    }
  }, [chain?.id, address, refetchBalance]);

  // Konversi USDC balance (6 decimals) ke number
  const usdcAmount = usdcBalance
    ? parseFloat(formatUnits(usdcBalance as bigint, 6))
    : 0;

  // Konversi ke IDR (1 USDC = 16,800 IDR)
  const usdcToIdr = 16800;
  const balanceInIdr = usdcAmount * usdcToIdr;

  // ← GANTI: Gunakan data dari Supabase
  const inflowUSDC = cashflow.inflow;
  const outflowUSDC = cashflow.outflow;
  const inflowIdr = inflowUSDC * usdcToIdr;
  const outflowIdr = outflowUSDC * usdcToIdr;

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-2)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied!", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#10b981",
          color: "#fff",
          borderRadius: "12px",
        },
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSwitchToBase = async () => {
    try {
      await switchChain({ chainId: 8453 });
      toast.success("Switched to Base network!", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#10b981",
          color: "#fff",
          borderRadius: "12px",
        },
      });
    } catch (error: any) {
      console.error("Switch network error:", error);

      if (error?.message?.includes("User rejected")) {
        toast.error("Network switch cancelled", {
          duration: 2000,
          position: "top-center",
        });
      } else {
        toast.error("Failed to switch network", {
          duration: 3000,
          position: "top-center",
        });
      }
    }
  };

  // Loading state
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />

      <ProfileSetupModal
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <h1 className="text-xl font-bold text-blue-600">BasePay</h1>

            <div className="flex items-center gap-3">
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900"
              >
                <span className="font-mono">
                  Connected {shortenAddress(address)}
                </span>
                <Copy className="w-3 h-3" />
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <User className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Network Warning */}
          {chain?.id !== 8453 && (
            <div className="px-5 py-4 bg-red-50 border-b border-red-100">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-red-600 font-semibold mb-1">
                    ⚠️ Wrong Network
                  </p>
                  <p className="text-xs text-red-500">
                    You're on{" "}
                    <span className="font-semibold">
                      {chain?.name || "Unknown"}
                    </span>
                    . Please switch to Base network.
                  </p>
                </div>
                <button
                  onClick={handleSwitchToBase}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors active:scale-95 whitespace-nowrap"
                >
                  Switch to Base
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="px-5 py-6 space-y-6">
            {/* Balance Card */}
            <div className="bg-blue-600 rounded-3xl p-6 shadow-md">
              <p className="text-blue-100 text-sm mb-3 font-medium">
                Total Balance
              </p>
              <p className="text-white text-4xl font-bold mb-2">
                Rp. {formatCurrency(balanceInIdr)}
              </p>
              <p className="text-blue-200 text-xs">
                {formatCurrency(usdcAmount)} USDC
              </p>
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-gray-900 font-semibold mb-4 text-sm">
                Quick Actions :
              </p>
              <div className="grid grid-cols-5 gap-3">
                <button
                  onClick={() => navigate("/scan")}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <ScanLine
                      className="w-6 h-6 text-gray-900"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900">Pay</span>
                </button>

                <button
                  onClick={() => navigate("/request")}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <QrCode className="w-6 h-6 text-gray-900" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    Request
                  </span>
                </button>

                <button
                  onClick={() => navigate("/history")}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Clock className="w-6 h-6 text-gray-900" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    History
                  </span>
                </button>

                <button
                  onClick={() => navigate("/analytics")}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <TrendingUp
                      className="w-6 h-6 text-gray-900"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    Analytic
                  </span>
                </button>

                <button
                  onClick={() => navigate("/rewards")}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Gift className="w-6 h-6 text-gray-900" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    Rewards
                  </span>
                </button>
              </div>
            </div>

            {/* Monthly Summary */}
            <div>
              <p className="text-gray-900 font-semibold mb-4 text-sm">
                Monthly Cashflow :
              </p>
              {cashflowLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* Inflow */}
                  <div className="border-2 border-gray-600 rounded-2xl p-4">
                    <p className="text-xs text-gray-600 mb-2 font-medium">
                      Inflow
                    </p>
                    <p className="text-md font-bold text-green-600 mb-1">
                      Rp. {formatCurrency(inflowIdr)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(inflowUSDC)} USDC
                    </p>
                  </div>

                  {/* Outflow */}
                  <div className="border-2 border-gray-600 rounded-2xl p-4">
                    <p className="text-xs text-gray-600 mb-2 font-medium">
                      Outflow
                    </p>
                    <p className="text-md font-bold text-red-600 mb-1">
                      Rp. {formatCurrency(outflowIdr)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(outflowUSDC)} USDC
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div>
              <p className="text-gray-900 font-semibold mb-4 text-sm">
                Transaction History :
              </p>
              {/* <div className="border border-gray-200 rounded-2xl overflow-hidden"> */}
              <div className="border border-gray-200 rounded-2xl overflow-x-auto max-h-[320px] overflow-y-auto">
                {txLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">
                      Loading transactions...
                    </p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No transactions yet</p>
                  </div>
                ) : (
                  // <table className="w-full">
                  <table className="w-full min-w-[360px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                          type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                          from
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                          to
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                          amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-4 py-4 text-xs text-gray-900 font-medium">
                            {tx.type}
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600">
                            {tx.from_name || shortenAddress(tx.from_wallet)}
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600">
                            {tx.to_name || shortenAddress(tx.to_wallet)}
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-900 font-semibold text-right">
                            {tx.amount.toLocaleString()} {tx.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   User,
//   Copy,
//   ScanLine,
//   QrCode,
//   Clock,
//   TrendingUp,
//   Gift,
// } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import { useAccount, useReadContract, useSwitchChain } from 'wagmi';
// import { USDC_CONTRACT_ADDRESS, USDC_ABI } from "../config/wagmi";
// import { formatUnits } from "viem";
// // ← TAMBAH import hooks
// import { useTransactions } from '../hooks/useTransactions';
// import { useMonthlyCashflow } from '../hooks/useMonthlyCashflow';

// //                                                             ↑ TAMBAH ini

// const Dashboard: React.FC = () => {
//   const navigate = useNavigate();
//   const { address, isConnected, chain } = useAccount();
//     const { switchChain } = useSwitchChain();

//   // Redirect ke home kalau belum connected
//   useEffect(() => {
//     if (!isConnected) {
//       navigate("/");
//     }
//   }, [isConnected, navigate]);

//   // Detect network change
//   useEffect(() => {
//     if (chain && chain.id !== 8453) {
//       toast.error("Please switch to Base network", {
//         duration: 4000,
//         position: "top-center",
//         icon: "⚠️",
//       });
//     }
//   }, [chain]);

//   // Fetch USDC Balance
//   const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
//     address: USDC_CONTRACT_ADDRESS,
//     abi: USDC_ABI,
//     functionName: "balanceOf",
//     args: address ? [address] : undefined,
//     query: {
//       enabled: !!address && chain?.id === 8453,
//     },
//   });

//   // Refetch balance ketika network berubah
//   useEffect(() => {
//     if (chain?.id === 8453 && address) {
//       refetchBalance();
//     }
//   }, [chain?.id, address, refetchBalance]);

//   // Konversi USDC balance (6 decimals) ke number
//   const usdcAmount = usdcBalance
//     ? parseFloat(formatUnits(usdcBalance as bigint, 6))
//     : 0;

//   // Konversi ke IDR (1 USDC = 16,800 IDR)
//   const usdcToIdr = 16800;
//   const balanceInIdr = usdcAmount * usdcToIdr;

//   // Mock transaction history
//   // const transactions = [
//   //   { type: "Transfer", from: "redscale", to: "coffe shop", amount: 5000 },
//   // ];

//   // ← TAMBAH: Fetch data dari Supabase
// const { transactions, loading: txLoading } = useTransactions(address);
// const { cashflow, loading: cashflowLoading } = useMonthlyCashflow(address);

//   // Calculate monthly flow dari transactions
//   // const inflowUSDC = 120;
//   // const outflowUSDC = 238;
//   const inflowUSDC = cashflow?.inflow ?? 0;
// const outflowUSDC = cashflow?.outflow ?? 0;

//   const inflowIdr = inflowUSDC * usdcToIdr;
//   const outflowIdr = outflowUSDC * usdcToIdr;

//   const shortenAddress = (addr: string) => {
//     return `${addr.slice(0, 6)}...${addr.slice(-2)}`;
//   };

//   const copyAddress = () => {
//     if (address) {
//       navigator.clipboard.writeText(address);
//       toast.success("Address copied!", {
//         duration: 2000,
//         position: "top-center",
//         style: {
//           background: "#10b981",
//           color: "#fff",
//           borderRadius: "12px",
//         },
//       });
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return amount.toLocaleString("id-ID", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
//   };

//   const handleSwitchToBase = async () => {
//   try {
//     await switchChain({ chainId: 8453 }); // Base chainId
//     toast.success('Switched to Base network!', {
//       duration: 2000,
//       position: 'top-center',
//       style: {
//         background: '#10b981',
//         color: '#fff',
//         borderRadius: '12px',
//       },
//     });
//   } catch (error: any) {
//     console.error('Switch network error:', error);

//     // Kalau user reject
//     if (error?.message?.includes('User rejected')) {
//       toast.error('Network switch cancelled', {
//         duration: 2000,
//         position: 'top-center',
//       });
//     } else {
//       toast.error('Failed to switch network', {
//         duration: 3000,
//         position: 'top-center',
//       });
//     }
//   }
// };

//   // Loading state
//   if (!isConnected || !address) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster />
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
//         {/* Mobile Container - Tambah shadow */}
//         <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
//           {/* Header - Inline Layout */}
//           <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
//             <h1 className="text-xl font-bold text-blue-600">BasePay</h1>

//             <div className="flex items-center gap-3">
//               <button
//                 onClick={copyAddress}
//                 className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900"
//               >
//                 <span className="font-mono">
//                   Connected {shortenAddress(address)}
//                 </span>
//                 <Copy className="w-3 h-3" />
//               </button>

//               <button
//                 onClick={() => navigate("/profile")}
//                 className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
//               >
//                 <User className="w-4 h-4 text-blue-600" />
//               </button>
//             </div>
//           </div>

// {/* Network Warning jika bukan Base */}
// {chain?.id !== 8453 && (
//   <div className="px-5 py-4 bg-red-50 border-b border-red-100">
//     <div className="flex items-center justify-between gap-3">
//       <div className="flex-1">
//         <p className="text-sm text-red-600 font-semibold mb-1">⚠️ Wrong Network</p>
//         <p className="text-xs text-red-500">
//           You're on <span className="font-semibold">{chain?.name || 'Unknown'}</span>. Please switch to Base network.
//         </p>
//       </div>
//       <button
//         onClick={handleSwitchToBase}
//         className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors active:scale-95 whitespace-nowrap"
//       >
//         Switch to Base
//       </button>
//     </div>
//   </div>
// )}

//           {/* Main Content */}
//           <div className="px-5 py-6 space-y-6">
//             {/* Balance Card */}
//             <div className="bg-blue-600 rounded-3xl p-6 shadow-md">
//               <p className="text-blue-100 text-sm mb-3 font-medium">
//                 Total Balance
//               </p>
//               <p className="text-white text-4xl font-bold mb-2">
//                 Rp. {formatCurrency(balanceInIdr)}
//               </p>
//               <p className="text-blue-200 text-xs">
//                 {formatCurrency(usdcAmount)} USDC
//               </p>
//             </div>

//             {/* Quick Actions */}
//             {/* Quick Actions */}
//             <div>
//               <p className="text-gray-900 font-semibold mb-4 text-sm">
//                 Quick Actions :
//               </p>
//               <div className="grid grid-cols-5 gap-3">
//                 {" "}
//                 {/* ← Ganti jadi grid-cols-5, gap lebih kecil */}
//                 {/* Pay */}
//                 <button
//                   onClick={() => navigate("/scan")}
//                   className="flex flex-col items-center gap-2"
//                 >
//                   <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
//                     <ScanLine
//                       className="w-6 h-6 text-gray-900"
//                       strokeWidth={2}
//                     />
//                   </div>
//                   <span className="text-xs font-medium text-gray-900">Pay</span>
//                 </button>
//                 {/* Request */}
//                 <button
//                   onClick={() => navigate("/request")}
//                   className="flex flex-col items-center gap-2"
//                 >
//                   <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
//                     <QrCode className="w-6 h-6 text-gray-900" strokeWidth={2} />
//                   </div>
//                   <span className="text-xs font-medium text-gray-900">
//                     Request
//                   </span>
//                 </button>
//                 {/* History */}
//                 <button
//                   onClick={() => navigate("/history")}
//                   className="flex flex-col items-center gap-2"
//                 >
//                   <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
//                     <Clock className="w-6 h-6 text-gray-900" strokeWidth={2} />
//                   </div>
//                   <span className="text-xs font-medium text-gray-900">
//                     History
//                   </span>
//                 </button>
//                 {/* Analytic */}
//                 <button
//                   onClick={() => navigate("/analytics")}
//                   className="flex flex-col items-center gap-2"
//                 >
//                   <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
//                     <TrendingUp
//                       className="w-6 h-6 text-gray-900"
//                       strokeWidth={2}
//                     />
//                   </div>
//                   <span className="text-xs font-medium text-gray-900">
//                     Analytic
//                   </span>
//                 </button>
//                 {/* Rewards - NEW */}
//                 <button
//                   onClick={() => navigate("/rewards")}
//                   className="flex flex-col items-center gap-2"
//                 >
//                   <div className="w-14 h-14 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
//                     <Gift className="w-6 h-6 text-gray-900" strokeWidth={2} />
//                   </div>
//                   <span className="text-xs font-medium text-gray-900">
//                     Rewards
//                   </span>
//                 </button>
//               </div>
//             </div>

//             {/* Monthly Summary - Horizontal Layout */}
//             <p className="text-gray-900 font-semibold mb-4 text-sm">
//               Monthly Cashflow :
//             </p>
//             <div className="grid grid-cols-2 gap-4">
//               {/* Inflow */}
//               <div className="border-2 border-gray-600 rounded-2xl p-4">
//                 <p className="text-xs text-gray-600 mb-2 font-medium">Inflow</p>
//                 <p className="text-md font-bold text-green-600 mb-1">
//                   Rp. {formatCurrency(inflowIdr)}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {formatCurrency(inflowUSDC)} USDC
//                 </p>
//               </div>

//               {/* Outflow */}
//               <div className="border-2 border-gray-600 rounded-2xl p-4">
//                 <p className="text-xs text-gray-600 mb-2 font-medium">
//                   Outflow
//                 </p>
//                 <p className="text-md font-bold text-red-600 mb-1">
//                   Rp. {formatCurrency(outflowIdr)}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {formatCurrency(outflowUSDC)} USDC
//                 </p>
//               </div>
//             </div>

//             {/* Transaction History */}
//             <div>
//               <p className="text-gray-900 font-semibold mb-4 text-sm">
//                 Transaction History :
//               </p>
//               <div className="border border-gray-200 rounded-2xl overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-gray-50 border-b border-gray-200">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
//                         type
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
//                         from
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
//                         to
//                       </th>
//                       <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
//                         balance
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {transactions.map((tx, index) => (
//                       <tr
//                         key={index}
//                         className="border-b border-gray-100 last:border-0"
//                       >
//                         <td className="px-4 py-4 text-xs text-gray-900 font-medium">
//                           {tx.type}
//                         </td>
//                         <td className="px-4 py-4 text-xs text-gray-600">
//                           {tx.from}
//                         </td>
//                         <td className="px-4 py-4 text-xs text-gray-600">
//                           {tx.to}
//                         </td>
//                         <td className="px-4 py-4 text-xs text-gray-900 font-semibold text-right">
//                           {tx.amount.toLocaleString()}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Dashboard;
