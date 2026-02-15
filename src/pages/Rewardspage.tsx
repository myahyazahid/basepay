// 







import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import toast from "react-hot-toast";
import {
  getEligibleAirdrops,
  isAirdropClaimable,
  formatClaimEndDate,
  type UserAirdrop,
} from "../utils/Airdroputils";
import { getUserIdFromWallet } from "../utils/Transactionutils";
import {
  AIRDROP_CONTRACT_ADDRESS,
  AIRDROP_ABI,
} from "../config/wagmi";

interface PointHistory {
  type: string;
  source: string;
  amount: number;
  created_at: string;
}

const RewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  // State
  const [loading, setLoading] = useState(true);
  const [airdrops, setAirdrops] = useState<UserAirdrop[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [claimingAirdropId, setClaimingAirdropId] = useState<number | null>(null);

  // Contract hooks
  const {
    data: hash,
    writeContract,
    error: writeError,
    isPending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Load data on mount
  useEffect(() => {
    if (!isConnected || !address) {
      navigate("/");
      return;
    }

    loadRewardsData();
  }, [address, isConnected]);

  // Handle successful claim
  useEffect(() => {
    if (isConfirmed && hash && claimingAirdropId) {
      handleClaimSuccess(hash, claimingAirdropId);
    }
  }, [isConfirmed, hash, claimingAirdropId]);

  // Handle errors
  useEffect(() => {
    if (writeError) {
      console.error("Claim error:", writeError);
      if (writeError.message.includes("User rejected")) {
        toast.error("Transaction cancelled");
      } else {
        toast.error("Claim failed: " + (writeError.message));
      }
      setClaimingAirdropId(null);
    }
  }, [writeError]);

  /**
   * Load rewards data
   */
  const loadRewardsData = async () => {
    if (!address) return;

    try {
      setLoading(true);

      // Get user ID from wallet
      const userId = await getUserIdFromWallet(address);
      if (!userId) {
        console.error("User not found");
        setLoading(false);
        return;
      }

      // Get eligible airdrops
      const eligibleAirdrops = await getEligibleAirdrops(userId);
      setAirdrops(eligibleAirdrops);

      // TODO: Load point history from your database
      // This is placeholder data - replace with actual API call
      // const history = await getPointHistory(userId);
      // setPointHistory(history);

      // Calculate total points
      // const total = history.reduce((sum, h) => sum + h.amount, 0);
      // setTotalPoints(total);

      // Placeholder for now
      setPointHistory([
        {
          type: "earning",
          source: "transaction",
          amount: 50,
          created_at: new Date().toISOString(),
        },
      ]);
      setTotalPoints(1250);
    } catch (error) {
      console.error("Error loading rewards data:", error);
      toast.error("Failed to load rewards data");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle claim button click
   */
  const handleClaim = async (airdrop: UserAirdrop) => {
    if (!address) {
      toast.error("Please connect wallet");
      return;
    }

    if (!isAirdropClaimable(airdrop)) {
      toast.error("This airdrop is not claimable");
      return;
    }

    try {
      setClaimingAirdropId(airdrop.airdrop_id);

      // Call backend API to get signature
      // IMPORTANT: This endpoint should verify eligibility and generate signature
      const response = await fetch("/api/airdrop/claim-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airdropId: airdrop.airdrop_id,
          userAddress: address,
          amount: airdrop.allocated_amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get signature");
      }

      const { signature, txRef, amount } = await response.json();

      // Convert amount to wei (assuming 6 decimals for USDC)
      const amountWei = parseUnits(amount.toString(), 6);

      // Call smart contract
      writeContract({
        address: AIRDROP_CONTRACT_ADDRESS,
        abi: AIRDROP_ABI,
        functionName: "claim",
        args: [
          BigInt(airdrop.airdrop_id),
          amountWei,
          txRef,
          signature as `0x${string}`,
        ],
      });

      console.log("✅ Claim transaction sent");
    } catch (error: any) {
      console.error("Error claiming airdrop:", error);
      toast.error(error.message || "Failed to claim airdrop");
      setClaimingAirdropId(null);
    }
  };

  /**
   * Handle successful claim
   */
  const handleClaimSuccess = async (txHash: string, airdropId: number) => {
    try {
      // Call backend to update status
      const response = await fetch("/api/airdrop/claim-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airdropId,
          userAddress: address,
          txHash,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update claim status");
      }

      toast.success("Airdrop claimed successfully!", {
        icon: "🎉",
        duration: 3000,
      });

      // Reload data
      setTimeout(() => {
        loadRewardsData();
        setClaimingAirdropId(null);
      }, 2000);
    } catch (error: any) {
      console.error("Error updating claim status:", error);
      toast.error("Claimed but failed to update status. Please refresh.");
      setClaimingAirdropId(null);
    }
  };

  /**
   * Get member tier
   */
  const getMemberTier = (points: number): string => {
    if (points >= 5000) return "gold";
    if (points >= 2000) return "silver";
    return "base";
  };

  /**
   * Get points to next tier
   */
  const getPointsToNextTier = (points: number): number => {
    if (points < 2000) return 2000 - points;
    if (points < 5000) return 5000 - points;
    return 0;
  };

  /**
   * Format member tier name
   */
  const formatTierName = (tier: string): string => {
    return `Base ${tier.charAt(0).toUpperCase() + tier.slice(1)} member`;
  };

  const currentTier = getMemberTier(totalPoints);
  const pointsToNext = getPointsToNextTier(totalPoints);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
            onClick={() => navigate("/dashboard")}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Rewards</h1>
        </div>

        {/* Content */}
        <div className="px-5 py-6 space-y-6">
          {/* Points Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-center mb-4">
              <h2 className="text-5xl font-bold mb-2">{totalPoints} Points</h2>
              <p className="text-blue-100 text-sm">{formatTierName(currentTier)}</p>
            </div>

            {pointsToNext > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-400">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-100 text-xs">Progress to next tier</span>
                  <span className="text-white text-xs font-semibold">
                    {pointsToNext} points to {currentTier === "base" ? "silver" : "gold"}
                  </span>
                </div>
                <div className="w-full bg-blue-400 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{
                      width: `${((totalPoints % (currentTier === "base" ? 2000 : 3000)) / (currentTier === "base" ? 2000 : 3000)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Coming Soon */}
          <div className="border-2 border-gray-200 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm">
              more exciting rewards coming soon !
            </p>
          </div>

          {/* Available Airdrops */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Available airdrops :
            </h3>

            {airdrops.length === 0 ? (
              <div className="border-2 border-gray-200 rounded-xl p-8 text-center">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  No airdrops available to claim now
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Check back later for new opportunities!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {airdrops.map((airdrop) => {
                  const isClaimable = isAirdropClaimable(airdrop);
                  const isClaiming = claimingAirdropId === airdrop.airdrop_id;
                  const isClaimed = airdrop.status === "claimed";
                  const isProcessing = isClaiming && (isPending || isConfirming);

                  return (
                    <div
                      key={airdrop.id}
                      className="border-2 border-gray-200 rounded-2xl p-4 bg-white"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Gift className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900">
                            {airdrop.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {airdrop.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">
                            available to claim
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {airdrop.allocated_amount} {airdrop.currency}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">claim end date</span>
                          <div className="flex items-center gap-1 text-gray-900">
                            <Clock className="w-3 h-3" />
                            <span>{formatClaimEndDate(airdrop.end_at || "")}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaim(airdrop)}
                        disabled={!isClaimable || isProcessing || isClaimed}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                          isClaimed
                            ? "bg-green-500 cursor-not-allowed"
                            : !isClaimable || isProcessing
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                        }`}
                      >
                        {isClaimed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>claimed</span>
                          </>
                        ) : isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>
                              {isPending ? "signing..." : "confirming..."}
                            </span>
                          </>
                        ) : !isClaimable ? (
                          <span>not available</span>
                        ) : (
                          <span>claim</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Points History */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">
              points history :
            </h3>

            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
              {pointHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No points earned yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Start transacting to earn points!
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        source
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                        amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointHistory.map((item, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.type}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.source}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className="text-green-600 font-semibold">
                            + {item.amount}
                          </span>
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
  );
};

export default RewardsPage;