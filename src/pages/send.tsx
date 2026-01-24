import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Wallet } from 'lucide-react';
import { AtSign } from "lucide-react";


const send: React.FC = () => {
  const navigate = useNavigate();

  const paymentMethods = [
    {
      id: 'scan-qr',
      icon: QrCode,
      title: 'Scan QR',
      description: 'Scan recipient qr code',
      path: '/scan-qr'
    },
    {
      id: 'basepay-name',
      icon: AtSign ,
      title: 'Basepay Name',
      description: 'Send using basepay username',
      iconBg: '',
      path: '/send-username'
    },
    {
      id: 'wallet-address',
      icon: Wallet,
      title: 'Wallet Address',
      description: 'Send to wallet address',
      path: '/send-address'
    }
  ];

  const handleMethodClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
        
          {/* Header with Back Button */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeft className="w-6 h-6" />
                      </button>
                      <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
                    </div>
          
<div className="p-6 space-y-6">
          {/* <h1 className="text-2xl font-bold text-gray-900 mb-2">Send/Pay</h1> */}

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Choose method to send/pay
          </h2>

          {/* Payment Method Options */}
          <div className="space-y-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => handleMethodClick(method.path)}
                  className="w-full bg-white border-2 border-blue-600 rounded-2xl p-5 flex items-center gap-4 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className={`w-12 h-12 ${method.iconBg || 'bg-white border-2 border-black-600'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${method.iconBg ? 'text-white' : 'text-gray-700'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-0.5">
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
        </div>
      </div>
    </div>
  );
};

export default send;