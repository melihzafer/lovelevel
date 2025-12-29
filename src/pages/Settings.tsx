import { useState } from 'react';
import { useSettingsStore, usePetStore, useChallengesStore } from '../store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useTranslation, type Language } from '../lib/i18n';
import * as db from '../lib/db';
import { 
  requestNotificationPermission, 
  showTestNotification, 
  isNotificationSupported,
  getUpcomingNotifications 
} from '../lib/notifications';
import { useAuth } from '../contexts/FirebaseAuthContext';
import type { NotificationSchedule } from '../lib/notifications';
import { AnimatedBackground } from '../components/layout/AnimatedBackground';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const { deleteAccount } = useAuth();
  const pet = usePetStore();
  const { challenges } = useChallengesStore();
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [upcomingNotifications, setUpcomingNotifications] = useState<NotificationSchedule[]>([]);
  const [exportedData, setExportedData] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [emojiPickerTarget, setEmojiPickerTarget] = useState<number | null>(null);

  const handleExport = async () => {
    const data = await db.exportData();
    const json = JSON.stringify(data, null, 2);
    setExportedData(json);
    setShowExportModal(true);
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportedData);
    alert('Copied to clipboard!');
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);
      await db.importData(data);
      alert('Data imported successfully! Refreshing...');
      window.location.reload();
    } catch (error) {
      alert('Invalid data format. Please check your JSON.');
      console.error(error);
    }
  };

  const handleRequestNotifications = async () => {
    if (!isNotificationSupported()) {
      alert(t.notificationsNotSupported || 'Notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        // Show test notification
        await showTestNotification();
        
        // Load upcoming notifications
        const upcoming = await getUpcomingNotifications();
        setUpcomingNotifications(upcoming);
      }
    } catch (error) {
      console.error('Error requesting notifications:', error);
      alert(t.notificationError || 'Failed to enable notifications');
    }
  };

  const handleTestNotification = async () => {
    try {
      await showTestNotification();
    } catch (error) {
      console.error('Error showing test notification:', error);
      alert(t.notificationError || 'Failed to show notification');
    }
  };

  // Load upcoming notifications on mount
  useState(() => {
    if (settings.notificationsEnabled) {
      getUpcomingNotifications().then(setUpcomingNotifications).catch(console.error);
    }
  });

  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    updateSettings({ theme });
    
    // Apply theme immediately
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleMigrateChallenges = async () => {
    setIsMigrating(true);
    try {
      const updatedCount = await db.migrateChallengeTranslations();
      alert(`✅ ${updatedCount} challenge güncellendi! Sayfayı yeniliyorum...`);
      window.location.reload();
    } catch (error) {
      console.error('Migration error:', error);
      alert('❌ Bir hata oluştu. Konsolu kontrol edin.');
    } finally {
      setIsMigrating(false);
    }
  };

  const completedChallenges = challenges.filter((c) => c.completedAt).length;
  const totalChallenges = challenges.length;

  return (
    <div className="min-h-screen bg-bg-secondary dark:bg-bg-primary pb-32 relative overflow-hidden transition-colors duration-500">
      <AnimatedBackground />
      <div className="max-w-2xl mx-auto p-6 space-y-6 relative z-10">
        <h1 className="text-3xl font-bold text-text-primary">{t.settings}</h1>

        {/* Stats Overview */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-white/5 ring-1 ring-black/5 space-y-4">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span>🚀</span> {t.yourJourney}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 flex flex-col items-center justify-center min-h-[100px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{settings.partners[0]?.avatar || '👤'}</span>
                <span className="text-gray-400 text-xs">&</span>
                <span className="text-2xl">{settings.partners[1]?.avatar || '👤'}</span>
              </div>
              <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 line-clamp-1 break-all px-2">
                {settings.partners[0]?.name || 'Partner 1'} & {settings.partners[1]?.name || 'Partner 2'}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 flex flex-col items-center justify-center min-h-[100px]">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                {completedChallenges}/{totalChallenges}
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{t.challenges}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 flex flex-col items-center justify-center min-h-[100px]">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
                Lv. {pet.level}
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{pet.name}</div>
            </div>
          </div>
        </div>

        {/* Relationship Start Date */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-white/5 ring-1 ring-black/5 space-y-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span>❤️</span> {t.relationshipDetails}
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
              {t.startDateLabel}
            </label>
            <Input
              type="date"
              value={settings.relationshipStartDate}
              onChange={(e) => updateSettings({ relationshipStartDate: e.target.value })}
              className="bg-white/50 dark:bg-black/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t.partner1Label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEmojiPickerTarget(0)}
                  className="w-12 h-12 flex-shrink-0 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-2xl hover:bg-white dark:hover:bg-white/10 transition-colors"
                >
                  {settings.partners[0]?.avatar || '👤'}
                </button>
                <Input
                  value={settings.partners[0]?.name || ''}
                  onChange={(e) => {
                    const newPartners = [...settings.partners];
                    newPartners[0] = { ...newPartners[0], id: newPartners[0]?.id || 'p1', name: e.target.value };
                    updateSettings({ partners: newPartners });
                  }}
                  className="bg-white/50 dark:bg-black/20 flex-1"
                  placeholder="Partner 1 Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t.partner2Label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEmojiPickerTarget(1)}
                  className="w-12 h-12 flex-shrink-0 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-2xl hover:bg-white dark:hover:bg-white/10 transition-colors"
                >
                  {settings.partners[1]?.avatar || '👤'}
                </button>
                <Input
                  value={settings.partners[1]?.name || ''}
                  onChange={(e) => {
                    const newPartners = [...settings.partners];
                    newPartners[1] = { ...newPartners[1], id: newPartners[1]?.id || 'p2', name: e.target.value };
                    updateSettings({ partners: newPartners });
                  }}
                  className="bg-white/50 dark:bg-black/20 flex-1"
                  placeholder="Partner 2 Name"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
              {t.messageTemplate}
            </label>
            <textarea
              value={settings.messageTemplate}
              onChange={(e) => updateSettings({ messageTemplate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all resize-none"
              rows={3}
              placeholder="Use {partner_name_1}, {partner_name_2}, {months_together}, {days_together}"
            />
            <p className="text-xs text-gray-500 mt-2 ml-1">
              Available variables: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-pink-600 dark:text-pink-400">{'{partner_name_1}'}</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-pink-600 dark:text-pink-400">{'{partner_name_2}'}</code>...
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-white/5 ring-1 ring-black/5 space-y-4">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span>🔔</span> {t.notifications}
          </h2>
          
          <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/5">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{t.anniversaryReminders}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {settings.notificationPermission === 'granted'
                  ? '✅ ' + t.enabled
                  : settings.notificationPermission === 'denied'
                  ? '❌ ' + t.denied
                  : '⚠️ Not set'}
              </div>
            </div>
            <Button
              onClick={handleRequestNotifications}
              variant={settings.notificationPermission === 'granted' ? 'secondary' : 'primary'}
              disabled={settings.notificationPermission === 'denied'}
              className="min-w-[100px]"
            >
              {settings.notificationPermission === 'granted' ? 'Enabled' : 'Enable'}
            </Button>
          </div>

          {settings.notificationPermission === 'granted' && (
            <div className="space-y-4">
              {/* Test Notification Button */}
              <Button
                onClick={handleTestNotification}
                variant="ghost"
                className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
              >
                🔔 {t.testNotification || 'Send Test Notification'}
              </Button>

              {/* Upcoming Notifications */}
              {upcomingNotifications.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider ml-1">
                    {t.upcomingNotifications || 'Upcoming Reminders'}
                  </h3>
                  {upcomingNotifications.map((notification, index) => (
                    <div 
                      key={index}
                      className="bg-white/40 dark:bg-white/5 rounded-xl p-3 text-sm border border-white/10"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {notification.body}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-pink-600 dark:text-pink-400 whitespace-nowrap bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-full">
                          {new Date(notification.scheduledFor).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {settings.notificationPermission === 'denied' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm flex items-start gap-3">
              <span className="text-lg">❌</span>
              <p className="text-red-800 dark:text-red-300">
                {t.notificationsDenied || 'Notifications are blocked. Please enable them in your browser settings.'}
              </p>
            </div>
          )}

          {!isNotificationSupported() && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <p className="text-yellow-800 dark:text-yellow-300">
                {t.notificationsNotSupported || 'Notifications are not supported in this browser.'}
              </p>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-white/5 ring-1 ring-black/5 space-y-6">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span>🎨</span> {t.appearance}
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">
              {t.theme}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['system', 'light', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`relative overflow-hidden px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300 group ${
                    settings.theme === theme
                      ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 scale-105 ring-2 ring-pink-500/50 ring-offset-2 dark:ring-offset-gray-900'
                      : 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:shadow-md border border-white/20 dark:border-white/5'
                  }`}
                >
                  <div className="text-2xl mb-1 filter drop-shadow-sm">
                    {theme === 'system' && '⚙️'}
                    {theme === 'light' && '☀️'}
                    {theme === 'dark' && '🌙'}
                  </div>
                  <div className="capitalize">{theme}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
              {t.language}
            </label>
            <div className="relative">
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value as Language })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all appearance-none cursor-pointer"
              >
                <option value="en">🇬🇧 English</option>
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="bg">🇧🇬 Български</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                ▼
              </div>
            </div>
            
            <Button
              onClick={handleMigrateChallenges}
              disabled={isMigrating}
              variant="outline"
              className="w-full mt-4 h-12 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-700"
            >
              {isMigrating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Güncelleniyor...
                </span>
              ) : (
                '🔄 Update Challenge Language'
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              💡 Refresh challenges translation after changing language
            </p>
          </div>
        </div>

        {/* XP Settings */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-white/5 ring-1 ring-black/5 space-y-4">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span>⚡</span> {t.petProgression}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label={t.xpPerChallenge}
              value={settings.xpPerChallenge}
              onChange={(e) => updateSettings({ xpPerChallenge: parseInt(e.target.value) || 20 })}
              min="1"
              className="bg-white/50 dark:bg-black/20"
            />
            <Input
              type="number"
              label={t.xpPerMonthiversary}
              value={settings.xpPerMonthiversary}
              onChange={(e) => updateSettings({ xpPerMonthiversary: parseInt(e.target.value) || 100 })}
              min="1"
              className="bg-white/50 dark:bg-black/20"
            />
          </div>

          <div>
            <Input
              type="number"
              label="Level Curve Multiplier"
              value={settings.levelCurveMultiplier}
              onChange={(e) => updateSettings({ levelCurveMultiplier: parseFloat(e.target.value) || 1.15 })}
              step="0.01"
              min="1"
              className="bg-white/50 dark:bg-black/20"
            />
            <p className="text-xs text-gray-500 mt-2 ml-1">
              Higher values = slower leveling. Default: 1.15
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-white/5 ring-1 ring-black/5 space-y-4">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span>💾</span> {t.dataManagement}
          </h2>
          
          <div className="flex gap-3">
            <Button onClick={handleExport} variant="secondary" className="flex-1 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-white/20 dark:border-white/10">
              📤 {t.exportData}
            </Button>
            <Button onClick={() => setShowImportModal(true)} variant="secondary" className="flex-1 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-white/20 dark:border-white/10">
              📥 {t.importData}
            </Button>
          </div>

          <p className="text-xs text-gray-500 ml-1">
            {t.dataManagementDesc}
          </p>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-red-100 dark:border-red-900/30 space-y-4">
          <h2 className="font-semibold text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
            <span>⚠️</span> Danger Zone
          </h2>
          
          <p className="text-sm text-red-800 dark:text-red-300">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          <Button 
            onClick={async () => {
              if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                try {
                  await deleteAccount();
                } catch (error) {
                  alert('Failed to delete account. Please try again.');
                }
              }
            }} 
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-100/50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Delete Account
          </Button>
        </div>

        {/* About */}
        <div className="text-center space-y-2 py-4 opacity-60 hover:opacity-100 transition-opacity">
          <div className="text-4xl mb-2 animate-pulse">💕</div>
          <div className="font-semibold text-gray-900 dark:text-white">LoveLevel</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t.appTagline}</div>
          <div className="text-xs text-gray-500">
            {t.madeWithLove} · {t.version} 1.0.0
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title={t.exportData}>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t.exportModalDesc}
          </p>
          
          <textarea
            value={exportedData}
            readOnly
            className="w-full px-4 py-2 border border-primary-600 rounded-lg bg-white text-primary-300 placeholder:text-primary-300 dark:placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono text-xs"
            rows={10}
          />

          <div className="flex gap-3">
            <Button onClick={handleCopyExport} className="flex-1">
              {t.copyToClipboard}
            </Button>
            <Button onClick={() => setShowExportModal(false)} variant="secondary" className="flex-1">
              {t.close}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title={t.importData}>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t.importModalDesc}
          </p>
          
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder={t.pasteJsonPlaceholder}
            className="w-full px-4 py-2 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder:text-primary-400 dark:placeholder:text-primary-300 font-mono text-xs"
            rows={10}
          />

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={!importData.trim()} className="flex-1">
              {t.import}
            </Button>
            <Button onClick={() => setShowImportModal(false)} variant="secondary" className="flex-1">
              {t.cancel}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Emoji Picker Modal */}
      <Modal 
        isOpen={emojiPickerTarget !== null} 
        onClose={() => setEmojiPickerTarget(null)} 
        title="Choose Avatar"
      >
        <div className="grid grid-cols-5 gap-2 p-2">
          {['👩', '👨', '🧑', '👱‍♀️', '👱', '🧔', '👵', '👴', '🦁', '🐰', '🐻', '🐼', '🐨', '😺', '🐶', '🦊', '🐷', '🐸', '🦄', '🐝'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                if (emojiPickerTarget !== null) {
                  const newPartners = [...settings.partners];
                  newPartners[emojiPickerTarget] = { 
                    ...newPartners[emojiPickerTarget], 
                    avatar: emoji 
                  };
                  updateSettings({ partners: newPartners });
                  setEmojiPickerTarget(null);
                }
              }}
              className="text-3xl p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
