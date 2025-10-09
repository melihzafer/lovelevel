import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import { useChallengesStore } from '../store';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useTranslation } from '../lib/i18n';
import type { Challenge } from '../types/database';

export default function ChallengesPage() {
  const t = useTranslation();
  const challenges = useChallengesStore((state) => state.challenges);
  const addChallenge = useChallengesStore((state) => state.addChallenge);
  const completeChallenge = useChallengesStore((state) => state.completeChallenge);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add custom challenge modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDescription, setNewChallengeDescription] = useState('');
  const [newChallengeTags, setNewChallengeTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Complete challenge modal
  const [completingChallenge, setCompletingChallenge] = useState<Challenge | null>(null);
  const [notes, setNotes] = useState('');

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      // Status filter
      if (filter === 'active' && c.completedAt) return false;
      if (filter === 'completed' && !c.completedAt) return false;

      // Category filter
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(query) ||
          (c.description?.toLowerCase().includes(query) ?? false) ||
          c.tags.some((t) => t.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [challenges, filter, categoryFilter, searchQuery]);

  const handleCompleteClick = (challenge: Challenge) => {
    setCompletingChallenge(challenge);
    setNotes('');
  };

  const handleCompleteSubmit = async () => {
    if (completingChallenge) {
      await completeChallenge(completingChallenge.id, notes.trim() || undefined);
      setCompletingChallenge(null);
      setNotes('');
    }
  };

  const handleAddChallenge = async () => {
    if (!newChallengeTitle.trim()) return;

    const newChallenge: Challenge = {
      id: nanoid(),
      title: newChallengeTitle.trim(),
      description: newChallengeDescription.trim() || undefined,
      category: 'custom',
      tags: newChallengeTags.length > 0 ? newChallengeTags : ['custom'],
      createdAt: new Date().toISOString(),
    };

    await addChallenge(newChallenge);
    setShowAddModal(false);
    setNewChallengeTitle('');
    setNewChallengeDescription('');
    setNewChallengeTags([]);
    setTagInput('');
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !newChallengeTags.includes(tag)) {
      setNewChallengeTags([...newChallengeTags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewChallengeTags(newChallengeTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const categories = ['at-home', 'outdoors', 'creative', 'budget-friendly', 'custom'];

  return (
    <div className="min-h-screen bg-bg-secondary p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t.challenges}</h1>
          <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto min-h-[44px]">
            + {t.addCustomChallenge}
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-bg-primary rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                  filter === f
                    ? 'bg-primary-500 text-white'
                    : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50'
                }`}
              >
                {f === 'all' ? t.allChallenges : f === 'completed' ? t.completedChallenges : t.activeChallenges}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary min-h-[44px] w-full sm:w-auto"
            >
              <option value="all">{t.allChallenges}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'at-home' ? t.atHome : 
                   cat === 'outdoors' ? t.outdoors : 
                   cat === 'creative' ? t.creative : 
                   cat === 'budget-friendly' ? t.budgetFriendly : t.custom}
                </option>
              ))}
            </select>

            <Input
              type="search"
              placeholder={`${t.challenges}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 min-h-[44px]"
            />
          </div>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          {filteredChallenges.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              {challenges.length === 0 ? 'No challenges yet!' : 'No challenges match your filters'}
            </div>
          )}

          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-bg-primary rounded-xl p-4 sm:p-6 shadow ${
                challenge.completedAt ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 space-y-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary break-words">
                      {challenge.completedAt && '✅ '}
                      {challenge.title}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 whitespace-nowrap">
                      {challenge.category
                        .split('-')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </span>
                  </div>

                  <p className="text-text-secondary text-sm break-words">{challenge.description}</p>

                  {challenge.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {challenge.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {challenge.estimate && (
                    <div className="text-xs text-text-secondary flex gap-4">
                      {challenge.estimate.minutes && <span>⏱️ {challenge.estimate.minutes} min</span>}
                      {challenge.estimate.costUSD !== undefined && (
                        <span>
                          💰 {challenge.estimate.costUSD === 0 ? t.free : `$${challenge.estimate.costUSD}`}
                        </span>
                      )}
                    </div>
                  )}

                  {challenge.completedAt && (
                    <div className="text-xs text-text-secondary">
                      {t.completedOn} {new Date(challenge.completedAt).toLocaleDateString()}
                      {challenge.notes && <p className="mt-1 italic">"{challenge.notes}"</p>}
                    </div>
                  )}
                </div>

                {!challenge.completedAt && (
                  <Button onClick={() => handleCompleteClick(challenge)} className="w-full sm:w-auto min-h-[44px] mt-2 sm:mt-0">
                    {t.complete}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Complete Challenge Modal */}
      <Modal
        isOpen={!!completingChallenge}
        onClose={() => setCompletingChallenge(null)}
        title={t.completeChallenge}
      >
        {completingChallenge && (
          <div className="space-y-4">
            <p className="text-text-primary font-medium break-words">{completingChallenge.title}</p>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                {t.addNote}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={4}
                className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setCompletingChallenge(null)} variant="outline" className="flex-1 min-h-[44px]">
                {t.cancel}
              </Button>
              <Button onClick={handleCompleteSubmit} className="flex-1 min-h-[44px]">
                {t.markComplete}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Custom Challenge Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t.addCustomChallenge}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              {t.challengeTitle}
            </label>
            <Input
              value={newChallengeTitle}
              onChange={(e) => setNewChallengeTitle(e.target.value)}
              placeholder={t.challengeTitle}
              autoFocus
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              {t.challengeDescription}
            </label>
            <textarea
              value={newChallengeDescription}
              onChange={(e) => setNewChallengeDescription(e.target.value)}
              placeholder={t.challengeDescription}
              rows={3}
              className="w-full px-4 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1 min-h-[44px]">
              {t.cancel}
            </Button>
            <Button onClick={handleAddChallenge} disabled={!newChallengeTitle.trim()} className="flex-1 min-h-[44px]">
              {t.addChallenge}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
