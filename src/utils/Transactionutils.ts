// import { supabase } from "../config/supabase";

// /**
//  * Get user ID from wallet address
//  */
// export const getUserIdFromWallet = async (
//   walletAddress: string,
// ): Promise<string | null> => {
//   try {
//     const { data, error } = await supabase
//       .from("user")
//       .select("id_user")
//       .eq("wallet", walletAddress.toLowerCase())
//       .single();

//     if (error) {
//       console.error("Error fetching user ID:", error);
//       return null;
//     }

//     return data?.id_user || null;
//   } catch (error) {
//     console.error("Exception in getUserIdFromWallet:", error);
//     return null;
//   }
// };

// /**
//  * Get user's primary BasePay name
//  */
// export const getUserPrimaryName = async (
//   userId: string,
// ): Promise<string | null> => {
//   try {
//     const { data, error } = await supabase
//       .from("basepay_names")
//       .select("name")
//       .eq("id_user", userId)
//       .eq("is_primary", true)
//       .eq("is_active", true)
//       .maybeSingle();

//     if (error) {
//       console.error("Error fetching primary name:", error);
//       return null;
//     }

//     return data?.name || null;
//   } catch (error) {
//     console.error("Exception in getUserPrimaryName:", error);
//     return null;
//   }
// };

// /**
//  * Check if recipient is first-time (no prior transactions)
//  */
// export const isFirstTimeRecipient = async (
//   senderWallet: string,
//   recipientWallet: string,
// ): Promise<boolean> => {
//   try {
//     // Get sender's user ID first
//     const userId = await getUserIdFromWallet(senderWallet);
//     if (!userId) return true; // Treat as first-time if user not found

//     const { data, error } = await supabase
//       .from("transactions")
//       .select("id")
//       .eq("id_user", userId)
//       .eq("to_wallet", recipientWallet.toLowerCase())
//       .limit(1);

//     if (error) {
//       console.error("Error checking transaction history:", error);
//       return true; // Treat as first-time on error (safer)
//     }

//     return !data || data.length === 0;
//   } catch (error) {
//     console.error("Exception in isFirstTimeRecipient:", error);
//     return true;
//   }
// };

// /**
//  * Save transaction to Supabase for BOTH sender and recipient
//  */
// export interface SaveTransactionParams {
//   senderUserId: string;
//   recipientWallet: string;
//   fromWallet: string;
//   toWallet: string;
//   fromName: string | null;
//   toName: string | null;
//   amountUsdc: number;
//   note: string | null;
//   txHash: string;
// }

// export const saveTransaction = async (
//   params: SaveTransactionParams,
// ): Promise<{ success: boolean; error?: string }> => {
//   try {
//     // 1. Get or create recipient user
//     let recipientUserId: string | null = null;

//     const { data: recipientData, error: recipientError } = await supabase
//       .from("user")
//       .select("id_user")
//       .eq("wallet", params.recipientWallet.toLowerCase())
//       .maybeSingle();

//     if (recipientError && recipientError.code !== "PGRST116") {
//       console.error("Error fetching recipient:", recipientError);
//     }

//     if (recipientData) {
//       recipientUserId = recipientData.id_user;
//       console.log("✅ Recipient user exists:", recipientUserId);
//     } else {
//       // Create recipient user if not exists
//       const { data: newRecipient, error: createError } = await supabase
//         .from("user")
//         .insert({
//           wallet: params.recipientWallet.toLowerCase(),
//         })
//         .select("id_user")
//         .single();

//       if (createError) {
//         console.error("Error creating recipient user:", createError);
//       } else if (newRecipient) {
//         recipientUserId = newRecipient.id_user;
//         console.log("✅ Created new recipient user:", recipientUserId);
//       }
//     }

//     // 2. Prepare transaction data
//     const baseTransaction = {
//       amount: params.amountUsdc,
//       currency: "USDC",
//       from_wallet: params.fromWallet.toLowerCase(),
//       to_wallet: params.toWallet.toLowerCase(),
//       from_name: params.fromName,
//       to_name: params.toName,
//       note: params.note,
//       tx_hash: params.txHash,
//       status: "success",
//     };

//     // 3. Create array of transactions to insert
//     const transactionsToInsert = [];

//     // Sender transaction (outflow)
//     transactionsToInsert.push({
//       ...baseTransaction,
//       id_user: params.senderUserId,
//       direction: "outflow",
//       type: "transfer",
//     });

