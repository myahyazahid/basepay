import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2,Upload, X } from 'lucide-react';
import { useAccount } from 'wagmi';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../config/supabase';
import { uploadAvatar, deleteAvatar } from '../utils/avatarUpload';

interface UserData {
  username: string;
  email: string;
  avatar: string | null;
  wallet: string;
}

// interface BasepayName {
//   name: string;
//   is_primary: boolean;
// }

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    username: '',
    email: '',
    avatar: null,
    wallet: '',
  });
  const [basepayName, setBasepayName] = useState('');
  const [userId, setUserId] = useState<string>('');

const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);




  // Redirect if not connected
  useEffect(() => {
    if (!isConnected || !address) {
      navigate('/');
    }
  }, [isConnected, address, navigate]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!address) return;

      try {
        setLoading(true);

        // Get user data
        const { data: user, error: userError } = await supabase
          .from('user')
          .select('id_user, wallet, username, email, avatar')
          .eq('wallet', address.toLowerCase())
          .single();

        if (userError) throw userError;

        setUserId(user.id_user);
        setUserData({
          username: user.username || '',
          email: user.email || '',
          avatar: user.avatar,
          wallet: user.wallet,
        });

        // Get basepay name (primary name only)
        const { data: nameData } = await supabase
          .from('basepay_names')
          .select('name')
          .eq('id_user', user.id_user)
          .eq('is_primary', true)
          .eq('is_active', true)
          .single();

        if (nameData) {
          setBasepayName(nameData.name);
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [address]);


   // ← TAMBAH FUNCTION INI
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPG, PNG, WEBP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 5MB');
      return;
    }

    // Set file and create preview
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // Handle save changes
  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!userData.username.trim()) {
        toast.error('Username is required');
        return;
      }

      if (!userData.email.trim()) {
        toast.error('Email is required');
        return;
      }


      let avatarUrl = userData.avatar;
      
      if (avatarFile) {
        try {
          setUploadingAvatar(true);
          toast.loading('Uploading avatar...', { id: 'avatar-upload' });

          // Delete old avatar if exists
          if (userData.avatar) {
            await deleteAvatar(userData.avatar);
          }

          // Upload new avatar
          const newAvatarUrl = await uploadAvatar(avatarFile, userId);
          avatarUrl = newAvatarUrl;

          toast.success('Avatar uploaded!', { id: 'avatar-upload' });
        } catch (error: any) {
          toast.error(error.message || 'Failed to upload avatar', { id: 'avatar-upload' });
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }  

      

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        toast.error('Please enter a valid email');
        return;
      }

      // Update user data
      const { error: userError } = await supabase
        .from('user')
        .update({
          username: userData.username.trim(),
          email: userData.email.trim(),
          avatar: avatarUrl,
        })
        .eq('id_user', userId);

      if (userError) throw userError;

      // Handle basepay name
      if (basepayName.trim()) {
        // Validate basepay name format (alphanumeric + underscore only)
        const nameRegex = /^[a-zA-Z0-9_]+$/;
        if (!nameRegex.test(basepayName)) {
          toast.error('BasePay name can only contain letters, numbers, and underscores');
          return;
        }

        // Check if name already exists (excluding current user)
        const { data: existingName } = await supabase
          .from('basepay_names')
          .select('id')
          .eq('name', basepayName.toLowerCase())
          .neq('id_user', userId)
          .single();

        if (existingName) {
          toast.error('This BasePay name is already taken');
          return;
        }

        // Check if user already has a primary name
        const { data: currentName } = await supabase
          .from('basepay_names')
          .select('id, name')
          .eq('id_user', userId)
          .eq('is_primary', true)
          .single();

        if (currentName) {
          // Update existing primary name
          const { error: updateError } = await supabase
            .from('basepay_names')
            .update({
              name: basepayName.toLowerCase(),
              is_active: true,
            })
            .eq('id', currentName.id);

          if (updateError) throw updateError;
        } else {
          // Insert new primary name
          const { error: insertError } = await supabase
            .from('basepay_names')
            .insert([
              {
                id_user: userId,
                name: basepayName.toLowerCase(),
                is_primary: true,
                is_active: true,
              },
            ]);

          if (insertError) throw insertError;
        }
      }

      toast.success('Profile updated successfully!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
        },
      });

      // Navigate back to profile
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-full max-w-[390px] min-h-screen bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Avatar Section */}
            {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white flex items-center justify-center overflow-hidden">
                    {userData.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                    <Camera className="w-5 h-5 text-blue-600" />
                  </button>
                </div>
                <p className="text-white font-medium mt-4">Change Avatar</p>
                <p className="text-blue-100 text-xs mt-1">Click the camera icon to upload</p>
              </div>
            </div> */}

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8">
  <div className="flex flex-col items-center">
    <div className="relative">
      <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white flex items-center justify-center overflow-hidden">
        {avatarPreview || userData.avatar ? (
          <img
            src={avatarPreview || userData.avatar || ''}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <Upload className="w-12 h-12 text-gray-500" />
          </div>
        )}
      </div>
      
      {/* Upload Button */}
      <button
        type="button"
        onClick={handleAvatarClick}
        disabled={uploadingAvatar}
        className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        {uploadingAvatar ? (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        ) : (
          <Camera className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {/* Remove Avatar Button (jika ada preview) */}
      {avatarPreview && (
        <button
          type="button"
          onClick={handleRemoveAvatar}
          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
    </div>

    {/* Hidden File Input */}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
      onChange={handleAvatarChange}
      className="hidden"
    />

    <p className="text-white font-medium mt-4">
      {avatarPreview ? 'New Avatar Selected' : 'Change Avatar'}
    </p>
    <p className="text-blue-100 text-xs mt-1">
      {avatarPreview 
        ? 'Click Save Changes to upload' 
        : 'Click the camera icon to upload (max 5MB)'
      }
    </p>
  </div>
</div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={userData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* BasePay Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BasePay Name
                </label>
                <input
                  type="text"
                  value={basepayName}
                  onChange={(e) => setBasepayName(e.target.value)}
                  placeholder="your.basepay"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only letters, numbers, and underscores. This will be your unique identifier.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Wallet Address (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={shortenAddress(userData.wallet)}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Wallet address cannot be changed
                </p>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;