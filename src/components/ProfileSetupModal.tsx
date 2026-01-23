import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { UserCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleSetupProfile = () => {
    onClose();
    navigate('/profile');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[390px] transform overflow-hidden rounded-3xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center relative">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <UserCircle className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <Dialog.Title className="text-2xl font-bold text-white mb-2">
                    Complete Your Profile
                  </Dialog.Title>
                  <p className="text-blue-100 text-sm">
                    Set up your profile to get started
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">
                        📝 Why complete your profile?
                      </h3>
                      <ul className="text-xs text-gray-600 space-y-2">
                        <li>• Get a personalized username (e.g., @yourname)</li>
                        <li>• Receive transaction notifications via email</li>
                        <li>• Unlock exclusive features and rewards</li>
                        <li>• Better security and account recovery</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
                      <p className="text-xs text-yellow-800">
                        ⚠️ <span className="font-semibold">Important:</span> Complete your profile now to avoid missing important updates!
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleSetupProfile}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                      Setup Profile Now
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-2xl transition-all active:scale-95"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>

                {/* Bottom Safe Area */}
                <div className="h-4 bg-white"></div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProfileSetupModal;