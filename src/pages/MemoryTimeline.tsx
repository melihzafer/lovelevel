/**
 * Memory Timeline Page
 * Displays relationship memories and milestones in a timeline view
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Heart, MapPin, Star, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useSync } from '../contexts/SupabaseSyncContext';
import { memoryService } from '../lib/memoryService';
import type { Memory, MemoryType } from '../types/memory';
import { MEMORY_TYPE_INFO } from '../types/memory';
import { Button } from '../components/Button';

export function MemoryTimeline() {
  const { user } = useAuth();
  const { partnership } = useSync();
  
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MemoryType | 'all'>('all');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memoryType, setMemoryType] = useState<MemoryType>('milestone');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  useEffect(() => {
    loadMemories();
  }, [partnership?.id]);

  const loadMemories = async () => {
    if (!partnership?.id) return;
    setIsLoading(true);
    const data = await memoryService.getMemories(partnership.id);
    setMemories(data);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !memoryDate || !partnership?.id || !user?.id) return;

    await memoryService.createMemory(
      partnership.id,
      user.id,
      memoryType,
      title.trim(),
      memoryDate,
      {
        description: description.trim() || undefined,
        location: location ? { name: location } : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }
    );

    resetForm();
    loadMemories();
  };

  const handleDelete = async (memoryId: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    await memoryService.deleteMemory(memoryId);
    loadMemories();
  };

  const handleToggleFavorite = async (memoryId: string) => {
    await memoryService.toggleFavorite(memoryId);
    loadMemories();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMemoryType('milestone');
    setMemoryDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setTags([]);
    setNewTag('');
    setIsCreating(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Filter and group memories
  const filteredMemories = useMemo(() => {
    let filtered = memories;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.memory_type === filterType);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.location?.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [memories, filterType, searchQuery]);

  // Group by month
  const groupedMemories = useMemo(() => {
    const groups = new Map<string, Memory[]>();
    filteredMemories.forEach(memory => {
      const date = new Date(memory.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(memory);
    });
    return groups;
  }, [filteredMemories]);

  const sortedMonths = Array.from(groupedMemories.keys()).sort().reverse();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatMonthYear = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-bg-secondary pb-20">
      {/* Header */}
      <div className="bg-bg-primary border-b border-border-color sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary-500" />
              Memories
            </h1>
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Memory
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full pl-10 pr-4 py-2 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter by type */}
          <div className="flex overflow-x-auto gap-2 pb-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              All
            </button>
            {Object.entries(MEMORY_TYPE_INFO).map(([type, info]) => (
              <button
                key={type}
                onClick={() => setFilterType(type as MemoryType)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterType === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                {info.icon} {info.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Modal */}
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
              className="w-full max-w-lg bg-bg-primary rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-border-color flex justify-between items-center">
                <h2 className="text-lg font-bold text-text-primary">New Memory</h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Type selector */}
                <div>
                  <p className="text-sm text-text-secondary mb-2">Memory Type</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(MEMORY_TYPE_INFO).map(([type, info]) => (
                      <button
                        key={type}
                        onClick={() => setMemoryType(type as MemoryType)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          memoryType === type
                            ? 'bg-primary-500 text-white'
                            : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                        }`}
                      >
                        {info.icon} {info.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Memory title..."
                  className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {/* Date */}
                <div>
                  <p className="text-sm text-text-secondary mb-1">Date</p>
                  <input
                    type="date"
                    value={memoryDate}
                    onChange={(e) => setMemoryDate(e.target.value)}
                    className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Description */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this memory..."
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />

                {/* Location */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (optional)"
                    className="w-full pl-10 pr-4 py-2 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <p className="text-sm text-text-secondary mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm flex items-center gap-1"
                      >
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-primary-800">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-1.5 bg-bg-secondary rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-1.5 bg-bg-secondary text-text-secondary rounded-lg hover:bg-bg-tertiary transition-colors text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!title.trim() || !memoryDate}
                  >
                    Save Memory
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-bg-primary rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border-color flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{MEMORY_TYPE_INFO[selectedMemory.memory_type].icon}</span>
                  <h2 className="text-lg font-bold text-text-primary">{selectedMemory.title}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleFavorite(selectedMemory.id)}
                    className={`p-2 rounded-full transition-colors ${
                      selectedMemory.is_favorite
                        ? 'text-yellow-500'
                        : 'text-text-secondary hover:text-yellow-500'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${selectedMemory.is_favorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setSelectedMemory(null)}
                    className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedMemory.date)}
                </div>

                {selectedMemory.description && (
                  <p className="text-text-primary mb-4">{selectedMemory.description}</p>
                )}

                {selectedMemory.location && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                    <MapPin className="w-4 h-4" />
                    {selectedMemory.location.name}
                  </div>
                )}

                {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedMemory.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-bg-secondary text-text-secondary rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {selectedMemory.created_by === user?.id && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        handleDelete(selectedMemory.id);
                        setSelectedMemory(null);
                      }}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Delete Memory
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8 text-text-secondary">
            Loading memories...
          </div>
        ) : sortedMonths.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">
              {searchQuery || filterType !== 'all'
                ? 'No memories found'
                : 'Start creating memories together!'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedMonths.map(monthKey => (
              <div key={monthKey}>
                {/* Month header */}
                <h2 className="text-lg font-bold text-text-primary mb-4 sticky top-16 bg-bg-secondary py-1">
                  {formatMonthYear(monthKey)}
                </h2>

                {/* Memories for this month */}
                <div className="relative pl-8 space-y-4">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-primary-200 dark:bg-primary-800" />

                  {groupedMemories.get(monthKey)?.map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-5 w-4 h-4 rounded-full ${MEMORY_TYPE_INFO[memory.memory_type].color.split(' ')[0]} border-2 border-bg-primary flex items-center justify-center`}>
                        <span className="text-xs">{MEMORY_TYPE_INFO[memory.memory_type].icon}</span>
                      </div>

                      {/* Memory card */}
                      <button
                        onClick={() => setSelectedMemory(memory)}
                        className="w-full bg-bg-primary rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-text-primary">{memory.title}</h3>
                            <p className="text-sm text-text-secondary mt-1">
                              {new Date(memory.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            {memory.description && (
                              <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                                {memory.description}
                              </p>
                            )}
                          </div>
                          {memory.is_favorite && (
                            <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemoryTimeline;