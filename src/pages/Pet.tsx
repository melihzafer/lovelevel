import { motion } from 'framer-motion';
import { usePetStore, useLevelInfo } from '../store';
import { useTranslation } from '../lib/i18n';

export default function PetPage() {
  const t = useTranslation();
  const pet = usePetStore();
  const levelInfo = useLevelInfo();
  const petName = pet.name || 'Your Pet';

  const handleTap = () => {
    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  if (!levelInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-primary-50 dark:from-accent-950 dark:via-gray-900 dark:to-primary-950 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Pet Name & Level */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">{petName}</h1>
          <div className="inline-block px-4 py-1 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 font-medium">
            {t.petLevel} {pet.level}
          </div>
        </div>

        {/* Pet Visual */}
        <motion.div
          onClick={handleTap}
          whileTap={{ scale: 0.95 }}
          className="relative mx-auto w-64 h-64 flex items-center justify-center cursor-pointer"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-9xl select-none"
          >
            🐾
          </motion.div>

          {/* Mood indicator */}
          <div className="absolute bottom-0 right-0 text-4xl">
            {pet.mood === 'happy' && '😊'}
            {pet.mood === 'chill' && '😎'}
            {pet.mood === 'sleepy' && '😴'}
          </div>
        </motion.div>

        {/* XP Progress */}
        <div className="bg-bg-primary rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{t.xpProgress}</span>
            <span className="font-medium text-text-primary">
              {levelInfo.currentXP} / {levelInfo.xpForNextLevel}
            </span>
          </div>

          <div className="relative h-4 bg-primary-100 dark:bg-primary-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.xpProgressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
            />
          </div>

          <p className="text-xs text-text-secondary text-center">
            {levelInfo.xpForNextLevel - levelInfo.currentXP} {t.xpUntilLevel} {pet.level + 1}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-primary rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">❤️</div>
            <div className="text-2xl font-bold text-text-primary">{pet.hunger}</div>
            <div className="text-xs text-text-secondary">{t.happiness}</div>
          </div>

          <div className="bg-bg-primary rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-text-primary">{pet.energy}</div>
            <div className="text-xs text-text-secondary">{t.energy}</div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-accent-50 dark:bg-accent-900/30 rounded-xl p-4 text-sm text-text-secondary">
          <p className="font-medium text-text-primary mb-2">{t.levelUpTips}</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>{t.levelUpTip1}</li>
            <li>{t.levelUpTip2}</li>
            <li>{t.levelUpTip3}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
