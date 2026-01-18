// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { User, Copy, AlertCircle } from "lucide-react"; // ← Tambah AlertCircle
// import toast, { Toaster } from "react-hot-toast";
// import { useAccount, useReadContract } from "wagmi";
// import { USDC_CONTRACT_ADDRESS, USDC_ABI } from "../config/wagmi";
// import { formatUnits } from "viem";

// const Dashboard: React.FC = () => {
//   const navigate = useNavigate();
//   const { address, isConnected, chain } = useAccount();

//   // Redirect ke home kalau belum connected
//   useEffect(() => {
//     if (!isConnected) {
//       navigate("/");
//     }
//   }, [isConnected, navigate]);

//   // ← TAMBAHKAN INI: Detect network change
//   useEffect(() => {
//     if (chain && chain.id !== 8453) {
//       toast.error("Please switch to Base network", {
//         duration: 4000,
//         position: "top-center",
//         icon: "⚠️",
//       });
//     }
//   }, [chain]);

//   // Fetch USDC Balance - tambahkan query key untuk refetch
//   const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
//     address: USDC_CONTRACT_ADDRESS,
//     abi: USDC_ABI,
//     functionName: "balanceOf",
//     args: address ? [address] : undefined,
//     query: {
//       enabled: !!address && chain?.id === 8453, // ← Hanya fetch kalau di Base network
//     },
//   });

//   // ← TAMBAHKAN INI: Refetch balance ketika network berubah
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

//   // Mock monthly summary (nanti bisa fetch dari indexer)

//   // Mock transaction history
//   const [transactions, setTransactions] = React.useState([
//     {
//       type: "Transfer",
//       from: "metamask",
//       to: "coffee shop",
//       amount: 5,
//       timestamp: Date.now(),
//     },
//     {
//       type: "Receive",
//       from: "john.base",
//       to: "wallet",
//       amount: 5,
//       timestamp: Date.now(),
//     },
//     {
//       type: "Transfer",
//       from: "wallet",
//       to: "friend",
//       amount: 1,
//       timestamp: Date.now(),
//     },
//   ]);

//   const calculateMonthlyFlow = () => {
//     const now = new Date();
//     const firstDayOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       1,
//     ).getTime();

//     const thisMonthTx = transactions.filter(
//       (tx) => tx.timestamp >= firstDayOfMonth,
//     );

//     const inflow = thisMonthTx
//       .filter((tx) => tx.type === "Receive")
//       .reduce((sum, tx) => sum + tx.amount, 0);

//     const outflow = thisMonthTx
//       .filter((tx) => tx.type === "Transfer")
//       .reduce((sum, tx) => sum + tx.amount, 0);

//     return { inflow, outflow };
//   };

//   const { inflow: inflowUSDC, outflow: outflowUSDC } = calculateMonthlyFlow();
//   const inflowIdr = inflowUSDC * usdcToIdr;
//   const outflowIdr = outflowUSDC * usdcToIdr;

//   const shortenAddress = (addr: string) => {
//     return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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

//   // Loading state
//   if (!isConnected || !address) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
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
//         {/* Mobile Container */}
//         <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
//             <h1 className="text-xl font-bold text-white">BasePay</h1>
//             <button
//               onClick={() => navigate("/profile")}
//               className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors active:scale-95"
//             >
//               <User className="w-5 h-5 text-white" />
//             </button>
//           </div>

//           {/* Connected Wallet */}
//           <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-gray-500 mb-1">Connected</p>
//               <p className="text-sm font-mono text-gray-800">
//                 {shortenAddress(address)}
//               </p>
//             </div>
//             <button
//               onClick={copyAddress}
//               className="p-2 hover:bg-blue-100 rounded-lg transition-colors active:scale-95"
//               title="Copy address"
//             >
//               <Copy className="w-4 h-4 text-blue-600" />
//             </button>
//           </div>

//           {/* Network Warning jika bukan Base */}
//           {/* Network Warning jika bukan Base */}
//           {chain?.id !== 8453 && (
//             <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
//               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
//               <div>
//                 <p className="text-sm text-red-600 font-semibold">
//                   Wrong Network
//                 </p>
//                 <p className="text-xs text-red-500 mt-1">
//                   Please switch to Base network in your wallet
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Main Content */}
//           <div className="px-6 py-6 space-y-6 pb-24">
//             {/* Balance Card */}
//             <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 shadow-lg">
//               <p className="text-blue-100 text-sm mb-2">Total Balance</p>
//               <p className="text-white text-3xl font-bold mb-1">
//                 Rp. {formatCurrency(balanceInIdr)}
//               </p>
//               <p className="text-blue-200 text-xs">
//                 {formatCurrency(usdcAmount)} USDC
//               </p>
//             </div>

//             {/* Quick Actions */}
//             <div>
//               <p className="text-gray-700 font-medium mb-4">Quick Actions :</p>
//               <div className="grid grid-cols-4 gap-3">
//                 {/* Pay */}
//                 <button
//                   onClick={() => navigate("/scan")}
//                   className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95"
//                 >
//                   <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
//                     <span className="text-2xl">📱</span>
//                   </div>
//                   <span className="text-xs font-medium text-gray-700">Pay</span>
//                 </button>

