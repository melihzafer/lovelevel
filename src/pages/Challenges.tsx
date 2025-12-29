import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import { useChallengesStore } from '../store';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useTranslation } from '../lib/i18n';
import { syncManager } from '../lib/syncManager';
import { AnimatedBackground } from '../components/layout/AnimatedBackground';
import type { Challenge } from '../types/database';
import { 
  Trophy, 
  Home, 
  TreePine, 
  Palette, 
  Wallet, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Clock, 
  Plus,
  Filter
} from 'lucide-react';

export default function ChallengesPage() {
  const { t } = useTranslation();
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
      
      // Queue for Supabase sync (when partnership exists)
      const challenge = challenges.find(c => c.id === completingChallenge.id);
      if (challenge) {
        await syncManager.queueSync('challenge', 'update', challenge);
      }
      
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
    
    // Queue for Supabase sync (when partnership exists)
    await syncManager.queueSync('challenge', 'add', newChallenge);
    
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

  const categories = [
    { id: 'at-home', label: t.atHome, icon: Home, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { id: 'outdoors', label: t.outdoors, icon: TreePine, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
    { id: 'creative', label: t.creative, icon: Palette, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
    { id: 'budget-friendly', label: t.budgetFriendly, icon: Wallet, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    { id: 'custom', label: t.custom, icon: Sparkles, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
  ];

  const getCategoryIcon = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.icon : Sparkles;
  };

  const getCategoryColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.color : 'text-gray-500 bg-gray-50 dark:bg-gray-800';
  };

  return (
    <div className="min-h-screen bg-bg-secondary dark:bg-bg-primary p-4 pb-32 sm:p-6 relative overflow-hidden transition-colors duration-500">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.challenges}</h1>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto shadow-lg shadow-primary-500/20">
            <Plus className="w-5 h-5 mr-2" />
            {t.addCustomChallenge}
          </Button>
        </div>

        {/* Premium Control Bar */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-white/20 ring-1 ring-black/5 flex flex-col md:flex-row gap-4 sticky top-4 z-40 transition-all duration-300">
          
          {/* Filter Pills */}
          <div className="flex p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {(['all', 'active', 'completed'] as const).map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                   filter === f
                     ? 'text-primary-600 dark:text-primary-400 shadow-md transform scale-100' // active text
                     : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                 }`}
               >
                 {filter === f && (
                   <motion.div
                     layoutId="filter-pill"
                     className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl"
                     initial={false}
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                   />
                 )}
                 <span className="relative z-10 capitalize">
                   {f === 'all' ? t.allChallenges : f === 'completed' ? t.completedChallenges : t.activeChallenges}
                 </span>
               </button>
            ))}
          </div>

          {/* Search & Category */}
          <div className="flex flex-col sm:flex-row flex-1 gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder={`${t.search}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-transparent bg-gray-100/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all shadow-inner"
              />
            </div>
            
            <div className="relative sm:w-48 group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-2xl border border-transparent bg-gray-100/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all shadow-inner appearance-none cursor-pointer"
              >
                <option value="all">{t.allCategories || 'All Categories'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
               </div>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {filteredChallenges.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-24 px-4 rounded-3xl border-2 border-dashed border-gray-200/50 dark:border-gray-800/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm text-center"
            >
              <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center text-primary-400 dark:text-primary-500 shadow-xl shadow-primary-500/10">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {challenges.length === 0 ? 'Start Your Journey!' : 'No matches found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {challenges.length === 0 
                  ? 'Add your first challenge to begin tracking your relationship adventures together.' 
                  : 'Try adjusting your filters or search terms to find what you are looking for.'}
              </p>
            </motion.div>
          )}

          <AnimatePresence>
          {filteredChallenges.map((challenge, index) => {
             const CategoryIcon = getCategoryIcon(challenge.category);
             const isCompleted = !!challenge.completedAt;
             
             return (
              <motion.div
                key={challenge.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`group relative flex flex-col rounded-3xl p-6 transition-all duration-300 isolate ${
                  isCompleted 
                    ? 'bg-gray-50/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-800/50 opacity-90 grayscale-[0.3]' 
                    : 'bg-white/80 dark:bg-gray-900/80 hover:bg-white/95 dark:hover:bg-gray-900/95 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 border-white/40 dark:border-gray-700/40'
                } backdrop-blur-md shadow-lg border ring-1 ring-black/5`}
              >
                 {/* Spotlight Gradient */}
                 <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300 rounded-3xl bg-gradient-to-br ${challenge.category === 'custom' ? 'from-pink-500 to-purple-500' : 'from-primary-500 to-accent-500'} pointer-events-none -z-10`} />

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className={`p-3.5 rounded-2xl shrink-0 shadow-sm ${getCategoryColor(challenge.category)} bg-opacity-20 dark:bg-opacity-20 ring-1 ring-black/5`}>
                    <CategoryIcon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  
                  {isCompleted && (
                    <div className="bg-green-100/80 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0 backdrop-blur-sm border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      DONE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                   <div>
                        <span className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-1 block">
                            {challenge.category}
                        </span>
                        <h3 className={`text-xl font-bold text-gray-900 dark:text-white leading-snug transition-colors ${
                          isCompleted ? 'text-gray-500 dark:text-gray-500 line-through decoration-2 decoration-gray-300 dark:decoration-gray-700' : 'group-hover:text-primary-600 dark:group-hover:text-primary-400'
                        }`}>
                          {challenge.title}
                        </h3>
                   </div>
                   
                   <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                      {challenge.description}
                   </p>

                   {/* Metadata Tags */}
                   <div className="flex flex-wrap gap-2 pt-2">
                      {challenge.estimate?.minutes && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                           <Clock className="w-3 h-3" />
                           {challenge.estimate.minutes}m
                        </span>
                      )}
                      {challenge.estimate?.costUSD !== undefined && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300">
                           <Wallet className="w-3 h-3" />
                           {challenge.estimate.costUSD === 0 ? t.free : `$${challenge.estimate.costUSD}`}
                        </span>
                      )}
                      {challenge.tags.slice(0, 2).map((tag) => (
                           <span key={tag} className="text-xs px-2 py-1 rounded-md bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                               #{tag}
                           </span>
                      ))}
                   </div>
                </div>

                {/* Footer / Actions */}
                {!isCompleted ? (
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/50 flex justify-end">
                    <Button 
                      onClick={() => handleCompleteClick(challenge)} 
                      variant="ghost"
                      className="text-sm font-semibold hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t.complete}
                    </Button>
                  </div>
                ) : (
                    challenge.notes && (
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800 text-sm text-gray-500 italic bg-gray-50/50 dark:bg-gray-800/30 -mx-6 -mb-6 px-6 py-4 rounded-b-3xl">
                           "{challenge.notes}"
                      </div>
                    )
                )}
              </motion.div>
            );
          })}
          </AnimatePresence>
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
                className="w-full px-4 py-2 border border-primary-600 rounded-lg bg-white text-primary-300 placeholder:text-primary-300 dark:placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
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
              className="w-full px-4 py-2 border border-primary-600 rounded-lg bg-white text-primary-300 placeholder:text-primary-300 dark:placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              {t.tagsOptional}
            </label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder={t.tagsPlaceholder}
                className="flex-1 min-h-[44px]"
              />
              <Button
                onClick={handleAddTag}
                variant="outline"
                disabled={!tagInput.trim()}
                className="min-h-[44px] px-4"
              >
                {t.add}
              </Button>
            </div>
            {newChallengeTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newChallengeTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
