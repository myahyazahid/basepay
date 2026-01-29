import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { USDC_CONTRACT_ADDRESS, USDC_ABI } from "../config/wagmi";
import toast from "react-hot-toast";
import type { BasepayNameResult } from "../hooks/Usebasepayname";
import {
  getUserIdFromWallet,
  getUserPrimaryName,
  isFirstTimeRecipient,
  saveTransaction,
  getBaseScanUrl,
} from "../utils/Transactionutils";

interface PreviewState {
  recipient: BasepayNameResult;
  amountIdr: number;
  amountUsdc: number;
  note: string;
}

const SendPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();

  const state = location.state as PreviewState | null;

  const [isFirstTime, setIsFirstTime] = useState(false);
  const [checkingHistory, setCheckingHistory] = useState(true);

  // Contract write hook
  const {
    data: hash,
    isPending: isSigning,
    writeContract,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Redirect if no state
  useEffect(() => {
    if (!state || !isConnected) {
      navigate("/send");
    }
  }, [state, isConnected, navigate]);

  // Check if recipient is first-time
  useEffect(() => {
    const checkFirstTime = async () => {
      if (!address || !state?.recipient) return;

      setCheckingHistory(true);

      try {
        const isFirstTime = await isFirstTimeRecipient(
          address,
          state.recipient.wallet
        );
        setIsFirstTime(isFirstTime);
      } catch (error) {
        console.error("Error checking transaction history:", error);
        setIsFirstTime(true); // Treat as first-time on error (safer)
      } finally {
        setCheckingHistory(false);
      }
    };

    checkFirstTime();
  }, [address, state?.recipient]);

  // Handle successful transaction - Save to Supabase
  useEffect(() => {
    const handleTransactionSuccess = async () => {
      if (!isConfirmed || !hash || !address || !state) return;

      console.log("💾 Processing successful transaction...");

      try {
        // 1. Get sender's user ID
        const userId = await getUserIdFromWallet(address);
        if (!userId) {
          throw new Error("User not found in database");
        }

        // 2. Get sender's primary BasePay name
        const senderName = await getUserPrimaryName(userId);
        console.log("📛 Sender name:", senderName || "None");

        // 3. Save transaction
        const result = await saveTransaction({
          userId,
          fromWallet: address,
          toWallet: state.recipient.wallet,
          fromName: senderName,
          toName: state.recipient.name,
          amountUsdc: state.amountUsdc,
          note: state.note || null,
          txHash: hash,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to save transaction");
        }

        toast.success("Transaction saved!", {
          icon: "💾",
          duration: 2000,
        });

        // 4. Navigate to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      } catch (error: any) {
        console.error("❌ Error handling transaction success:", error);
        toast.error(error.message || "Failed to save transaction", {
          duration: 4000,
        });

        // Still navigate to dashboard even if save fails
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 3000);
      }
    };

    handleTransactionSuccess();
  }, [isConfirmed, hash, address, state, navigate]);

  // Handle send transaction
  const handleSend = async () => {
    if (!state || !address) {
      toast.error("Missing required data");
      return;
    }

    try {
      console.log("🚀 Initiating transaction...");
      console.log("📍 From:", address);
      console.log("📍 To:", state.recipient.wallet);
      console.log("💰 Amount (USDC):", state.amountUsdc);
      console.log("💰 Amount (IDR):", state.amountIdr);

      // Convert USDC amount to contract units (6 decimals)
      const amountInUnits = parseUnits(state.amountUsdc.toFixed(6), 6);
      
      console.log("🔢 Amount in units:", amountInUnits.toString());

      // Call smart contract
      writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [state.recipient.wallet as `0x${string}`, amountInUnits],
      });

      console.log("✅ Transaction request sent to wallet");
    } catch (error: any) {
      console.error("❌ Error initiating transaction:", error);
      toast.error(error.message || "Failed to initiate transaction", {
        duration: 4000,
      });
    }
  };

  // Handle write error
  useEffect(() => {
    if (writeError) {
      console.error("Transaction error:", writeError);
      
      if (writeError.message.includes("User rejected")) {
        toast.error("Transaction cancelled");
      } else {
        toast.error("Transaction failed");
      }
    }
  }, [writeError]);

  if (!state) return null;

  // Format functions
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatUsdc = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Show success state
  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Transaction Successful!
          </h2>
          <p className="text-sm text-gray-600 text-center mb-2">
            Your payment has been sent successfully
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 w-full mb-6">
            <p className="text-xs text-gray-600 mb-2 text-center">
              Transaction Hash:
            </p>
            <p className="text-xs text-gray-900 font-mono text-center break-all">
              {hash}
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <button
                onClick={() => {
                  if (hash) {
                    navigator.clipboard.writeText(hash);
                    toast.success("Hash copied!");
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Copy Hash
              </button>
              <a
                href={getBaseScanUrl(hash as string)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                View on BaseScan →
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-100">
          <button
            onClick={() => navigate("/send")}
            disabled={isSigning || isConfirming}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">
            Review Transaction
          </h1>
        </div>

        {/* Content */}
        <div className="px-5 py-6 space-y-6">
          {/* First-time Warning */}
          {checkingHistory ? (
            <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                <p className="text-sm text-gray-600">
                  Checking transaction history...
                </p>
              </div>
            </div>
          ) : (
            isFirstTime && (
              <div className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-900 mb-1">
                      First-time Recipient
                    </p>
                    <p className="text-xs text-orange-700">
                      This is your first transaction with {state.recipient.name}.
                      Please verify the address carefully.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Recipient Info */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3">SENDING TO</p>
            <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {state.recipient.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-900">
                    {state.recipient.name}
                  </p>
                  <p className="text-xs text-gray-600 font-mono">
                    {shortenAddress(state.recipient.wallet)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(state.recipient.wallet);
                  toast.success("Address copied!");
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Copy full address
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3">AMOUNT</p>
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <p className="text-3xl font-bold text-gray-900 mb-1">
                Rp {formatCurrency(state.amountIdr)}
              </p>
              <p className="text-sm text-gray-600">
                {formatUsdc(state.amountUsdc)} USDC
              </p>
            </div>
          </div>

          {/* Note */}
          {state.note && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-3">NOTE</p>
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-900">{state.note}</p>
              </div>
            </div>
          )}

          {/* Network Info */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3">NETWORK</p>
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900">
                Base Network
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Transaction fees are paid in ETH
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              ⚠️ Please review all details carefully. Blockchain transactions cannot
              be reversed once confirmed.
            </p>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="px-5 pb-6">
          <button
            onClick={handleSend}
            disabled={isSigning || isConfirming}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              isSigning || isConfirming
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {isSigning && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Waiting for signature...</span>
              </>
            )}
            {isConfirming && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Confirming transaction...</span>
              </>
            )}
            {!isSigning && !isConfirming && <span>Confirm & Send</span>}
          </button>

          {(isSigning || isConfirming) && (
            <p className="text-xs text-gray-500 text-center mt-3">
              {isSigning && "Please confirm the transaction in your wallet"}
              {isConfirming && "Transaction submitted. Waiting for confirmation..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendPreviewPage;