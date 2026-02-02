import { supabase } from "../config/supabase";
import { ethers } from "ethers";

/**
 * Airdrop interfaces
 */
export interface Airdrop {
  airdrop_id: number;
  name: string;
  description: string;
  token: string;
  total_pool: number;
  distribution_type: string;
  start_at: string;
  end_at: string;
  created_at: string;
}

export interface UserAirdrop {
  id: number;
  airdrop_id: number;
  id_user: string;
  allocated_amount: number;
  currency: string;
  status: "pending" | "claimed" | "expired";
  claimed_tx: string | null;
  claimed_at: string | null;
  created_at: string;
  // Joined fields from airdrop table
  name?: string;
  description?: string;
  token?: string;
  start_at?: string;
  end_at?: string;
}

/**
 * Get eligible airdrops for user
 */
export const getEligibleAirdrops = async (
  userId: string
): Promise<UserAirdrop[]> => {
  try {
    const { data, error } = await supabase
      .from("user_airdrop")
      .select(
        `
        *,
        airdrop:airdrop_id (
          name,
          description,
          token,
          start_at,
          end_at
        )
      `
      )
      .eq("id_user", userId)
      .eq("status", "pending")
      .gte("airdrop.end_at", new Date().toISOString())
      .lte("airdrop.start_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching eligible airdrops:", error);
      return [];
    }

    // Flatten the nested airdrop data
    return (data || []).map((item: any) => ({
      ...item,
      name: item.airdrop?.name,
      description: item.airdrop?.description,
      token: item.airdrop?.token,
      start_at: item.airdrop?.start_at,
      end_at: item.airdrop?.end_at,
    }));
  } catch (error) {
    console.error("Exception in getEligibleAirdrops:", error);
    return [];
  }
};

/**
 * Generate claim signature for smart contract
 * IMPORTANT: This should be called from backend API, not frontend!
 */
export const generateClaimSignature = async (
  airdropId: number,
  userAddress: string,
  amount: string,
  txRef: string,
  privateKey: string // Backend signer private key
): Promise<string> => {
  try {
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);

    // Create message hash (must match contract encoding)
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint256", "address", "uint256", "string"],
      [airdropId, userAddress, amount, txRef]
    );

    // Sign the message
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    return signature;
  } catch (error) {
    console.error("Error generating signature:", error);
    throw error;
  }
};

/**
 * Verify claim eligibility before signing
 */
export const verifyClaimEligibility = async (
  userId: string,
  airdropId: number
): Promise<{ eligible: boolean; reason?: string; data?: UserAirdrop }> => {
  try {
    // Get user airdrop allocation
    const { data, error } = await supabase
      .from("user_airdrop")
      .select(
        `
        *,
        airdrop:airdrop_id (
          name,
          description,
          token,
          start_at,
          end_at
        )
      `
      )
      .eq("id_user", userId)
      .eq("airdrop_id", airdropId)
      .single();

    if (error || !data) {
      return { eligible: false, reason: "Airdrop allocation not found" };
    }

    // Check status
    if (data.status !== "pending") {
      return { eligible: false, reason: `Already ${data.status}` };
    }

    // Check amount
    if (data.allocated_amount <= 0) {
      return { eligible: false, reason: "Invalid allocation amount" };
    }

    // Check dates
    const now = new Date();
    const startDate = new Date(data.airdrop.start_at);
    const endDate = new Date(data.airdrop.end_at);

    if (now < startDate) {
      return { eligible: false, reason: "Airdrop not started yet" };
    }

    if (now >= endDate) {
      return { eligible: false, reason: "Airdrop has ended" };
    }

    // All checks passed
    return {
      eligible: true,
      data: {
        ...data,
        name: data.airdrop?.name,
        description: data.airdrop?.description,
        token: data.airdrop?.token,
        start_at: data.airdrop?.start_at,
        end_at: data.airdrop?.end_at,
      },
    };
  } catch (error) {
    console.error("Error verifying eligibility:", error);
    return { eligible: false, reason: "Verification failed" };
  }
};

/**
 * Process successful claim
 */
export const processClaimSuccess = async (
  userId: string,
  airdropId: number,
  txHash: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Update user_airdrop status to claimed
    const { error: updateError } = await supabase
      .from("user_airdrop")
      .update({
        status: "claimed",
        claimed_tx: txHash,
        claimed_at: new Date().toISOString(),
      })
      .eq("id_user", userId)
      .eq("airdrop_id", airdropId)
      .eq("status", "pending"); // Only update if status is pending

    if (updateError) {
      console.error("Error updating user_airdrop:", updateError);
      return { success: false, error: updateError.message };
    }

    // Get airdrop details for rewards table
    const { data: userAirdrop } = await supabase
      .from("user_airdrop")
      .select("*, airdrop:airdrop_id(name)")
      .eq("id_user", userId)
      .eq("airdrop_id", airdropId)
      .single();

    if (userAirdrop) {
      // Insert into rewards table (if exists)
      // Note: Adjust based on your rewards table structure
      const { error: rewardsError } = await supabase
        .from("rewards")
        .insert({
          id_user: userId,
          type: "airdrop",
          source: userAirdrop.airdrop?.name || `Airdrop #${airdropId}`,
          amount: userAirdrop.allocated_amount,
          currency: userAirdrop.currency,
          tx_hash: txHash,
          status: "completed",
        });

      if (rewardsError) {
        console.error("Error inserting rewards:", rewardsError);
        // Don't fail the whole operation if rewards insert fails
      }
    }

    console.log(`✅ Claim processed: User ${userId}, Airdrop ${airdropId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Exception in processClaimSuccess:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

/**
 * Check if airdrop is claimable (frontend helper)
 * User can only claim if:
 * 1. status = "pending"
 * 2. amount > 0
 * 3. Within claim period (start_at <= now < end_at)
 */
export const isAirdropClaimable = (userAirdrop: UserAirdrop): boolean => {
  // Must be pending status
  if (userAirdrop.status !== "pending") return false;
  
  // Must have allocation
  if (userAirdrop.allocated_amount <= 0) return false;

  // Check dates
  const now = new Date();
  const startDate = new Date(userAirdrop.start_at || "");
  const endDate = new Date(userAirdrop.end_at || "");

  return now >= startDate && now < endDate;
};

/**
 * Format date for display
 */
export const formatClaimEndDate = (endDate: string): string => {
  const date = new Date(endDate);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  return date.toLocaleDateString("en-US", options).toLowerCase();
};