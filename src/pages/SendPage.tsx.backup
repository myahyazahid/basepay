import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { USDC_CONTRACT_ADDRESS, USDC_ABI } from "../config/wagmi";
import { formatUnits } from "viem";
import { useBasepayName } from "../hooks/Usebasepayname";
import type { BasepayNameResult } from "../hooks/Usebasepayname";
import toast from "react-hot-toast";

const SendPage: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  // Form states
  const [basepayNameInput, setBasepayNameInput] = useState("");
  const [selectedRecipient, setSelectedRecipient] =
    useState<BasepayNameResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [amountIdr, setAmountIdr] = useState("");
  const [note, setNote] = useState("");

  // Search basepay names
  const { results: searchResults, loading: searchLoading } =
    useBasepayName(basepayNameInput);

  // Fetch USDC Balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Conversion rate (1 USDC = 16,800 IDR)
  const USDC_TO_IDR = 16800;

  // Calculate USDC balance in IDR
  const usdcAmount = usdcBalance
    ? parseFloat(formatUnits(usdcBalance as bigint, 6))
    : 0;
  const balanceInIdr = usdcAmount * USDC_TO_IDR;

  // Convert IDR input to USDC
  const amountInUsdc =
    amountIdr && !isNaN(parseFloat(amountIdr))
      ? parseFloat(amountIdr) / USDC_TO_IDR
      : 0;

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  // Handle recipient selection
  const handleSelectRecipient = (recipient: BasepayNameResult) => {
    setSelectedRecipient(recipient);
    setBasepayNameInput(recipient.name);
    setShowSuggestions(false);
  };

  // Handle input change
  const handleBasepayNameChange = (value: string) => {
    setBasepayNameInput(value);
    setSelectedRecipient(null);
    setShowSuggestions(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Format USDC amount
  const formatUsdc = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  // Shorten address
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-3)}`;
  };

  // Validate form
  const canPreview = () => {
    if (!selectedRecipient) return false;
    if (!amountIdr || parseFloat(amountIdr) <= 0) return false;
    if (amountInUsdc > usdcAmount) return false;
    return true;
  };

  // Handle preview
  const handlePreview = () => {
    if (!canPreview()) {
      toast.error("Please complete all required fields");
      return;
    }

    // Navigate to preview page dengan state
    navigate("/Sendpreviewpage", {
      state: {
        recipient: selectedRecipient,
        amountIdr: parseFloat(amountIdr),
        amountUsdc: amountInUsdc,
        note: note.trim(),
      },
    });
  };

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
          <h1 className="text-lg font-bold text-gray-900">
            Send to basepay name
          </h1>
        </div>

        {/* Form Content */}
        <div className="px-5 py-6 space-y-6">
          {/* Basepay Name Input */}
          <div className="relative">
            <input
              type="text"
              value={basepayNameInput}
              onChange={(e) => handleBasepayNameChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter basepay name"
              className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-blue-50"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions &&
              basepayNameInput.length >= 2 &&
              !selectedRecipient && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-10">
                  {searchLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No results found
                    </div>
                  ) : (
                    searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectRecipient(result)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {result.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-gray-900">
                            {result.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {shortenAddress(result.wallet)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
          </div>

          {/* Selected Recipient */}
          {selectedRecipient && (
            <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedRecipient.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedRecipient.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {shortenAddress(selectedRecipient.wallet)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Enter amount
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">IDR</span>
              </div>
              <input
                type="number"
                value={amountIdr}
                onChange={(e) => setAmountIdr(e.target.value)}
                placeholder="0"
                className="w-full pl-24 pr-4 py-3.5 border-2 border-blue-200 rounded-xl text-2xl font-bold text-gray-900 focus:outline-none focus:border-blue-500 bg-blue-50"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-600">
                Balance: Rp {formatCurrency(balanceInIdr)}
              </span>
              {amountIdr && parseFloat(amountIdr) > 0 && (
                <span className="text-gray-600">
                  ≈ {formatUsdc(amountInUsdc)} USDC
                </span>
              )}
            </div>
            {amountIdr &&
              parseFloat(amountIdr) > 0 &&
              amountInUsdc > usdcAmount && (
                <p className="mt-2 text-xs text-red-600 font-medium">
                  ⚠️ Insufficient balance
                </p>
              )}
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. breakfast"
              maxLength={100}
              className="w-full px-4 py-3.5 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-blue-50"
            />
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            Transactions will be authorized in your wallet
          </p>
        </div>

        {/* Preview Button */}
        <div className="px-5 pb-6">
          <button
            onClick={handlePreview}
            disabled={!canPreview()}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
              canPreview()
                ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Preview Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendPage;