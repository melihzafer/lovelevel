import { useState } from 'react';
import { useSettingsStore, usePetStore, useChallengesStore } from '../store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useTranslation, type Language } from '../lib/i18n';
import * as db from '../lib/db';

export default function SettingsPage() {
  const t = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const pet = usePetStore();
  const { challenges } = useChallengesStore();
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportedData, setExportedData] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);

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
    if (!('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }

    const permission = await Notification.requestPermission();
    await updateSettings({
      notificationsEnabled: permission === 'granted',
      notificationPermission: permission,
    });

    if (permission === 'granted') {
      new Notification('coupLOVE', {
        body: "You'll now receive anniversary reminders! 💕",
        icon: '/icons/icon-192.png',
      });
    }
  };

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
    <div className="min-h-screen bg-bg-secondary pb-24">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">{t.settings}</h1>

        {/* Stats Overview */}
        <div className="bg-bg-primary rounded-xl p-6 shadow space-y-4">
          <h2 className="font-semibold text-text-primary">{t.yourJourney}</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {settings.partners[0]?.name || '—'} & {settings.partners[1]?.name || '—'}
              </div>
              <div className="text-xs text-text-secondary mt-1">{t.partners}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                {completedChallenges}/{totalChallenges}
              </div>
              <div className="text-xs text-text-secondary mt-1">{t.challenges}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                Lv. {pet.level}
              </div>
              <div className="text-xs text-text-secondary mt-1">{pet.name}</div>
            </div>
          </div>
        </div>

        {/* Relationship Start Date */}
        <div className="bg-bg-primary rounded-xl p-6 shadow space-y-4">
          <h2 className="font-semibold text-text-primary">{t.relationshipDetails}</h2>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t.startDateLabel}
            </label>
            <Input
              type="date"
              value={settings.relationshipStartDate}
              onChange={(e) => updateSettings({ relationshipStartDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t.partner1Label}
              value={settings.partners[0]?.name || ''}
              onChange={(e) => {
                const newPartners = [...settings.partners];
                newPartners[0] = { id: newPartners[0]?.id || 'p1', name: e.target.value };
                updateSettings({ partners: newPartners });
              }}
            />
            <Input
              label={t.partner2Label}
              value={settings.partners[1]?.name || ''}
              onChange={(e) => {
                const newPartners = [...settings.partners];
                newPartners[1] = { id: newPartners[1]?.id || 'p2', name: e.target.value };
                updateSettings({ partners: newPartners });
              }}
            />
          </div>
{/* w-full px-4 py-2 border border-border-color rounded-lg bg-white text-white placeholder:text-primary-300 dark:placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t.messageTemplate}
            </label>
            <textarea
              value={settings.messageTemplate}
              onChange={(e) => updateSettings({ messageTemplate: e.target.value })}
              className="w-full px-4 py-2 border border-border-color rounded-lg bg-white text-primary-300 placeholder:text-primary-300 dark:placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              rows={3}
              placeholder="Use {partner_name_1}, {partner_name_2}, {months_together}, {days_together}"
            />
            <p className="text-xs text-text-secondary mt-1">
              Available variables: {'{partner_name_1}'}, {'{partner_name_2}'}, {'{months_together}'}, {'{days_together}'}
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-bg-primary rounded-xl p-6 shadow space-y-4">
          <h2 className="font-semibold text-text-primary">{t.notifications}</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">{t.anniversaryReminders}</div>
              <div className="text-sm text-text-secondary">
                {settings.notificationPermission === 'granted'
                  ? t.enabled
                  : settings.notificationPermission === 'denied'
                  ? t.denied
                  : 'Not set'}
              </div>
            </div>
            <Button
              onClick={handleRequestNotifications}
              variant="secondary"
              disabled={settings.notificationPermission === 'denied'}
            >
              {settings.notificationPermission === 'granted' ? t.enabled : 'Enable'}
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-bg-primary rounded-xl p-6 shadow space-y-4">
          <h2 className="font-semibold text-text-primary">{t.appearance}</h2>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t.theme}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['system', 'light', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors capitalize ${
                    settings.theme === theme
                      ? 'bg-primary-500 text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-primary-50 dark:hover:bg-primary-900/30'
                  }`}
                >
                  {theme === 'system' && '⚙️ '}
                  {theme === 'light' && '☀️ '}
                  {theme === 'dark' && '🌙 '}
                  {theme}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t.language}
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as Language })}
              className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="en">🇬🇧 English</option>
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="bg">🇧🇬 Български</option>
            </select>
            <Button
              onClick={handleMigrateChallenges}
              disabled={isMigrating}
              variant="outline"
              className="w-full mt-3 min-h-[44px]"
            >
              {isMigrating ? '⏳ Güncelleniyor...' : '🔄 Challengeleri Bu Dile Çevir'}
            </Button>
            <p className="text-xs text-text-secondary mt-2">
              💡 Dili değiştirdikten sonra bu butona basarak mevcut challengeleri yeni dile çevirin
            </p>
          </div>
        </div>

        {/* XP Settings */}
        <div className="bg-bg-primary rounded-xl p-6 shadow space-y-4">
          <h2 className="font-semibold text-text-primary">{t.petProgression}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label={t.xpPerChallenge}
              value={settings.xpPerChallenge}
              onChange={(e) => updateSettings({ xpPerChallenge: parseInt(e.target.value) || 20 })}
              min="1"
            />
            <Input
              type="number"
              label={t.xpPerMonthiversary}
              value={settings.xpPerMonthiversary}
              onChange={(e) => updateSettings({ xpPerMonthiversary: parseInt(e.target.value) || 100 })}
              min="1"
            />
          </div>

          <Input
            type="number"
            label="Level Curve Multiplier"
            value={settings.levelCurveMultiplier}
            onChange={(e) => updateSettings({ levelCurveMultiplier: parseFloat(e.target.value) || 1.15 })}
            step="0.01"
            min="1"
          />
          <p className="text-xs text-text-secondary">
            Higher values = slower leveling. Default: 1.15
          </p>
        </div>

        {/* Data Management */}
        <div className="bg-bg-primary rounded-xl p-6 shadow space-y-4">
          <h2 className="font-semibold text-text-primary">{t.dataManagement}</h2>
          
          <div className="flex gap-3">
            <Button onClick={handleExport} variant="secondary" className="flex-1">
              📤 {t.exportData}
            </Button>
            <Button onClick={() => setShowImportModal(true)} variant="secondary" className="flex-1">
              📥 {t.importData}
            </Button>
          </div>

          <p className="text-xs text-text-secondary">
            {t.dataManagementDesc}
          </p>
        </div>

        {/* About */}
        <div className="bg-bg-primary rounded-xl p-6 shadow text-center text-sm text-text-secondary">
          <div className="text-4xl mb-2">💕</div>
          <div className="font-semibold text-text-primary mb-1">LoveLevel</div>
          <div>{t.appTagline}</div>
          <div className="mt-4 text-xs">
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
            className="w-full px-4 py-2 bg-bg-secondary border border-border-color rounded-lg text-text-primary font-mono text-xs"
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
    </div>
  );
}