//                 {/* Request */}
//                 <button
//                   onClick={() => navigate("/request")}
//                   className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95"
//                 >
//                   <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
//                     <span className="text-2xl">💳</span>
//                   </div>
//                   <span className="text-xs font-medium text-gray-700">
//                     Request
//                   </span>
//                 </button>

//                 {/* History */}
//                 <button
//                   onClick={() => navigate("/history")}
//                   className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95"
//                 >
//                   <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
//                     <span className="text-2xl">📜</span>
//                   </div>
//                   <span className="text-xs font-medium text-gray-700">
//                     History
//                   </span>
//                 </button>

//                 {/* Analytic */}
//                 <button
//                   onClick={() => navigate("/analytics")}
//                   className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95"
//                 >
//                   <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
//                     <span className="text-2xl">📊</span>
//                   </div>
//                   <span className="text-xs font-medium text-gray-700">
//                     Analytic
//                   </span>
//                 </button>
//               </div>
//             </div>

//             {/* Monthly Summary */}
//             <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-gray-600 font-medium">
//                   Inflow
//                 </span>
//                 <div className="text-right">
//                   <p className="text-lg font-bold text-green-600">
//                     Rp. {formatCurrency(inflowIdr)}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {formatCurrency(inflowUSDC)} USDC
//                   </p>
//                 </div>
//               </div>
//               <div className="h-px bg-gray-200"></div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-gray-600 font-medium">
//                   Outflow
//                 </span>
//                 <div className="text-right">
//                   <p className="text-lg font-bold text-red-600">
//                     Rp. {formatCurrency(outflowIdr)}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {formatCurrency(outflowUSDC)} USDC
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Transaction History */}
//             <div>
//               <p className="text-gray-700 font-medium mb-3">
//                 Transaction History :
//               </p>
//               <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
//                 <table className="w-full text-xs">
//                   <thead className="bg-gray-50 border-b border-gray-200">
//                     <tr>
//                       <th className="px-3 py-2 text-left font-semibold text-gray-600">
//                         type
//                       </th>
//                       <th className="px-3 py-2 text-left font-semibold text-gray-600">
//                         from
//                       </th>
//                       <th className="px-3 py-2 text-left font-semibold text-gray-600">
//                         to
//                       </th>
//                       <th className="px-3 py-2 text-right font-semibold text-gray-600">
//                         balance
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {transactions.map((tx, index) => (
//                       <tr
//                         key={index}
//                         className="hover:bg-gray-50 transition-colors"
//                       >
//                         <td className="px-3 py-3 text-gray-700 font-medium">
//                           {tx.type}
//                         </td>
//                         <td className="px-3 py-3 text-gray-600">{tx.from}</td>
//                         <td className="px-3 py-3 text-gray-600">{tx.to}</td>
//                         <td className="px-3 py-3 text-right font-semibold text-gray-900">
//                           ${tx.amount}
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

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Copy, ScanLine, QrCode, Clock, TrendingUp } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAccount, useReadContract } from "wagmi";
import { USDC_CONTRACT_ADDRESS, USDC_ABI } from "../config/wagmi";
import { formatUnits } from "viem";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected, chain } = useAccount();

  // Redirect ke home kalau belum connected
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

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

  // Mock transaction history
  const transactions = [
    { type: "Transfer", from: "redscale", to: "coffe shop", amount: 5000 },
  ];

  // Calculate monthly flow dari transactions
  const inflowUSDC = 120;
  const outflowUSDC = 238;
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
       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      {/* Mobile Container - Tambah shadow */}
      <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
        
        {/* Header - Inline Layout */}
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
              <div className="grid grid-cols-4 gap-4">
                {/* Pay */}
                <button
                  onClick={() => navigate("/scan")}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <ScanLine
                      className="w-7 h-7 text-gray-900"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900">Pay</span>
                </button>

                {/* Request */}
                <button
                  onClick={() => navigate("/request")}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <QrCode className="w-7 h-7 text-gray-900" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    Request
                  </span>
                </button>

                {/* History */}
                <button
                  onClick={() => navigate("/history")}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Clock className="w-7 h-7 text-gray-900" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    Hystory
                  </span>
                </button>

                {/* Analytic */}
                <button
                  onClick={() => navigate("/analytics")}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 border-2 border-gray-900 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <TrendingUp
                      className="w-7 h-7 text-gray-900"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    Analytic
                  </span>
                </button>
              </div>
            </div>

            {/* Monthly Summary - Horizontal Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Inflow */}
              <div className="border-2 border-gray-600 rounded-2xl p-4">
                <p className="text-xs text-gray-600 mb-2 font-medium">Inflow</p>
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

            {/* Transaction History */}
            <div>
              <p className="text-gray-900 font-semibold mb-4 text-sm">
                Transaction History :
              </p>
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full">
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
                        balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-4 py-4 text-xs text-gray-900 font-medium">
                          {tx.type}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {tx.from}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {tx.to}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-900 font-semibold text-right">
                          {tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
