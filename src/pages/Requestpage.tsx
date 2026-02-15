import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, Wallet } from "lucide-react";

const RequestPage: React.FC = () => {
  const navigate = useNavigate();

  const requestMethods = [
    {
      id: "qr-code",
      icon: QrCode,
      title: "QR Code",
      description: "Show QR code to sender",
      route: "/Qrcoderequestpage",
    },
    {
      id: "amount-qr",
      icon: QrCode,
      title: "Amount QR Code",
      description: "request fixed amount QR code",
      route: "/Amountqrcoderequestpage",
    },
    {
      id: "wallet-address",
      icon: Wallet,
      title: "Wallet Address",
      description: "request using wallet address",
      route: "/Walletaddressrequestpage",
    },
  ];

  const handleMethodClick = (route: string) => {
    navigate(route);
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
          <h1 className="text-lg font-bold text-gray-900">request</h1>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Choose method to request
          </h2>

          <div className="space-y-3">
            {requestMethods.map((method) => {
              const Icon = method.icon;

              return (
                <button
                  key={method.id}
                  onClick={() => handleMethodClick(method.route)}
                  className="w-full border-2 border-blue-600 rounded-2xl p-4 hover:bg-blue-50 active:scale-98 transition-all bg-white flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-bold text-gray-900 mb-0.5">
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-900 leading-relaxed">
              💡 Choose a method to request payment from others. They can scan
              your QR code or send to your wallet address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPage;
