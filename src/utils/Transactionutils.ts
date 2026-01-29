import { supabase } from "../config/supabase";

/**
 * Get user ID from wallet address
 */
export const getUserIdFromWallet = async (
  walletAddress: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("user")
      .select("id_user")
      .eq("wallet", walletAddress.toLowerCase())
      .single();

    if (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }

    return data?.id_user || null;
  } catch (error) {
    console.error("Exception in getUserIdFromWallet:", error);
    return null;
  }
};

/**
 * Get user's primary BasePay name
 */
export const getUserPrimaryName = async (
  userId: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("basepay_names")
      .select("name")
      .eq("id_user", userId)
      .eq("is_primary", true)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching primary name:", error);
      return null;
    }

    return data?.name || null;
  } catch (error) {
    console.error("Exception in getUserPrimaryName:", error);
    return null;
  }
};

/**
 * Check if recipient is first-time (no prior transactions)
 */
export const isFirstTimeRecipient = async (
  senderWallet: string,
  recipientWallet: string
): Promise<boolean> => {
  try {
    // Get sender's user ID first
    const userId = await getUserIdFromWallet(senderWallet);
    if (!userId) return true; // Treat as first-time if user not found

    const { data, error } = await supabase
      .from("transactions")
      .select("id")
      .eq("id_user", userId)
      .eq("to_wallet", recipientWallet.toLowerCase())
      .limit(1);

    if (error) {
      console.error("Error checking transaction history:", error);
      return true; // Treat as first-time on error (safer)
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error("Exception in isFirstTimeRecipient:", error);
    return true;
  }
};

/**
 * Save transaction to Supabase
 */
export interface SaveTransactionParams {
  userId: string;
  fromWallet: string;
  toWallet: string;
  fromName: string | null;
  toName: string | null;
  amountUsdc: number;
  note: string | null;
  txHash: string;
}

export const saveTransaction = async (
  params: SaveTransactionParams
): Promise<{ success: boolean; error?: string }> => {
  try {
    const transactionData = {
      id_user: params.userId,
      type: "transfer",
      direction: "outflow",
      amount: params.amountUsdc,
      currency: "USDC",
      from_wallet: params.fromWallet.toLowerCase(),
      to_wallet: params.toWallet.toLowerCase(),
      from_name: params.fromName,
      to_name: params.toName,
      note: params.note,
      tx_hash: params.txHash,
      status: "success",
    };

    console.log("💾 Saving transaction to Supabase:", transactionData);

    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Transaction saved successfully:", data);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Exception in saveTransaction:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

/**
 * Validate USDC balance before transaction
 */
export const hasEnoughBalance = (
  balance: bigint,
  amountUsdc: number
): boolean => {
  const balanceInUsdc = Number(balance) / 1_000_000; // USDC has 6 decimals
  return balanceInUsdc >= amountUsdc;
};

/**
 * Format transaction hash for display
 */
export const formatTxHash = (hash: string, length: number = 10): string => {
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
};

/**
 * Get BaseScan URL for transaction
 */
export const getBaseScanUrl = (txHash: string | undefined): string => {
  if (!txHash) return "https://basescan.org";
  return `https://basescan.org/tx/${txHash}`;
};

/**
 * Convert IDR to USDC
 */
export const idrToUsdc = (idrAmount: number, rate: number = 16800): number => {
  return idrAmount / rate;
};

/**
 * Convert USDC to IDR
 */
export const usdcToIdr = (usdcAmount: number, rate: number = 16800): number => {
  return usdcAmount * rate;
};

/**
 * Validate BasePay name format
 */
export const isValidBasepayName = (name: string): boolean => {
  // 3-20 characters, lowercase alphanumeric and hyphens only
  const regex = /^[a-z0-9-]{3,20}$/;
  return regex.test(name);
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};