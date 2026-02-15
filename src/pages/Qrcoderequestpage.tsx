import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Share2, CheckCircle2 } from "lucide-react";
import { useAccount } from "wagmi";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";
import {
  getUserIdFromWallet,
  getUserPrimaryName,
} from "../utils/Transactionutils";

const QRCodeRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [basepayName, setBasepayName] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

      // Get user's primary BasePay name
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

      // Generate QR code
      generateQRCode();
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!canvasRef.current || !address) return;

    try {
      // QR code contains the wallet address
      await QRCode.toCanvas(canvasRef.current, address, {
        width: 280,
        margin: 2,
        color: {
          dark: "#1E40AF", // Blue
          light: "#FFFFFF",
        },
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleCopy = () => {
    if (!address) return;

    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");

    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!address) return;

    const shareText = basepayName
      ? `Send payment to @${basepayName} on BasePay\n${address}`
      : `Send payment to my wallet:\n${address}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "BasePay - Request Payment",
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success("Payment info copied!");
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Generating QR code...</p>
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
          <h1 className="text-lg font-bold text-gray-900">QR Code</h1>
        </div>

        {/* Content */}
        <div className="px-5 py-8 flex flex-col items-center">
          {/* User Info */}
          {basepayName && (
            <div className="mb-6 text-center">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={basepayName}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-blue-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {basepayName.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                @{basepayName}
              </h2>
              <p className="text-sm text-gray-600">
                {shortenAddress(address || "")}
              </p>
            </div>
          )}

          {/* QR Code */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <canvas ref={canvasRef} className="mx-auto" />
          </div>

          {/* Instructions */}
          <p className="text-center text-sm text-gray-600 mb-6 max-w-xs">
            Show this QR code to the sender. They can scan it to send you
            payment.
          </p>

          {/* Wallet Address Card */}
          <div className="w-full bg-gray-50 rounded-2xl p-4 mb-4">
            <p className="text-xs text-gray-600 mb-2 text-center">
              Wallet Address
            </p>
            <p className="text-sm text-gray-900 font-mono text-center break-all">
              {address}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handleCopy}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {copied ? (
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

            <button
              onClick={handleShare}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeRequestPage;
