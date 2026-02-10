import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flashlight, FlashlightOff, Image as ImageIcon, X } from "lucide-react";
import { useAccount } from "wagmi";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";

const QRScannerPage: React.FC = () => {
  const navigate = useNavigate();
//   const { address, isConnected } = useAccount();
  const {isConnected } = useAccount();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scanning, setScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
      return;
    }

    startScanning();

    return () => {
      stopScanning();
    };
  }, [isConnected]);

  const startScanning = async () => {
    try {
      setCameraError(null);
      
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scanner.start(
        { facingMode: "environment" }, // Use back camera
        config,
        onScanSuccess,
        onScanError
      );

      setScanning(true);
    } catch (error: any) {
      console.error("Error starting scanner:", error);
      setCameraError("Camera access denied or not available");
      toast.error("Cannot access camera");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setScanning(false);
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);
    
    // Stop scanning
    stopScanning();

    // Parse QR data
    try {
      // Try to parse as JSON (Amount QR Code)
      const paymentData = JSON.parse(decodedText);
      
      if (paymentData.address && paymentData.amount) {
        // Fixed amount QR - navigate with locked amount
        navigate("/send/preview", {
          state: {
            recipient: {
              wallet: paymentData.address,
              name: paymentData.name || null,
            },
            amountUsdc: paymentData.amount,
            isFixedAmount: true, // Flag to lock amount input
            scannedFromQR: true,
          },
        });
      } else {
        throw new Error("Invalid payment data");
      }
    } catch (error) {
      // Not JSON, treat as simple wallet address
      if (decodedText.startsWith("0x") && decodedText.length === 42) {
        // Simple QR - navigate with editable amount
        navigate("/send", {
          state: {
            scannedAddress: decodedText,
            scannedFromQR: true,
          },
        });
      } else {
        toast.error("Invalid QR code");
        // Restart scanning
        setTimeout(() => startScanning(), 1000);
      }
    }
  };

  const onScanError = (error: string) => {
    // Silent error - normal during scanning
    console.log("Scan error:", error);
  };

  const toggleFlash = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;

      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn } as any],
        });
        setFlashOn(!flashOn);
      } else {
        toast.error("Flash not supported on this device");
      }
    } catch (error) {
      console.error("Error toggling flash:", error);
      toast.error("Cannot control flash");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Stop camera scanning
      await stopScanning();

      // Scan QR from image
      const scanner = new Html5Qrcode("qr-reader-image");
      const result = await scanner.scanFile(file, false);

      console.log("QR Code from image:", result);
      
      // Process result (same as onScanSuccess)
      try {
        const paymentData = JSON.parse(result);
        
        if (paymentData.address && paymentData.amount) {
          navigate("/send/preview", {
            state: {
              recipient: {
                wallet: paymentData.address,
                name: paymentData.name || null,
              },
              amountUsdc: paymentData.amount,
              isFixedAmount: true,
              scannedFromQR: true,
            },
          });
        } else {
          throw new Error("Invalid payment data");
        }
      } catch (error) {
        if (result.startsWith("0x") && result.length === 42) {
          navigate("/send", {
            state: {
              scannedAddress: result,
              scannedFromQR: true,
            },
          });
        } else {
          toast.error("Invalid QR code in image");
          startScanning();
        }
      }
    } catch (error: any) {
      console.error("Error scanning image:", error);
      toast.error("No QR code found in image");
      startScanning();
    }
  };

  const handleBack = () => {
    stopScanning();
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-black relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 px-5 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">QR Code</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Scanner Area */}
        <div className="flex flex-col items-center justify-center min-h-screen px-5">
          {cameraError ? (
            /* Camera Error */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-white text-sm mb-2">{cameraError}</p>
              <p className="text-gray-400 text-xs mb-4">
                Please enable camera access in your browser settings
              </p>
              <button
                onClick={startScanning}
                className="px-6 py-2 bg-white text-black rounded-xl font-semibold"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* QR Scanner */}
              <div className="mb-6">
                <div
                  id="qr-reader"
                  className="rounded-2xl overflow-hidden border-4 border-white/20"
                  style={{ width: 280, height: 280 }}
                />
                {/* Hidden div for image scanning */}
                <div id="qr-reader-image" className="hidden" />
              </div>

              {/* Instructions */}
              <p className="text-white text-sm text-center mb-8 max-w-xs">
                Position QR code in the frame
              </p>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {/* Flash Light */}
                <button
                  onClick={toggleFlash}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                    flashOn ? "bg-yellow-500" : "bg-white/10 backdrop-blur-sm"
                  }`}>
                    {flashOn ? (
                      <Flashlight className="w-6 h-6 text-white" />
                    ) : (
                      <FlashlightOff className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <span className="text-white text-xs">flash light</span>
                </button>

                {/* Add Image */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs">add image</span>
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;