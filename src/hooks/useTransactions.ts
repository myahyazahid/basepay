import { useState, useEffect } from "react";
// import { supabase, Transaction } from '../config/supabase'

import { supabase } from "../config/supabase";
import type { Transaction } from "../config/supabase";

export const useTransactions = (walletAddress: string | undefined) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);

        // Get user_id dari wallet address
        const { data: userData, error: userError } = await supabase
          .from("user")
          .select("id_user")
          .eq("wallet", walletAddress.toLowerCase())
          .single();

        if (userError) {
          console.error("User not found:", userError);
          setTransactions([]);
          setLoading(false);
          return;
        }

        // Fetch transactions
        const { data, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .eq("id_user", userData.id_user)
          .eq("status", "success")
          .order("created_at", { ascending: false })
          .limit(10);

        if (txError) throw txError;

        setTransactions(data || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        () => {
          fetchTransactions();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress]);

  return { transactions, loading, error };
};
