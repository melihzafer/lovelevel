import { useState, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageUtils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTranslation } from '../lib/i18n';
import { AnimatedBackground } from '../components/layout/AnimatedBackground';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getDisplayName = () => user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const getPhotoURL = () => user?.user_metadata?.avatar_url;

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t.invalidFileType || 'Please upload an image file');
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert(t.fileTooLarge || 'Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Compress image (target: max 1MB)
      const compressedFile = await compressImage(file, 1024);
      
      // 2. Create file path: profile-photos/{userId}/{timestamp}_{filename}
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      
      // 3. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;
      
      // 4. Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);
      
      const photoURL = urlData.publicUrl;
      
      // 5. Update Supabase profiles table
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: getDisplayName(),
          email: user.email || null,
          photo_url: photoURL,
        });

      if (dbError) console.error('Profile DB update error:', dbError);
      
      // 6. Update Auth profile
      await updateProfile({ photoURL });
      
      alert(t.photoUpdated || 'Profile photo updated successfully!');
      window.location.reload(); // Refresh to show new photo
    } catch (error) {
      console.error('Photo upload error:', error);
      alert(t.photoUploadError || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile({ displayName });
      alert(t.profileUpdated || 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      alert(t.profileUpdateError || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary dark:bg-bg-primary relative overflow-hidden transition-colors duration-500 pb-20">
      <AnimatedBackground />

      <div className="max-w-md mx-auto p-6 relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-200 shadow-sm border border-white/20"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            {t.profile || 'Profile'}
          </h1>

          <div className="w-9" /> {/* Spacer for centering */}
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-white/5 ring-1 ring-black/5"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative group">
              {getPhotoURL() ? (
                <img
                  src={getPhotoURL()}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-white/50 dark:ring-white/10 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold ring-4 ring-white/50 dark:ring-white/10 shadow-lg">
                  {getDisplayName()?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}

              {/* Upload overlay */}
              <label
                htmlFor="photo-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <div className="text-white flex flex-col items-center gap-1">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-medium">Change</span>
                </div>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="hidden"
              />

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                  <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
                </div>
              )}
            </div>

            <p className="text-sm text-center text-text-secondary">
              {user?.email}
            </p>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">
                {t.displayName || 'Display Name'}
              </label>
              {isEditing ? (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.enterDisplayName || 'Enter your name'}
                  className="w-full bg-white/50 dark:bg-black/20"
                />
              ) : (
                <div className="px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-xl text-text-primary">
                  {getDisplayName()}
                </div>
              )}
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">
                {t.accountCreated || 'Account Created'}
              </label>
              <div className="px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-xl text-text-primary">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : t.unknown || 'Unknown'}
              </div>
            </div>

            {/* Edit Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user?.user_metadata?.full_name || '');
                    }}
                    variant="ghost"
                    className="flex-1"
                  >
                    {t.cancel || 'Cancel'}
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg shadow-purple-500/20">
                    {isSaving ? (t.saving || 'Saving...') : (t.save || 'Save')}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} fullWidth className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg shadow-purple-500/20">
                  {t.editProfile || 'Edit Profile'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
