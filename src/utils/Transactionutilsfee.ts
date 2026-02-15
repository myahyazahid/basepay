// src/utils/Transactionutils.ts

import { supabase } from "../config/supabase";

interface SaveFeeRevenueParams {
  txHash: string;
  senderWallet: string;
  senderUserId: string;
  recipientWallet: string;
  recipientName: string | null;
  totalAmount: number;
  recipientReceived: number;
  feeCollected: number;
  note: string | null;
}

/**
 * Save fee revenue to database
 */
export async function saveFeeRevenue(params: SaveFeeRevenueParams) {
  try {
    console.log("💾 Saving fee revenue to database...");
    console.log("Fee revenue details:", {
      txHash: params.txHash,
      sender: params.senderWallet,
      recipient: params.recipientWallet,
      total: params.totalAmount,
      recipientReceived: params.recipientReceived,
      fee: params.feeCollected,
    });

    const { data, error } = await supabase
      .from("fee_revenue")
      .insert({
        tx_hash: params.txHash,
        sender_wallet: params.senderWallet.toLowerCase(),
        sender_user_id: params.senderUserId,
        recipient_wallet: params.recipientWallet.toLowerCase(),
        recipient_name: params.recipientName,
        total_amount: params.totalAmount,
        recipient_received: params.recipientReceived,
        fee_collected: params.feeCollected,
        treasury_wallet: "0xdcaf4cbac0246de4e1001444b02cbe814e4bafa4",
        network: "base",
        status: "completed",
        note: params.note,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Database error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Fee revenue saved successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("❌ Unexpected error saving fee revenue:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user ID from wallet address
 */
export async function getUserIdFromWallet(
  walletAddress: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Unexpected error fetching user ID:", error);
    return null;
  }
}

/**
 * Get user's primary BasePay name
 */
export async function getUserPrimaryName(
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("basepay_names")
      .select("name")
      .eq("user_id", userId)
      .eq("is_primary", true)
      .single();

    if (error) {
      console.log("No primary name found for user:", userId);
      return null;
    }

    return data?.name || null;
  } catch (error) {
    console.error("Error fetching primary name:", error);
    return null;
  }
}

/**
 * Check if this is the first time sending to a recipient
 */
export async function isFirstTimeRecipient(
  senderWallet: string,
  recipientWallet: string
): Promise<boolean> {
  try {
    // Check in fee_revenue table
    const { data, error } = await supabase
      .from("fee_revenue")
      .select("id")
      .eq("sender_wallet", senderWallet.toLowerCase())
      .eq("recipient_wallet", recipientWallet.toLowerCase())
      .limit(1);

    if (error) {
      console.error("Error checking transaction history:", error);
      return true; // Assume first-time on error (safer)
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error("Unexpected error checking recipient history:", error);
    return true;
  }
}

/**
 * Get BaseScan URL for transaction
 */
export function getBaseScanUrl(txHash: string): string {
  return `https://basescan.org/tx/${txHash}`;
}

/**
 * Get transaction history for a wallet
 */
export async function getTransactionHistory(walletAddress: string) {
  try {
    const { data, error } = await supabase
      .from("fee_revenue")
      .select("*")
      .or(
        `sender_wallet.eq.${walletAddress.toLowerCase()},recipient_wallet.eq.${walletAddress.toLowerCase()}`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transaction history:", error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Unexpected error fetching history:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get total revenue collected by BasePay
 */
export async function getTotalRevenue() {
  try {
    const { data, error } = await supabase.rpc("get_total_revenue");

    if (error) {
      console.error("Error getting total revenue:", error);
      return { success: false, data: null };
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Unexpected error getting total revenue:", error);
    return { success: false, data: null };
  }
}

/**
 * Get monthly revenue
 */
export async function getMonthlyRevenue(year: number, month: number) {
  try {
    const { data, error } = await supabase.rpc("get_monthly_revenue", {
      year_param: year,
      month_param: month,
    });

    if (error) {
      console.error("Error getting monthly revenue:", error);
      return { success: false, data: null };
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Unexpected error getting monthly revenue:", error);
    return { success: false, data: null };
  }
}

/**
 * Get revenue for date range
 */
export async function getRevenueByDateRange(
  startDate: string,
  endDate: string
) {
  try {
    const { data, error } = await supabase.rpc("get_revenue_by_date_range", {
      start_date: startDate,
      end_date: endDate,
    });

    if (error) {
      console.error("Error getting revenue by date range:", error);
      return { success: false, data: null };
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Unexpected error getting revenue by date range:", error);
    return { success: false, data: null };
  }
}

/**
 * Get daily revenue summary
 */
export async function getDailyRevenue(limit: number = 30) {
  try {
    const { data, error } = await supabase
      .from("daily_revenue")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Error getting daily revenue:", error);
      return { success: false, data: [] };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error getting daily revenue:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get top fee contributors
 */
export async function getTopFeeContributors(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from("top_fee_contributors")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Error getting top contributors:", error);
      return { success: false, data: [] };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error getting top contributors:", error);
    return { success: false, data: [] };
  }
}