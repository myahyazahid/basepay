import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Share2, CheckCircle2 } from "lucide-react";
import { useAccount } from "wagmi";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";
import { getUserIdFromWallet, getUserPrimaryName } from "../utils/Transactionutils";
import { idrToUsdc } from "../utils/Transactionutils";
// import { idrToUsdc, usdcToIdr } from "../utils/Transactionutils";

const AmountQRCodeRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [basepayName, setBasepayName] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [amountIdr, setAmountIdr] = useState("");
  const [amountUsdc, setAmountUsdc] = useState(0);
  const [qrGenerated, setQrGenerated] = useState(false);
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

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    setAmountIdr(numericValue);

    if (numericValue) {
      const idr = parseInt(numericValue);
      const usdc = idrToUsdc(idr);
      setAmountUsdc(usdc);
    } else {
      setAmountUsdc(0);
    }
  };

  const generateQRCode = async () => {
    if (!canvasRef.current || !address || !amountUsdc) {
      toast.error("Please enter an amount");
      return;
    }

    try {
      // Create payment request data
      const paymentData = {
        address: address,
        amount: amountUsdc,
        name: basepayName,
      };

      // Generate QR code with payment data
      await QRCode.toCanvas(
        canvasRef.current,
        JSON.stringify(paymentData),
        {
          width: 280,
          margin: 2,
          color: {
            dark: "#1E40AF",
            light: "#FFFFFF",
          },
        }
      );

      setQrGenerated(true);
      toast.success("QR code generated!");
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleCopy = () => {
    if (!address) return;

    const paymentInfo = basepayName
      ? `Send ${formatCurrency(parseInt(amountIdr))} IDR (${formatUsdc(amountUsdc)} USDC) to @${basepayName}\nAddress: ${address}`
      : `Send ${formatCurrency(parseInt(amountIdr))} IDR (${formatUsdc(amountUsdc)} USDC)\nAddress: ${address}`;

    navigator.clipboard.writeText(paymentInfo);
    setCopied(true);
    toast.success("Payment info copied!");

    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!address) return;

    const shareText = basepayName
      ? `Request payment: ${formatCurrency(parseInt(amountIdr))} IDR (${formatUsdc(amountUsdc)} USDC) to @${basepayName} on BasePay`
      : `Request payment: ${formatCurrency(parseInt(amountIdr))} IDR (${formatUsdc(amountUsdc)} USDC)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "BasePay - Payment Request",
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      handleCopy();
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatUsdc = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
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
          <h1 className="text-lg font-bold text-gray-900">Amount QR Code</h1>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          {!qrGenerated ? (
            /* Amount Input Form */
            <div className="space-y-6">
              {/* User Info */}
              {basepayName && (
                <div className="text-center">
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
                  <h2 className="text-xl font-bold text-gray-900">
                    @{basepayName}
                  </h2>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Request Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg font-semibold">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amountIdr}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-2xl focus:border-blue-600 focus:outline-none transition-colors"
                  />
                </div>
                {amountUsdc > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    ≈ {formatUsdc(amountUsdc)} USDC
                  </p>
                )}
              </div>

              {/* Quick Amounts */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  QUICK AMOUNTS
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[50000, 100000, 200000, 500000, 1000000, 2000000].map(
                    (amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountChange(amount.toString())}
                        className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-xl transition-colors"
                      >
                        {amount >= 1000000
                          ? `${amount / 1000000}M`
                          : `${amount / 1000}K`}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateQRCode}
                disabled={!amountUsdc}
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
                  amountUsdc > 0
                    ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Generate QR Code
              </button>
            </div>
          ) : (
            /* QR Code Display */
            <div className="flex flex-col items-center space-y-6">
              {/* Amount Display */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Requesting</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  Rp {formatCurrency(parseInt(amountIdr))}
                </h2>
                <p className="text-sm text-gray-600">
                  {formatUsdc(amountUsdc)} USDC
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <canvas ref={canvasRef} className="mx-auto" />
              </div>

              {/* Instructions */}
              <p className="text-center text-sm text-gray-600 max-w-xs">
                Show this QR code to sender. Amount is pre-filled.
              </p>

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
                      <span>Copy Payment Info</span>
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

                <button
                  onClick={() => setQrGenerated(false)}
                  className="w-full py-3 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Change Amount
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmountQRCodeRequestPage;