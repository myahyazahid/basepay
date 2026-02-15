import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export interface BasepayNameResult {
  id: string;
  name: string;
  wallet: string;
  avatar?: string;
  username?: string;
}

export const useBasepayName = (searchQuery: string) => {
  const [results, setResults] = useState<BasepayNameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchBasepayNames = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Search basepay_names table
        const { data: nameData, error: nameError } = await supabase
          .from("basepay_names")
          .select(
            `
            id,
            name,
            id_user,
            user (
              wallet,
              username,
              avatar
            )
          `
          )
          .ilike("name", `%${searchQuery}%`)
          .eq("is_active", true)
          .limit(5);

        if (nameError) throw nameError;

        // Transform data
        const formatted: BasepayNameResult[] =
          nameData?.map((item: any) => ({
            id: item.id,
            name: item.name,
            wallet: item.user?.wallet || "",
            avatar: item.user?.avatar || "",
            username: item.user?.username || "",
          })) || [];

        setResults(formatted);
      } catch (err: any) {
        console.error("Error searching basepay names:", err);
        setError(err.message || "Failed to search names");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchBasepayNames();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return { results, loading, error };
};

// Hook untuk resolve single name ke address
export const useResolveBasepayName = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveName = async (
    name: string
  ): Promise<BasepayNameResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("basepay_names")
        .select(
          `
          id,
          name,
          id_user,
          user (
            wallet,
            username,
            avatar
          )
        `
        )
        .eq("name", name.toLowerCase())
        .eq("is_active", true)
        .single();

      if (queryError) throw queryError;

      if (!data) {
        setError("Name not found");
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        wallet: (data.user as any)?.wallet || "",
        avatar: (data.user as any)?.avatar || "",
        username: (data.user as any)?.username || "",
      };
    } catch (err: any) {
      console.error("Error resolving name:", err);
      setError(err.message || "Failed to resolve name");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { resolveName, loading, error };
};