//     // Recipient transaction (inflow) - only if recipient user exists/created
//     if (recipientUserId) {
//       transactionsToInsert.push({
//         ...baseTransaction,
//         id_user: recipientUserId,
//         direction: "inflow",
//         type: "receive",
//       });
//     }

//     console.log("💾 Saving transactions:", transactionsToInsert);

//     // 4. Insert both transactions
//     const { data, error } = await supabase
//       .from("transactions")
//       .insert(transactionsToInsert)
//       .select();

//     if (error) {
//       console.error("❌ Supabase insert error:", error);
//       return { success: false, error: error.message };
//     }

//     console.log("✅ Transactions saved successfully:", data);
//     console.log(`   - Sender (${params.fromWallet}) → outflow`);
//     if (recipientUserId) {
//       console.log(`   - Recipient (${params.toWallet}) → inflow`);
//     }

//     return { success: true };
//   } catch (error: any) {
//     console.error("❌ Exception in saveTransaction:", error);
//     return { success: false, error: error.message || "Unknown error" };
//   }
// };

// /**
//  * Validate USDC balance before transaction
//  */
// export const hasEnoughBalance = (
//   balance: bigint,
//   amountUsdc: number,
// ): boolean => {
//   const balanceInUsdc = Number(balance) / 1_000_000; // USDC has 6 decimals
//   return balanceInUsdc >= amountUsdc;
// };

// /**
//  * Format transaction hash for display
//  */
// export const formatTxHash = (hash: string, length: number = 10): string => {
//   if (hash.length <= length * 2) return hash;
//   return `${hash.slice(0, length)}...${hash.slice(-length)}`;
// };

// /**
//  * Get BaseScan URL for transaction
//  */
// export const getBaseScanUrl = (txHash: string | undefined): string => {
//   if (!txHash) return "https://basescan.org";
//   return `https://basescan.org/tx/${txHash}`;
// };

// /**
//  * Convert IDR to USDC
//  */
// export const idrToUsdc = (idrAmount: number, rate: number = 16800): number => {
//   return idrAmount / rate;
// };

// /**
//  * Convert USDC to IDR
//  */
// export const usdcToIdr = (usdcAmount: number, rate: number = 16800): number => {
//   return usdcAmount * rate;
// };

// /**
//  * Validate BasePay name format
//  */
// export const isValidBasepayName = (name: string): boolean => {
//   // 3-20 characters, lowercase alphanumeric and hyphens only
//   const regex = /^[a-z0-9-]{3,20}$/;
//   return regex.test(name);
// };

// /**
//  * Validate Ethereum address
//  */
// export const isValidAddress = (address: string): boolean => {
//   return /^0x[a-fA-F0-9]{40}$/.test(address);
// };
import { supabase } from "../config/supabase";
import { FEE_PERCENTAGE, TREASURY_ADDRESS } from "../config/wagmi";

/**
 * Calculate fee and recipient amount
 */
export const calculateFee = (totalAmount: number) => {
  const fee = totalAmount * FEE_PERCENTAGE;
  const recipientAmount = totalAmount - fee;
  
  return {
    fee: Number(fee.toFixed(6)),
    recipientAmount: Number(recipientAmount.toFixed(6)),
    feePercentage: FEE_PERCENTAGE * 1, // 3
  };
};

/**
 * Get user ID from wallet address
 */
