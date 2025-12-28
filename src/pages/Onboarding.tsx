import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Calendar, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useSettingsStore, usePetStore } from '../store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { getTranslation, type Language } from '../lib/i18n';
import { generateInviteCode, getActiveInviteCode, acceptInviteCode } from '../services/inviteService';
import { seedChallenges } from '../data/seedChallenges';
import { addChallenge } from '../lib/db';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<Language>('en');
  const t = getTranslation(language);

  // Step 1: Do you have a partner?
  const [hasPartner, setHasPartner] = useState<boolean | null>(null);

  // Step 2a: Join with code (if hasPartner = true)
  const [partnerCode, setPartnerCode] = useState('');
  const [joiningPartner, setJoiningPartner] = useState(false);

  // Step 2b: Generate code (if hasPartner = false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Step 3: Anniversary date
  const [anniversaryDate, setAnniversaryDate] = useState('');

  // Step 4: Pet name
  const [petName, setPetName] = useState('');

  // Partnership state
  const [partnershipId, setPartnershipId] = useState<string | null>(null);

  // Auto-load existing invite code if user already generated one
  useEffect(() => {
    async function checkExistingCode() {
      if (user && hasPartner === false && !generatedCode) {
        const code = await getActiveInviteCode(user.uid);
        if (code) {
          setGeneratedCode(code.code);
        }
      }
    }
    checkExistingCode();
  }, [user, hasPartner, generatedCode]);

  const handleNext = async () => {
    if (step === 1) {
      if (hasPartner === null) {
        alert(t.fillAllFields);
        return;
      }
      setStep(2);
    } else if (step === 2 && hasPartner === true) {
      // Join with partner code
      if (!partnerCode.trim()) {
        alert(t.fillAllFields);
        return;
      }
      
      if (!user) {
        alert('User is not authenticated. Please wait and try again.');
        return;
      }

      setJoiningPartner(true);
      try {
        const result = await acceptInviteCode(partnerCode.trim().toUpperCase(), user.uid);
        if (result.success && result.partnershipId) {
          setPartnershipId(result.partnershipId);
          console.log('✅ Partnership created:', result.partnershipId);
          
          // ✨ Skip setup steps if joining a partner
          // Use the synced anniversary date and partner info
          await updateSettings({
            partners: [
              { id: user.uid, name: user.displayName || user.email?.split('@')[0] || 'You' },
              { id: 'partner', name: result.partnerName || 'Partner' },
            ],
            relationshipStartDate: result.anniversaryDate || new Date().toISOString().split('T')[0],
            notificationsEnabled: false,
            onboardingCompleted: true, // Complete immediately
            language,
          });

          // Redirect to home immediately
          // The sync system will pull the pet state later
          navigate('/', { replace: true });
          
        } else {
          alert(result.error || 'Failed to join partnership');
        }
      } catch (err) {
        console.error('❌ Error joining partnership:', err);
        alert('Failed to join partnership. Please check the code and try again.');
      } finally {
        setJoiningPartner(false);
      }
    } else if (step === 2 && hasPartner === false) {
      // Generate new invite code
      if (!user) {
        alert('User is not authenticated. Please wait and try again.');
        return;
      }

      if (!generatedCode) {
        setGeneratingCode(true);
        try {
          const result = await generateInviteCode(user.uid);
          if (result) {
            setGeneratedCode(result.code);
            console.log('✅ Invite code generated:', result.code);
          } else {
            alert('Failed to generate invite code');
          }
        } catch (err) {
          console.error('❌ Error generating invite code:', err);
          alert('Failed to generate invite code. Please try again.');
        } finally {
          setGeneratingCode(false);
        }
      } else {
        // Code already exists, just proceed
        setStep(3);
      }
    } else if (step === 3) {
      if (!anniversaryDate) {
        alert(t.fillAllFields);
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!petName.trim()) {
        alert(t.namePet);
        return;
      }
      
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step === 2 && hasPartner === null) {
      setStep(1);
    } else if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      // 1. Save settings
      await updateSettings({
        partners: [
          { id: user.uid, name: user.displayName || user.email?.split('@')[0] || 'You' },
          { id: 'partner', name: 'Partner' }, // Will be updated when partner joins
        ],
        relationshipStartDate: anniversaryDate,
        notificationsEnabled: false,
        onboardingCompleted: true,
        language,
      });

      // 2. Update pet name
      const petStore = usePetStore.getState();
      await petStore.updatePet({ name: petName.trim() });

      // 3. Seed challenges to localStorage (only if partnership exists)
      if (partnershipId) {
        console.log('🌱 Seeding challenges to localStorage...');
        let successCount = 0;
        
        for (const challenge of seedChallenges) {
          try {
            await addChallenge({
              ...challenge,
              createdBy: user.uid,
            });
            successCount++;
          } catch (err) {
            console.error('❌ Failed to seed challenge:', challenge.title, err);
          }
        }
        
        console.log(`✅ Seeded ${successCount}/${seedChallenges.length} challenges`);
      }

      // 4. Navigate to home
      navigate('/', { replace: true });
    } catch (err) {
      console.error('❌ Error completing onboarding:', err);
      alert('Failed to complete onboarding. Please try again.');
    }
  };

  const copyCodeToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      alert('Code copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950 dark:via-purple-950 dark:to-blue-950">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8"
          >
            {/* Language selector (only on step 1) */}
            {step === 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language / Dil / Език
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="tr">🇹🇷 Türkçe</option>
                  <option value="bg">🇧🇬 Български</option>
                </select>
              </div>
            )}

            {/* Progress indicator */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i <= step
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Do you have a partner? */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-pink-500" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'tr' ? 'Partnerin var mı?' : 'Do you have a partner?'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'tr'
                      ? 'Birlikte kullanacağınız birini seçin'
                      : 'Choose if you have someone to use the app with'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={hasPartner === true ? 'primary' : 'outline'}
                    onClick={() => setHasPartner(true)}
                    className="h-32 flex flex-col items-center justify-center gap-3"
                  >
                    <Users className="w-8 h-8" />
                    <span className="text-lg font-semibold">
                      {language === 'tr' ? 'Evet' : 'Yes'}
                    </span>
                  </Button>

                  <Button
                    variant={hasPartner === false ? 'primary' : 'outline'}
                    onClick={() => setHasPartner(false)}
                    className="h-32 flex flex-col items-center justify-center gap-3"
                  >
                    <Sparkles className="w-8 h-8" />
                    <span className="text-lg font-semibold">
                      {language === 'tr' ? 'Hayır' : 'No'}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2a: Join with partner code */}
            {step === 2 && hasPartner === true && (
              <div className="space-y-6">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'tr' ? 'Partner Kodu' : 'Partner Code'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'tr'
                      ? 'Partnerinizden aldığınız kodu girin'
                      : 'Enter the code from your partner'}
                  </p>
                </div>

                <Input
                  label={language === 'tr' ? 'Partner Kodu' : 'Partner Code'}
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                  autoFocus
                  required
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-2">
                    {language === 'tr' ? '💡 İpucu' : '💡 Tip'}
                  </p>
                  <p>
                    {language === 'tr'
                      ? 'Partner kodunu partnerinizden alın. Kod 6 karakterden oluşur.'
                      : 'Get the code from your partner. The code consists of 6 characters.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2b: Generate invite code */}
            {step === 2 && hasPartner === false && (
              <div className="space-y-6">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'tr' ? 'Davet Kodu' : 'Invite Code'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'tr'
                      ? 'Partnerinizle paylaşabileceğiniz bir kod oluşturun'
                      : 'Generate a code to share with your partner'}
                  </p>
                </div>

                {generatedCode ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-2xl p-8 border-2 border-pink-300 dark:border-pink-700">
                      <div className="text-center">
                        <div className="text-5xl font-bold tracking-widest text-pink-600 dark:text-pink-400 font-mono mb-4">
                          {generatedCode}
                        </div>
                        <Button
                          variant="outline"
                          onClick={copyCodeToClipboard}
                          className="mx-auto"
                        >
                          {language === 'tr' ? 'Kodu Kopyala' : 'Copy Code'}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-semibold mb-2">
                        {language === 'tr' ? '📤 Nasıl paylaşılır?' : '📤 How to share?'}
                      </p>
                      <p>
                        {language === 'tr'
                          ? 'Bu kodu partnerinizle paylaşın. Kod 7 gün boyunca geçerlidir.'
                          : 'Share this code with your partner. The code is valid for 7 days.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button onClick={handleNext} disabled={generatingCode} fullWidth>
                    {generatingCode
                      ? language === 'tr'
                        ? 'Kod oluşturuluyor...'
                        : 'Generating code...'
                      : language === 'tr'
                      ? 'Kod Oluştur'
                      : 'Generate Code'}
                  </Button>
                )}
              </div>
            )}

            {/* Step 3: Anniversary date */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-pink-500" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'tr' ? 'İlişki Tarihi' : 'Anniversary Date'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'tr'
                      ? 'İlişkinizin başlangıç tarihini seçin'
                      : 'When did your relationship start?'}
                  </p>
                </div>

                <Input
                  label={language === 'tr' ? 'Başlangıç Tarihi' : 'Start Date'}
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  autoFocus
                />

                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 text-sm text-pink-800 dark:text-pink-300">
                  <p>
                    {language === 'tr'
                      ? '💕 Bu tarihi takip ederek ilişkinizin ne kadar sürdüğünü görebilirsiniz.'
                      : '💕 Track how long you have been together from this date.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Pet name */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🐾</div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'tr' ? 'Evcil Hayvan' : 'Virtual Pet'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'tr'
                      ? 'Sanal evcil hayvanınıza bir isim verin'
                      : 'Name your virtual pet companion'}
                  </p>
                </div>

                <Input
                  label={language === 'tr' ? 'Evcil Hayvan İsmi' : 'Pet Name'}
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder={language === 'tr' ? 'ör. Pamuk' : 'e.g. Fluffy'}
                  required
                  autoFocus
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-sm text-purple-800 dark:text-purple-300">
                  <p>
                    {language === 'tr'
                      ? '🎮 Evcil hayvanınız, tamamladığınız görevlerle birlikte büyür ve gelişir!'
                      : '🎮 Your pet grows and evolves as you complete challenges together!'}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'tr' ? 'Geri' : 'Back'}
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
                disabled={
                  (step === 1 && hasPartner === null) ||
                  (step === 2 && hasPartner === true && !partnerCode.trim()) ||
                  (step === 2 && hasPartner === true && joiningPartner) ||
                  (step === 2 && hasPartner === false && generatingCode) ||
                  (step === 3 && !anniversaryDate) ||
                  (step === 4 && !petName.trim())
                }
              >
                {step === 2 && hasPartner === true && joiningPartner
                  ? language === 'tr'
                    ? 'Katılınıyor...'
                    : 'Joining...'
                  : step === 2 && hasPartner === false && generatingCode
                  ? language === 'tr'
                    ? 'Oluşturuluyor...'
                    : 'Generating...'
                  : step === 4
                  ? language === 'tr'
                    ? 'Başla'
                    : 'Get Started'
                  : language === 'tr'
                  ? 'İleri'
                  : 'Next'}
                {step < 4 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
