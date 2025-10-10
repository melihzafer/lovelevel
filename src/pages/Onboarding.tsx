import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore, usePetStore } from '../store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { getTranslation, type Language } from '../lib/i18n';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<Language>('en');
  const t = getTranslation(language);

  // Step 1: Partner names and start date
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [startDate, setStartDate] = useState('');

  // Step 2: Pet name
  const [petName, setPetName] = useState('');

  // Step 3: Notifications
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const handleNext = async () => {
    if (step === 1) {
      if (!partner1.trim() || !partner2.trim() || !startDate) {
        alert(t.fillAllFields);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!petName.trim()) {
        alert(t.namePet);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Save settings
      await updateSettings({
        partners: [
          { id: 'p1', name: partner1.trim() },
          { id: 'p2', name: partner2.trim() },
        ],
        relationshipStartDate: startDate,
        notificationsEnabled: notificationPermission === 'granted',
        onboardingCompleted: true,
        language,
      });
      
      // Update pet name
      const petStore = usePetStore.getState();
      await petStore.updatePet({ name: petName.trim() });
      
      navigate('/', { replace: true });
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleNotificationRequest = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleSkipNotifications = () => {
    setNotificationPermission('denied');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950">
      <div className="w-full max-w-md bg-bg-primary rounded-2xl shadow-lg p-8">
        {/* Language selector at top */}
        {step === 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Language / Dil / Език
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="en">🇬🇧 English</option>
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="bg">🇧🇬 Български</option>
            </select>
          </div>
        )}
        
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary-500' : 'bg-primary-100 dark:bg-primary-900'
              }`}
              aria-label={`Step ${i}${i === step ? ' (current)' : i < step ? ' (completed)' : ''}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-text-primary mb-2">{t.welcomeTitle}</h1>
              <p className="text-text-secondary">{t.welcomeSubtitle}</p>
            </div>

            <div className="space-y-4">
              <Input
                label={t.partner1Label}
                value={partner1}
                onChange={(e) => setPartner1(e.target.value)}
                placeholder={t.partner1Placeholder}
                required
                autoFocus
              />
              <Input
                label={t.partner2Label}
                value={partner2}
                onChange={(e) => setPartner2(e.target.value)}
                placeholder={t.partner2Placeholder}
                required
              />
              <Input
                label={t.startDateLabel}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🐾</div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">{t.petTitle}</h1>
              <p className="text-text-secondary">{t.petSubtitle}</p>
            </div>

            <div className="space-y-4">
              <Input
                label={t.petNameLabel}
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder={t.petNamePlaceholder}
                required
                autoFocus
              />
              <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 text-sm text-text-secondary">
                {t.petTip}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">{t.notificationsTitle}</h1>
              <p className="text-text-secondary">{t.notificationsSubtitle}</p>
            </div>

            {notificationPermission === 'default' && (
              <div className="space-y-4">
                <div className="bg-accent-50 dark:bg-accent-900/30 rounded-lg p-4 text-sm text-text-secondary space-y-2">
                  <p>{t.notificationsBenefit1}</p>
                  <p>{t.notificationsBenefit2}</p>
                  <p>{t.notificationsBenefit3}</p>
                </div>
                <Button onClick={handleNotificationRequest} fullWidth>
                  {t.enableNotifications}
                </Button>
                <Button onClick={handleSkipNotifications} variant="ghost" fullWidth>
                  {t.skipNotifications}
                </Button>
              </div>
            )}

            {notificationPermission === 'granted' && (
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
                <p className="text-green-700 dark:text-green-300 font-medium">{t.notificationsEnabled}</p>
                <p className="text-sm text-text-secondary mt-1">{t.notificationsEnabledDesc}</p>
              </div>
            )}

            {notificationPermission === 'denied' && (
              <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 text-center">
                <p className="text-text-secondary">{t.notificationsLater}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button onClick={handleBack} variant="outline" className="flex-1">
              {t.back}
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={
              (step === 1 && (!partner1.trim() || !partner2.trim() || !startDate)) ||
              (step === 2 && !petName.trim()) ||
              (step === 3 && notificationPermission === 'default')
            }
          >
            {step === 3 ? t.getStarted : t.next}
          </Button>
        </div>
      </div>
    </div>
  );
}
