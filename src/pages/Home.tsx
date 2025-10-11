import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDateStats, useSettingsStore } from '../store';
import { Confetti } from '../components/Confetti';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { useTranslation } from '../lib/i18n';

export default function HomePage() {
  const t = useTranslation();
  const dateStats = useDateStats();
  const { settings } = useSettingsStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownTodayCelebration, setHasShownTodayCelebration] = useState(false);

  // Get partner names from settings
  const partner1Name = settings.partners[0]?.name || t.partner1 || 'Partner 1';
  const partner2Name = settings.partners[1]?.name || t.partner2 || 'Partner 2';
  
  // Show greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning || 'Good Morning';
    if (hour < 18) return t.goodAfternoon || 'Good Afternoon';
    return t.goodEvening || 'Good Evening';
  };

  useEffect(() => {
    // Check if we should show celebration on load
    if (dateStats?.isMonthiversaryToday && !hasShownTodayCelebration) {
      setShowCelebration(true);
      setHasShownTodayCelebration(true);
    }
  }, [dateStats?.isMonthiversaryToday, hasShownTodayCelebration]);

  useEffect(() => {
    // Update counter at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      window.location.reload();
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    if (navigator.share && dateStats) {
      try {
        await navigator.share({
          title: 'Love Level',
          text: `We've been together for ${dateStats.daysTogether} days! 💕`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  if (!dateStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-950 dark:via-gray-900 dark:to-accent-950 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-2">
            {getGreeting()}! 👋
          </h1>
          <p className="text-base sm:text-lg text-text-secondary">
            {partner1Name} & {partner2Name}
          </p>
        </motion.div>

        {/* Hero Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 sm:space-y-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative inline-block"
          >
            <div className="text-6xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
              {dateStats.daysTogether}
            </div>
            <motion.div
              className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-primary-200 to-accent-200 dark:from-primary-800 dark:to-accent-800 rounded-full opacity-20 blur-xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          <h2 className="text-xl sm:text-2xl font-medium text-text-primary">{t.daysTogether}</h2>

          <div className="flex items-center justify-center gap-4 sm:gap-6 text-text-secondary">
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-primary-600 dark:text-primary-400">
                {dateStats.monthsTogether}
              </div>
              <div className="text-xs sm:text-sm">{t.months}</div>
            </div>
            {dateStats.yearsTogether > 0 && (
              <div>
                <div className="text-2xl sm:text-3xl font-semibold text-accent-600 dark:text-accent-400">
                  {dateStats.yearsTogether}
                </div>
                <div className="text-xs sm:text-sm">{t.years}</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Next Milestone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-primary rounded-2xl p-4 sm:p-6 shadow-lg"
        >
          <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">{t.nextMilestone}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm sm:text-base text-text-secondary break-words">
                {dateStats.nextMilestone.type === 'years'
                  ? `${dateStats.nextMilestone.value} ${t.yearAnniversary}`
                  : `${dateStats.nextMilestone.value} ${t.monthsTogether}`}
              </span>
              <span className="font-medium text-primary-600 dark:text-primary-400 text-sm sm:text-base whitespace-nowrap">
                {dateStats.nextMilestone.daysUntil === 0
                  ? t.today
                  : dateStats.nextMilestone.daysUntil === 1
                    ? t.tomorrow
                    : `${dateStats.nextMilestone.daysUntil} ${t.daysAway}`}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-text-secondary break-words">
              {new Date(dateStats.nextMilestone.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </motion.div>

        {/* Next Monthiversary */}
        {dateStats.nextMonthiversary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900/30 dark:to-primary-900/30 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-text-primary">{t.nextMonthiversary}</h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 break-words">
                  {new Date(dateStats.nextMonthiversary).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-3xl sm:text-4xl flex-shrink-0">💕</div>
            </div>
          </motion.div>
        )}

        {/* Share Button */}
        {'share' in navigator && (
          <Button onClick={handleShare} variant="outline" fullWidth className="min-h-[44px]">
            {t.shareJourney}
          </Button>
        )}
      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <>
            <Confetti />
            <Modal isOpen={showCelebration} onClose={() => setShowCelebration(false)} title="🎉 Happy Monthiversary!">
              <div className="text-center space-y-4">
                <div className="text-5xl sm:text-6xl animate-bounce-gentle">💕</div>
                <p className="text-base sm:text-lg text-text-primary break-words">
                  Congratulations on {dateStats.monthsTogether} month{dateStats.monthsTogether !== 1 ? 's' : ''}{' '}
                  together!
                </p>
                <p className="text-sm sm:text-base text-text-secondary">
                  That's {dateStats.daysTogether} amazing days with each other!
                </p>
                <Button onClick={() => setShowCelebration(false)} fullWidth className="min-h-[44px]">
                  Celebrate! 🎊
                </Button>
              </div>
            </Modal>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
