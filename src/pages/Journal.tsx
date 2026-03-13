/**
 * Journal Page
 * A shared space for couples to write and reflect together
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Calendar, Lock, Trash2, Edit2, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useSync } from '../contexts/SupabaseSyncContext';
import { journalService } from '../lib/journalService';
import type { JournalEntry, JournalMood, JournalPrompt } from '../types/journal';
import { JOURNAL_PROMPTS, MOOD_EMOJIS, MOOD_COLORS } from '../types/journal';
import { Button } from '../components/Button';

export function Journal() {
  const { user } = useAuth();
  const { partnership } = useSync();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // New entry form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalMood | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt | null>(null);

  useEffect(() => {
    loadEntries();
  }, [partnership?.id, user?.id]);

  const loadEntries = async () => {
    if (!partnership?.id || !user?.id) return;
    setIsLoading(true);
    const data = await journalService.getEntries(partnership.id, user.id);
    setEntries(data);
    setIsLoading(false);
  };

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * JOURNAL_PROMPTS.length);
    setCurrentPrompt(JOURNAL_PROMPTS[randomIndex]);
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !partnership?.id || !user?.id) return;

    await journalService.createEntry(
      partnership.id,
      user.id,
      title.trim(),
      content.trim(),
      { mood, tags, isPrivate }
    );

    resetForm();
    loadEntries();
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;

    await journalService.updateEntry(editingEntry.id, {
      title: title.trim(),
      content: content.trim(),
      mood,
      tags,
      is_private: isPrivate,
    });

    resetForm();
    loadEntries();
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    await journalService.deleteEntry(entryId);
    loadEntries();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setMood(undefined);
    setTags([]);
    setNewTag('');
    setIsPrivate(false);
    setIsCreating(false);
    setEditingEntry(null);
    setCurrentPrompt(null);
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

  const startEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setTags(entry.tags || []);
    setIsPrivate(entry.is_private);
    setIsCreating(true);
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    if (selectedTag && !entry.tags?.includes(selectedTag)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!entry.title.toLowerCase().includes(query) &&
          !entry.content.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(entries.flatMap(e => e.tags || [])));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-bg-secondary pb-20">
      {/* Header */}
      <div className="bg-bg-primary border-b border-border-color sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-500" />
              Our Journal
            </h1>
            <Button
              onClick={() => {
                resetForm();
                setIsCreating(true);
                getRandomPrompt();
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-primary-500 text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
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
              className="w-full max-w-lg bg-bg-primary rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-border-color flex justify-between items-center">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* Prompt suggestion */}
              {currentPrompt && !editingEntry && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border-b border-border-color">
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium">Prompt: </span>
                    {currentPrompt.text}
                  </p>
                  <button
                    onClick={getRandomPrompt}
                    className="text-xs text-primary-500 mt-1 hover:underline"
                  >
                    Get another prompt
                  </button>
                </div>
              )}

              {/* Form */}
              <div className="p-4 space-y-4">
                {/* Title */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entry title..."
                  className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {/* Content */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={6}
                  className="w-full px-4 py-2 bg-bg-secondary rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />

                {/* Mood selector */}
                <div>
                  <p className="text-sm text-text-secondary mb-2">Mood</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(MOOD_EMOJIS).map(([moodKey, emoji]) => (
                      <button
                        key={moodKey}
                        onClick={() => setMood(mood === moodKey ? undefined : moodKey as JournalMood)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                          mood === moodKey
                            ? 'ring-2 ring-primary-500 ring-offset-2'
                            : ''
                        } ${MOOD_COLORS[moodKey as JournalMood]}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <p className="text-sm text-text-secondary mb-2">Tags</p>
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

                {/* Privacy toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-500"
                  />
                  <Lock className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-secondary">Keep private (only you can see)</span>
                </label>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingEntry ? handleUpdate : handleCreate}
                    disabled={!title.trim() || !content.trim()}
                  >
                    {editingEntry ? 'Update' : 'Save'} Entry
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries list */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-text-secondary">
            Loading entries...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">
              {searchQuery || selectedTag
                ? 'No entries found'
                : 'Start your journal together!'}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <motion.article
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-primary rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Entry header */}
              <div className="p-4 border-b border-border-color">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-text-primary text-lg">{entry.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                      <Calendar className="w-3 h-3" />
                      {formatDate(entry.created_at)} at {formatTime(entry.created_at)}
                      {entry.is_private && (
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                  {mood && MOOD_EMOJIS[entry.mood!] && (
                    <span className="text-2xl">{MOOD_EMOJIS[entry.mood!]}</span>
                  )}
                </div>
              </div>

              {/* Entry content */}
              <div className="p-4">
                <p className="text-text-primary whitespace-pre-wrap">{entry.content}</p>
              </div>

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1">
                  {entry.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-bg-secondary text-text-secondary rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              {entry.author_id === user?.id && (
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => startEdit(entry)}
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
}

export default Journal;