export const getUserIdFromWallet = async (
  walletAddress: string,
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
  userId: string,
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
  recipientWallet: string,
): Promise<boolean> => {
  try {
    const userId = await getUserIdFromWallet(senderWallet);
    if (!userId) return true;

    const { data, error } = await supabase
      .from("transactions")
      .select("id")
      .eq("id_user", userId)
      .eq("to_wallet", recipientWallet.toLowerCase())
      .limit(1);

    if (error) {
      console.error("Error checking transaction history:", error);
      return true;
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error("Exception in isFirstTimeRecipient:", error);
    return true;
  }
};

/**
 * Save transaction to Supabase for BOTH sender and recipient
 */
export interface SaveTransactionParams {
  senderUserId: string;
  recipientWallet: string;
  fromWallet: string;
  toWallet: string;
  fromName: string | null;
  toName: string | null;
  amountUsdc: number;
  note: string | null;
  txHash: string;
}

export const saveTransaction = async (
  params: SaveTransactionParams,
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Calculate fee breakdown
    const { fee, recipientAmount } = calculateFee(params.amountUsdc);

    console.log("💰 Fee Calculation:");
    console.log(`   Total: ${params.amountUsdc} USDC`);
    console.log(`   Fee (3%): ${fee} USDC`);
    console.log(`   Recipient gets: ${recipientAmount} USDC`);

    // 1. Get or create recipient user
    let recipientUserId: string | null = null;

    const { data: recipientData, error: recipientError } = await supabase
      .from("user")
      .select("id_user")
      .eq("wallet", params.recipientWallet.toLowerCase())
      .maybeSingle();

    if (recipientError && recipientError.code !== "PGRST116") {
      console.error("Error fetching recipient:", recipientError);
    }

    if (recipientData) {
      recipientUserId = recipientData.id_user;
      console.log("✅ Recipient user exists:", recipientUserId);
    } else {
      const { data: newRecipient, error: createError } = await supabase
        .from("user")
        .insert({
          wallet: params.recipientWallet.toLowerCase(),
        })
        .select("id_user")
        .single();

      if (createError) {
        console.error("Error creating recipient user:", createError);
      } else if (newRecipient) {
        recipientUserId = newRecipient.id_user;
        console.log("✅ Created new recipient user:", recipientUserId);
      }
    }

    // 2. Prepare transaction data
    const baseTransaction = {
      currency: "USDC",
      from_wallet: params.fromWallet.toLowerCase(),
      to_wallet: params.toWallet.toLowerCase(),
      from_name: params.fromName,
      to_name: params.toName,
      note: params.note,
      tx_hash: params.txHash,
      status: "success",
    };

    // 3. Create transactions array
    const transactionsToInsert = [];

    // Sender transaction (outflow) - pays FULL amount including fee
    transactionsToInsert.push({
      ...baseTransaction,
      id_user: params.senderUserId,
      direction: "outflow",
      type: "transfer",
      amount: params.amountUsdc, // sender pays total
    });

    // Recipient transaction (inflow) - receives amount MINUS fee
    if (recipientUserId) {
      transactionsToInsert.push({
        ...baseTransaction,
        id_user: recipientUserId,
        direction: "inflow",
        type: "receive",
        amount: recipientAmount, // recipient gets amount after fee
      });
    }

    console.log("💾 Saving transactions:", transactionsToInsert);

    // 4. Insert transactions
    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionsToInsert)
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Transactions saved successfully:", data);
    console.log(`   - Sender (${params.fromWallet}) → outflow: ${params.amountUsdc} USDC`);
    if (recipientUserId) {
      console.log(`   - Recipient (${params.toWallet}) → inflow: ${recipientAmount} USDC`);
    }

    // 5. Save fee revenue record
    await saveFeeRevenue({
      txHash: params.txHash,
      senderWallet: params.fromWallet,
      senderUserId: params.senderUserId,
      recipientWallet: params.toWallet,
      recipientName: params.toName,
      totalAmount: params.amountUsdc,
      recipientReceived: recipientAmount,
      feeCollected: fee,
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ Exception in saveTransaction:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

/**
 * Save fee revenue record
 */
interface SaveFeeRevenueParams {
  txHash: string;
  senderWallet: string;
  senderUserId: string;
  recipientWallet: string;
  recipientName: string | null;
  totalAmount: number;
  recipientReceived: number;
  feeCollected: number;
}

export const saveFeeRevenue = async (params: SaveFeeRevenueParams) => {
  try {
    const { error } = await supabase.from("fee_revenue").insert({
      tx_hash: params.txHash,
      sender_wallet: params.senderWallet.toLowerCase(),
      sender_user_id: params.senderUserId,
      recipient_wallet: params.recipientWallet.toLowerCase(),
      recipient_name: params.recipientName,
      total_amount: params.totalAmount,
      recipient_received: params.recipientReceived,
      fee_collected: params.feeCollected,
      treasury_wallet: TREASURY_ADDRESS.toLowerCase(),
      network: "Base",
      status: "collected",
    });

    if (error) {
      console.error("❌ Error saving fee revenue:", error);
    } else {
      console.log(`💰 Fee revenue saved: ${params.feeCollected} USDC → ${TREASURY_ADDRESS}`);
    }
  } catch (error) {
    console.error("❌ Exception in saveFeeRevenue:", error);
  }
};

/**
 * Validate USDC balance before transaction
 */
export const hasEnoughBalance = (
  balance: bigint,
  amountUsdc: number,
): boolean => {
  const balanceInUsdc = Number(balance) / 1_000_000;
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
  const regex = /^[a-z0-9-]{3,20}$/;
  return regex.test(name);
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};