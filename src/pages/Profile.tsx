import { useState, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { updateProfile } from 'firebase/auth';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageUtils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTranslation } from '../lib/i18n';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      const fileName = `${user.uid}/${Date.now()}_${file.name}`;
      
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
          id: user.uid,
          display_name: user.displayName || null,
          email: user.email || null,
          photo_url: photoURL,
        });

      if (dbError) console.error('Profile DB update error:', dbError);
      
      // 6. Update Firebase Auth profile (for consistency)
      await updateProfile(user, { photoURL });
      
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
      await updateProfile(user, { displayName });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950 dark:via-gray-900 dark:to-pink-950 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">{t.back || 'Back'}</span>
          </button>

          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            {t.profile || 'Profile'}
          </h1>

          <div className="w-16" /> {/* Spacer for centering */}
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative group">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 dark:border-purple-700 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-purple-200 dark:border-purple-700 shadow-lg">
                  {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}

              {/* Upload overlay */}
              <label
                htmlFor="photo-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.clickToUpload || 'Click on avatar to upload photo'}
            </p>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.displayName || 'Display Name'}
              </label>
              {isEditing ? (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.enterDisplayName || 'Enter your name'}
                  className="w-full"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                  {user?.displayName || t.notSet || 'Not set'}
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.auth.email || 'Email'}
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                {user?.email}
              </div>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.accountCreated || 'Account Created'}
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                {user?.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
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
                      setDisplayName(user?.displayName || '');
                    }}
                    variant="outline"
                    fullWidth
                  >
                    {t.cancel || 'Cancel'}
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isSaving} fullWidth>
                    {isSaving ? (t.saving || 'Saving...') : (t.save || 'Save')}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} fullWidth>
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
