import { useState, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { updateProfile } from 'firebase/auth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTranslation } from '../lib/i18n';
import { initDB } from '../lib/db';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localPhotoURL, setLocalPhotoURL] = useState<string | null>(null);

  // Load local photo from IndexedDB on mount
  useState(() => {
    if (user) {
      initDB().then(db => db.get('settings', 'profilePhoto' as any)).then((photo: any) => {
        if (photo) setLocalPhotoURL(photo.dataURL);
      });
    }
  });

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t.invalidFileType || 'Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t.fileTooLarge || 'Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataURL = event.target?.result as string;
        
        // Compress if needed (optional)
        const compressed = await compressImage(dataURL, 0.7);
        
        // Save to IndexedDB
        const db = await initDB();
        await db.put('settings', {
          id: 'profilePhoto',
          dataURL: compressed,
          timestamp: Date.now()
        } as any, 'profilePhoto' as any);
        
        setLocalPhotoURL(compressed);
        alert(t.photoUpdated || 'Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
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

  const compressImage = (dataURL: string, quality: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Resize to max 800x800 (maintain aspect ratio)
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataURL;
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t.loading || 'Loading...'}</p>
      </div>
    );
  }

  const displayPhotoURL = localPhotoURL || user.photoURL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 
                 dark:from-purple-950 dark:via-gray-900 dark:to-pink-950 
                 transition-colors duration-300 pb-24"
    >
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400 
                     hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.back || 'Back'}
        </button>

        {/* Profile Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
                        rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            {t.profile || 'Profile'}
          </h1>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              {displayPhotoURL ? (
                <img
                  src={displayPhotoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-32 h-32 rounded-full border-4 border-purple-200 
                             dark:border-purple-700 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br 
                                from-purple-400 via-pink-400 to-purple-500 
                                flex items-center justify-center text-white text-4xl font-bold">
                  {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              
              {/* Upload Overlay */}
              <label
                htmlFor="photo-upload"
                className="absolute inset-0 flex items-center justify-center 
                           bg-black/50 rounded-full opacity-0 group-hover:opacity-100 
                           transition-opacity cursor-pointer"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" 
                     viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center 
                                bg-black/50 rounded-full">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent 
                                  rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t.clickToUpload || 'Click on avatar to upload photo'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t.photoStoredLocally || 'Photo stored locally (not synced)'}
            </p>
          </div>

          {/* Display Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.displayName || 'Display Name'}
            </label>
            {isEditing ? (
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t.enterDisplayName || 'Enter your name'}
              />
            ) : (
              <div className="text-lg text-gray-800 dark:text-white">
                {user.displayName || t.notSet || 'Not set'}
              </div>
            )}
          </div>

          {/* Email (Read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.auth.email || 'Email'}
            </label>
            <div className="text-lg text-gray-800 dark:text-white">
              {user.email}
            </div>
          </div>

          {/* Account Created */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.accountCreated || 'Account Created'}
            </label>
            <div className="text-lg text-gray-800 dark:text-white">
              {user.metadata.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : t.unknown || 'Unknown'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {isEditing ? (
              <>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user.displayName || '');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {t.cancel || 'Cancel'}
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? t.saving || 'Saving...' : t.save || 'Save'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                {t.editProfile || 'Edit Profile'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
