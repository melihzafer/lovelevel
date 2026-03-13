/**
 * Goals Page
 * Displays couple goals and achievements
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, Calendar, CheckCircle, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useSync } from '../contexts/SupabaseSyncContext';
import { goalsService } from '../lib/goalsService';
import type { CoupleGoal, GoalCategory, GoalStatus } from '../types/goals';
import { ACHIEVEMENTS, GOAL_SUGGESTIONS } from '../types/goals';
import { Button } from '../components/Button';

type Tab = 'goals' | 'achievements';

export function Goals() {
  const { user } = useAuth();
  const { partnership } = useSync();
  
  const [activeTab, setActiveTab] = useState<Tab>('goals');
  const [goals, setGoals] = useState<CoupleGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<GoalCategory | 'all'>('all');
  
  // New goal form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('relationship');
  const [targetDate, setTargetDate] = useState('');
  const [xpReward, setXpReward] = useState(20);

  useEffect(() => {
    loadGoals();
  }, [partnership?.id]);

  const loadGoals = async () => {
    if (!partnership?.id) return;
    setIsLoading(true);
    const data = await goalsService.getGoals(partnership.id);
    setGoals(data);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !partnership?.id || !user?.id) return;

    await goalsService.createGoal(
      partnership.id,
      user.id,
      title.trim(),
      category,
      {
        description: description.trim() || undefined,
        targetDate: targetDate || undefined,
        xpReward,
      }
    );

    resetForm();
    loadGoals();
  };

  const handleUpdateStatus = async (goalId: string, status: GoalStatus) => {
    await goalsService.updateGoalStatus(goalId, status);
    loadGoals();
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    await goalsService.deleteGoal(goalId);
    loadGoals();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('relationship');
    setTargetDate('');
    setXpReward(20);
    setIsCreating(false);
  };

  const filteredGoals = goals.filter(goal => {
    if (filterStatus !== 'all' && goal.status !== filterStatus) return false;
    if (filterCategory !== 'all' && goal.category !== filterCategory) return false;
    return true;
  });

  const categoryColors: Record<GoalCategory, string> = {
    relationship: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    experience: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    communication: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    growth: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    fun: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  const statusIcons: Record<GoalStatus, React.ReactNode> = {
    not_started: <Clock className="w-4 h-4" />,
    in_progress: <Target className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-bg-secondary pb-20">
      {/* Header */}
      <div className="bg-bg-primary border-b border-border-color sticky top-0 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-primary-500" />
            Goals & Achievements
          </h1>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
                activeTab === 'goals'
                  ? 'bg-primary-500 text-white'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-primary-500 text-white'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              Achievements
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'goals' && (
          <>
            {/* Create button */}
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full mb-4 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Goal
            </Button>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as GoalStatus | 'all')}
                className="px-3 py-1.5 bg-bg-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as GoalCategory | 'all')}
                className="px-3 py-1.5 bg-bg-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="relationship">Relationship</option>
                <option value="experience">Experience</option>
                <option value="communication">Communication</option>
                <option value="growth">Growth</option>
                <option value="fun">Fun</option>
              </select>
            </div>

            {/* Goals list */}
            {isLoading ? (
              <div className="text-center py-8 text-text-secondary">Loading...</div>
            ) : filteredGoals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto text-text-secondary mb-4" />
                <p className="text-text-secondary">
                  {filterStatus !== 'all' || filterCategory !== 'all'
                    ? 'No goals found'
                    : 'Set your first couple goal!'}
                </p>

                {/* Suggestions */}
                <div className="mt-6 space-y-2">
                  <p className="text-sm text-text-secondary">Try these:</p>
                  {GOAL_SUGGESTIONS.slice(0, 3).map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTitle(suggestion.title);
                        setCategory(suggestion.category);
                        setXpReward(suggestion.xp_reward);
                        setIsCreating(true);
                      }}
                      className="block w-full text-left p-3 bg-bg-primary rounded-xl hover:bg-bg-tertiary transition-colors"
                    >
                      <span className="text-text-primary">{suggestion.title}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${categoryColors[suggestion.category]}`}>
                        {suggestion.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-bg-primary rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-text-primary">{goal.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[goal.category]}`}>
                            {goal.category}
                          </span>
                        </div>
                        
                        {goal.description && (
                          <p className="text-sm text-text-secondary mb-2">{goal.description}</p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            {statusIcons[goal.status]}
                            {goal.status.replace('_', ' ')}
                          </span>
                          {goal.target_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(goal.target_date)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {goal.xp_reward} XP
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        {goal.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(
                              goal.id,
                              goal.status === 'not_started' ? 'in_progress' : 'completed'
                            )}
                            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-primary-500"
                          >
                            {goal.status === 'not_started' ? (
                              <Target className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-bg-primary rounded-xl p-4 text-center shadow-sm"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-text-primary text-sm">{achievement.name}</h3>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{achievement.description}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-primary-500">
                  <Star className="w-3 h-3" />
                  {achievement.xp_reward} XP
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-bg-primary rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border-color flex justify-between items-center">
                <h2 className="text-lg font-bold text-text-primary">New Goal</h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Title */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Goal title..."
                  className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {/* Description */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)..."
                  rows={2}
                  className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />

                {/* Category */}
                <div>
                  <p className="text-sm text-text-secondary mb-2">Category</p>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="relationship">Relationship</option>
                    <option value="experience">Experience</option>
                    <option value="communication">Communication</option>
                    <option value="growth">Growth</option>
                    <option value="fun">Fun</option>
                  </select>
                </div>

                {/* Target Date */}
                <div>
                  <p className="text-sm text-text-secondary mb-1">Target Date (optional)</p>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* XP Reward */}
                <div>
                  <p className="text-sm text-text-secondary mb-1">XP Reward</p>
                  <input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                    min={1}
                    max={100}
                    className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!title.trim()}>
                    Create Goal
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Goals;