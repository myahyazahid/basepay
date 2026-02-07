import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Share2, CheckCircle2, Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";
import {
  getUserIdFromWallet,
  getUserPrimaryName,
} from "../utils/Transactionutils";

const WalletAddressRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  const [loading, setLoading] = useState(true);
  const [basepayName, setBasepayName] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedName, setCopiedName] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      navigate("/");
      return;
    }

    loadUserData();
  }, [address, isConnected]);

  const loadUserData = async () => {
    if (!address) return;

    try {
      setLoading(true);

      const userId = await getUserIdFromWallet(address);
      if (userId) {
        const name = await getUserPrimaryName(userId);
        setBasepayName(name);

        // Fetch user profile photo
        const { data: userData, error } = await supabase
          .from("user")
          .select("avatar")
          .eq("id_user", userId)
          .single();

        if (!error && userData?.avatar) {
          setProfilePhoto(userData.avatar);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (!address) return;

    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast.success("Wallet address copied!");

    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyName = () => {
    if (!basepayName) return;

    navigator.clipboard.writeText(`@${basepayName}`);
    setCopiedName(true);
    toast.success("BasePay name copied!");

    setTimeout(() => setCopiedName(false), 2000);
  };

  const handleShare = async () => {
    if (!address) return;

    const shareText = basepayName
      ? `Send me payment on BasePay!\n\nBasePay Name: @${basepayName}\nWallet Address: ${address}\n\nScan QR or use address above.`
      : `Send me payment on BasePay!\n\nWallet Address: ${address}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "BasePay - My Payment Info",
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Payment info copied!");
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
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
            onClick={() => navigate("/Requestpage")}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Wallet Address</h1>
        </div>

        {/* Content */}
        <div className="px-5 py-8">
          {/* User Info */}
          <div className="text-center mb-8">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-lg border-2 border-blue-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                {basepayName
                  ? basepayName.charAt(0).toUpperCase()
                  : address?.charAt(2).toUpperCase()}
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Request Payment
            </h2>
            <p className="text-sm text-gray-600">
              Share your payment details with others
            </p>
          </div>

          {/* Payment Information Cards */}
          <div className="space-y-4 mb-6">
            {/* BasePay Name (if exists) */}
            {basepayName && (
              <div className="border-2 border-blue-200 rounded-2xl p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-blue-900">
                    BASEPAY NAME
                  </p>
                  <Wallet className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-3">
                  @{basepayName}
                </p>
                <button
                  onClick={handleCopyName}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {copiedName ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Name</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Wallet Address */}
            <div className="border-2 border-gray-200 rounded-2xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-600">
                  WALLET ADDRESS
                </p>
                <Wallet className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-900 font-mono break-all leading-relaxed">
                  {address}
                </p>
              </div>
              <button
                onClick={handleCopyAddress}
                className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {copiedAddress ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 mb-6"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Payment Info</span>
          </button>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-900 leading-relaxed">
              💡 <strong>How to use:</strong>
              <br />
              {basepayName && (
                <>
                  • Share your BasePay name (@{basepayName}) for easy payments
                  <br />
                </>
              )}
              • Or share your wallet address for direct transfers
              <br />• Senders can also scan your QR code from other request
              methods
            </p>
          </div>

          {/* Network Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Network: <span className="font-semibold">Base</span>
              <br />
              Currency: <span className="font-semibold">USDC</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAddressRequestPage;
