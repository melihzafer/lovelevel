import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getHistory } from '../lib/db';
import { useTranslation } from '../lib/i18n';
import type { HistoryEntry } from '../types/database';

export default function HistoryPage() {
  const t = useTranslation();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then((entries) => {
      setHistory(entries);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">{t.history}</h1>

        {history.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <div className="text-6xl mb-4">📖</div>
            <p>{t.noHistory}</p>
            <p className="text-sm mt-2">{t.noHistoryDesc}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-4">
          {history.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-bg-primary rounded-xl p-6 shadow relative"
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/50 dark:to-accent-900/50 flex items-center justify-center text-2xl">
                  {entry.type === 'challenge-completed' && '✨'}
                  {entry.type === 'level-up' && '⬆️'}
                  {entry.type === 'monthiversary' && '💕'}
                  {entry.type === 'item-unlocked' && '�'}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-text-primary">
                      {entry.type === 'challenge-completed' && `Challenge: ${(entry.data.title as string) || 'Completed'}`}
                      {entry.type === 'level-up' && `Level Up! Reached Level ${entry.data.level as number}`}
                      {entry.type === 'monthiversary' && `${entry.data.months as number} Month Anniversary 💕`}
                      {entry.type === 'item-unlocked' && `Unlocked: ${(entry.data.itemName as string) || 'New Item'}`}
                    </h3>
                    <time className="text-xs text-text-secondary flex-shrink-0">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>

                  {(entry.data as { xp?: number }).xp && (
                    <div className="text-xs text-text-secondary space-y-1 mt-2">
                      <div className="inline-block px-2 py-1 rounded bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                        +{(entry.data as { xp: number }).xp} XP
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
