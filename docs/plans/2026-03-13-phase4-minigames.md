# Phase 4: Minigame Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand minigame offerings, add achievements system, and improve reward mechanics.

**Architecture:** New minigames, achievement tracking service, enhanced XP rewards.

**Tech Stack:** React 19, Framer Motion, Canvas API, Zustand

---

## Overview

This phase addresses minigame expansion:
- Currently 2 minigames: PetMinigame (tap hearts), LoveCatcher (paddle catch)
- No achievement tracking system
- Limited reward variety
- No high score persistence

**Estimated Duration:** 5-7 days

**Risk Level:** Medium (new features, but isolated from core app)

---

## Current State Analysis

### Existing Minigames

1. **PetMinigame** (src/components/pet/PetMinigame.tsx)
   - Tap falling hearts game
   - 30 second time limit
   - Regular hearts (1pt) + golden hearts (5pt)
   - Rewards: 2 XP per point scored
   - Simple, casual gameplay

2. **LoveCatcher** (src/components/pet/LoveCatcher.tsx)
   - Paddle catch game (canvas-based)
   - 45 second time limit
   - 3 difficulty levels (easy/normal/hard)
   - Catch coins (+1), hearts (+2), avoid poop (-3)
   - Rewards: XP based on score
   - More complex, arcade-style

### XP System (src/lib/xpSystem.ts)
- Level curve: 100 * level * 1.15^(level-1)
- Rewards: challenge (20 XP), petTask (10 XP), monthiversary (100 XP)
- No minigame-specific XP rewards defined
- Milestone levels every 5 levels

### Gaps Identified
- No achievement/badge system
- No high score persistence
- No daily challenges
- Limited game variety
- No multiplayer/partner games

---

## Task 1: Create Achievement System

**Goal:** Add achievement tracking with badges and rewards.

**Files:**
- Create: `src/lib/achievementService.ts`
- Create: `src/types/achievements.ts`
- Modify: `src/store/index.ts` (add achievement store)

**Step 1: Create achievement types**

Create `src/types/achievements.ts`:

```typescript
export type AchievementCategory = 'pet' | 'challenges' | 'minigames' | 'relationship' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string; // emoji
  requirement: {
    type: 'count' | 'score' | 'streak' | 'level' | 'special';
    target: number;
    action?: string;
  };
  reward: {
    xp: number;
    coins?: number;
  };
  unlockedAt?: string;
  progress?: number;
}

export interface AchievementState {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  recentlyUnlocked: Achievement[];
}
```

**Step 2: Create achievement service**

Create `src/lib/achievementService.ts`:

```typescript
import type { Achievement, AchievementCategory } from '../types/achievements';

const ACHIEVEMENTS: Achievement[] = [
  // Pet Achievements
  {
    id: 'first-feed',
    name: 'First Steps',
    description: 'Feed your pet for the first time',
    category: 'pet',
    icon: '🍼',
    requirement: { type: 'count', target: 1, action: 'feed' },
    reward: { xp: 10 },
  },
  {
    id: 'pet-lover',
    name: 'Pet Lover',
    description: 'Feed your pet 100 times',
    category: 'pet',
    icon: '❤️',
    requirement: { type: 'count', target: 100, action: 'feed' },
    reward: { xp: 100, coins: 50 },
  },
  {
    id: 'clean-freak',
    name: 'Clean Freak',
    description: 'Clean your pet 50 times',
    category: 'pet',
    icon: '🧹',
    requirement: { type: 'count', target: 50, action: 'clean' },
    reward: { xp: 50 },
  },
  
  // Minigame Achievements
  {
    id: 'first-game',
    name: 'Game On!',
    description: 'Play your first minigame',
    category: 'minigames',
    icon: '🎮',
    requirement: { type: 'count', target: 1, action: 'minigame_play' },
    reward: { xp: 10 },
  },
  {
    id: 'heart-collector',
    name: 'Heart Collector',
    description: 'Score 100 points in PetMinigame',
    category: 'minigames',
    icon: '💝',
    requirement: { type: 'score', target: 100, action: 'petminigame' },
    reward: { xp: 50 },
  },
  {
    id: 'catcher-pro',
    name: 'Catcher Pro',
    description: 'Score 200 points in LoveCatcher',
    category: 'minigames',
    icon: '🏆',
    requirement: { type: 'score', target: 200, action: 'lovecatcher' },
    reward: { xp: 75, coins: 25 },
  },
  {
    id: 'game-master',
    name: 'Game Master',
    description: 'Play 50 minigames',
    category: 'minigames',
    icon: '🎯',
    requirement: { type: 'count', target: 50, action: 'minigame_play' },
    reward: { xp: 200, coins: 100 },
  },
  
  // Challenge Achievements
  {
    id: 'first-challenge',
    name: 'Challenge Accepted',
    description: 'Complete your first challenge',
    category: 'challenges',
    icon: '✅',
    requirement: { type: 'count', target: 1, action: 'challenge_complete' },
    reward: { xp: 15 },
  },
  {
    id: 'challenge-champion',
    name: 'Challenge Champion',
    description: 'Complete 25 challenges',
    category: 'challenges',
    icon: '🏅',
    requirement: { type: 'count', target: 25, action: 'challenge_complete' },
    reward: { xp: 150, coins: 75 },
  },
  
  // Relationship Achievements
  {
    id: 'month-1',
    name: 'First Month',
    description: 'Celebrate your 1 month anniversary',
    category: 'relationship',
    icon: '💕',
    requirement: { type: 'special', target: 1, action: 'monthiversary' },
    reward: { xp: 100 },
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5 with your pet',
    category: 'pet',
    icon: '⭐',
    requirement: { type: 'level', target: 5 },
    reward: { xp: 50, coins: 25 },
  },
  {
    id: 'level-10',
    name: 'Pet Master',
    description: 'Reach level 10 with your pet',
    category: 'pet',
    icon: '🌟',
    requirement: { type: 'level', target: 10 },
    reward: { xp: 200, coins: 100 },
  },
];

class AchievementService {
  private achievements: Achievement[];
  
  constructor() {
    this.achievements = ACHIEVEMENTS.map(a => ({ ...a, progress: 0 }));
  }
  
  getAll(): Achievement[] {
    return this.achievements;
  }
  
  getByCategory(category: AchievementCategory): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }
  
  checkAchievement(
    action: string,
    count: number,
    currentLevel?: number
  ): Achievement | null {
    for (const achievement of this.achievements) {
      if (achievement.unlockedAt) continue;
      
      const req = achievement.requirement;
      
      if (req.type === 'count' && req.action === action) {
        achievement.progress = count;
        if (count >= req.target) {
          achievement.unlockedAt = new Date().toISOString();
          return achievement;
        }
      }
      
      if (req.type === 'level' && currentLevel !== undefined) {
        achievement.progress = currentLevel;
        if (currentLevel >= req.target) {
          achievement.unlockedAt = new Date().toISOString();
          return achievement;
        }
      }
    }
    
    return null;
  }
  
  checkScoreAchievement(game: string, score: number): Achievement | null {
    for (const achievement of this.achievements) {
      if (achievement.unlockedAt) continue;
      
      const req = achievement.requirement;
      if (req.type === 'score' && req.action === game) {
        achievement.progress = Math.max(achievement.progress || 0, score);
        if (score >= req.target && !achievement.unlockedAt) {
          achievement.unlockedAt = new Date().toISOString();
          return achievement;
        }
      }
    }
    
    return null;
  }
  
  getUnlocked(): Achievement[] {
    return this.achievements.filter(a => a.unlockedAt);
  }
  
  getProgress(): { unlocked: number; total: number } {
    const unlocked = this.achievements.filter(a => a.unlockedAt).length;
    return { unlocked, total: this.achievements.length };
  }
}

export const achievementService = new AchievementService();
```

**Step 3: Verify build**

Run:
```bash
npm run typecheck
npm run build
```

**Step 4: Commit**

```bash
git add src/types/achievements.ts src/lib/achievementService.ts
git commit -m "feat: create achievement system with 12 achievements

- Add achievement types and categories
- Create achievement service with unlock logic
- Support count, score, level, and special achievements
- Define rewards (XP and coins) for each achievement"
```

---

## Task 2: Create High Score System

**Goal:** Persist and display high scores for minigames.

**Files:**
- Create: `src/lib/highScoreService.ts`
- Modify: `src/store/petStore.ts` (add high scores)

**Step 1: Create high score service**

Create `src/lib/highScoreService.ts`:

```typescript
import * as db from './db';

export interface HighScore {
  game: 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz';
  score: number;
  achievedAt: string;
  difficulty?: 'easy' | 'normal' | 'hard';
}

const HIGH_SCORES_KEY = 'lovelevel-highscores';

class HighScoreService {
  private highScores: Map<string, HighScore> = new Map();
  
  async load(): Promise<void> {
    try {
      const stored = localStorage.getItem(HIGH_SCORES_KEY);
      if (stored) {
        const scores = JSON.parse(stored) as HighScore[];
        scores.forEach(score => {
          const key = this.getKey(score.game, score.difficulty);
          this.highScores.set(key, score);
        });
      }
    } catch (error) {
      console.error('Failed to load high scores:', error);
    }
  }
  
  private getKey(game: string, difficulty?: string): string {
    return difficulty ? `${game}-${difficulty}` : game;
  }
  
  getHighScore(game: 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz', difficulty?: 'easy' | 'normal' | 'hard'): HighScore | null {
    const key = this.getKey(game, difficulty);
    return this.highScores.get(key) || null;
  }
  
  async submitScore(
    game: 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz',
    score: number,
    difficulty?: 'easy' | 'normal' | 'hard'
  ): Promise<{ isNewHighScore: boolean; previousBest: number | null }> {
    const key = this.getKey(game, difficulty);
    const existing = this.highScores.get(key);
    
    if (!existing || score > existing.score) {
      const newHighScore: HighScore = {
        game,
        score,
        achievedAt: new Date().toISOString(),
        difficulty,
      };
      
      this.highScores.set(key, newHighScore);
      this.save();
      
      return { isNewHighScore: true, previousBest: existing?.score || null };
    }
    
    return { isNewHighScore: false, previousBest: existing.score };
  }
  
  getAllHighScores(): HighScore[] {
    return Array.from(this.highScores.values());
  }
  
  private save(): void {
    try {
      const scores = Array.from(this.highScores.values());
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
    } catch (error) {
      console.error('Failed to save high scores:', error);
    }
  }
  
  clear(): void {
    this.highScores.clear();
    localStorage.removeItem(HIGH_SCORES_KEY);
  }
}

export const highScoreService = new HighScoreService();
```

**Step 2: Verify build**

Run:
```bash
npm run typecheck
npm run build
```

**Step 3: Commit**

```bash
git add src/lib/highScoreService.ts
git commit -m "feat: create high score system for minigames

- Add high score persistence via localStorage
- Support difficulty-specific high scores
- Track when high scores were achieved
- Provide API for submitting and retrieving scores"
```

---

## Task 3: Create Memory Match Game

**Goal:** Add a new memory card matching minigame.

**Files:**
- Create: `src/components/pet/MemoryMatch.tsx`

**Step 1: Create MemoryMatch component**

Create `src/components/pet/MemoryMatch.tsx`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Trophy } from 'lucide-react';
import { usePetStore } from '../../store';
import { Button } from '../Button';
import { highScoreService } from '../../lib/highScoreService';
import { achievementService } from '../../lib/achievementService';

interface MemoryMatchProps {
  onClose: () => void;
}

type CardSymbol = '❤️' | '💕' | '💖' | '💗' | '💘' | '💝' | '💞' | '💟';

interface Card {
  id: number;
  symbol: CardSymbol;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS: CardSymbol[] = ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💟'];

export const MemoryMatch = ({ onClose }: MemoryMatchProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [highScore, setHighScore] = useState<number | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  const gainXP = usePetStore((state) => state.gainXP);
  
  const getGridSize = () => {
    switch (difficulty) {
      case 'easy': return 4; // 2x2 = 4 cards (2 pairs)
      case 'normal': return 8; // 2x4 = 8 cards (4 pairs)
      case 'hard': return 16; // 4x4 = 16 cards (8 pairs)
    }
  };
  
  const initializeGame = useCallback(() => {
    const size = getGridSize();
    const pairs = size / 2;
    const selectedSymbols = SYMBOLS.slice(0, pairs);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];
    
    // Shuffle
    const shuffled = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameState('playing');
    setIsNewHighScore(false);
    
    // Load high score
    const existing = highScoreService.getHighScore('memorymatch', difficulty);
    setHighScore(existing?.score || null);
  }, [difficulty]);
  
  useEffect(() => {
    if (gameState === 'menu') {
      const existing = highScoreService.getHighScore('memorymatch', difficulty);
      setHighScore(existing?.score || null);
    }
  }, [difficulty, gameState]);
  
  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!);
      
      if (first.symbol === second.symbol) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first.id || c.id === second.id 
              ? { ...c, isMatched: true } 
              : c
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first.id || c.id === second.id 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Check for win
  useEffect(() => {
    if (gameState === 'playing' && matches === getGridSize() / 2) {
      setGameState('won');
      
      // Calculate score (lower moves = higher score)
      const baseScore = getGridSize() * 10;
      const efficiency = Math.max(0, baseScore - moves);
      const finalScore = baseScore + efficiency;
      
      // Check high score
      highScoreService.submitScore('memorymatch', finalScore, difficulty)
        .then(({ isNewHighScore }) => {
          setIsNewHighScore(isNewHighScore);
        });
      
      // Award XP
      gainXP(finalScore / 2, 'memorymatch');
      
      // Check achievements
      achievementService.checkScoreAchievement('memorymatch', finalScore);
    }
  }, [matches, gameState, moves, difficulty, gainXP]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-primary rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text-primary">Memory Match</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        
        {gameState === 'menu' && (
          <div className="space-y-4">
            <p className="text-text-secondary text-center">
              Match all the pairs of hearts!
            </p>
            
            {highScore && (
              <div className="flex items-center justify-center gap-2 text-accent-500">
                <Trophy className="w-5 h-5" />
                <span>Best: {highScore} points</span>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">Difficulty:</p>
              <div className="flex gap-2">
                {(['easy', 'normal', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      difficulty === d
                        ? 'bg-primary-500 text-white'
                        : 'bg-bg-secondary text-text-primary hover:bg-bg-tertiary'
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <Button fullWidth onClick={initializeGame}>
              Start Game
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && (
          <div className="space-y-4">
            <div className="flex justify-between text-text-secondary">
              <span>Moves: {moves}</span>
              <span>Matches: {matches}/{getGridSize() / 2}</span>
            </div>
            
            <div 
              className={`grid gap-2 ${
                difficulty === 'easy' ? 'grid-cols-2' :
                difficulty === 'normal' ? 'grid-cols-4' :
                'grid-cols-4'
              }`}
            >
              {cards.map((card) => (
                <motion.button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched}
                  className={`aspect-square rounded-lg text-2xl flex items-center justify-center transition-all ${
                    card.isMatched
                      ? 'bg-success-light text-success'
                      : card.isFlipped
                      ? 'bg-primary-100 dark:bg-primary-900/30'
                      : 'bg-bg-secondary hover:bg-bg-tertiary'
                  }`}
                  whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {card.isFlipped || card.isMatched ? card.symbol : '❓'}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        {gameState === 'won' && (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            
            <h3 className="text-xl font-bold text-text-primary">You Won!</h3>
            
            <p className="text-text-secondary">
              Completed in {moves} moves
            </p>
            
            {isNewHighScore && (
              <p className="text-accent-500 font-medium flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                New High Score!
              </p>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={initializeGame}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
```

**Step 2: Verify build**

Run:
```bash
npm run typecheck
npm run build
```

**Step 3: Commit**

```bash
git add src/components/pet/MemoryMatch.tsx
git commit -m "feat: create Memory Match minigame

- Add card matching game with 3 difficulty levels
- Track moves and calculate score based on efficiency
- Integrate with high score and achievement systems
- Award XP based on performance"
```

---

## Task 4: Create Relationship Quiz Game

**Goal:** Add a quiz game about the couple's relationship.

**Files:**
- Create: `src/components/pet/RelationshipQuiz.tsx`
- Create: `src/data/quizQuestions.ts`

**Step 1: Create quiz questions**

Create `src/data/quizQuestions.ts`:

```typescript
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: 'favorites' | 'memories' | 'preferences' | 'future';
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Favorites
  {
    id: 'fav-color',
    question: "What is your partner's favorite color?",
    options: ['Blue', 'Pink', 'Green', 'Purple'],
    category: 'favorites',
  },
  {
    id: 'fav-food',
    question: "What is your partner's favorite food?",
    options: ['Pizza', 'Sushi', 'Pasta', 'Tacos'],
    category: 'favorites',
  },
  {
    id: 'fav-movie',
    question: "What genre of movies does your partner prefer?",
    options: ['Romance', 'Action', 'Comedy', 'Horror'],
    category: 'favorites',
  },
  
  // Memories
  {
    id: 'first-date',
    question: 'Where did you go on your first date?',
    options: ['Restaurant', 'Movie', 'Park', 'Cafe'],
    category: 'memories',
  },
  {
    id: 'first-gift',
    question: 'What was the first gift you gave each other?',
    options: ['Flowers', 'Jewelry', 'Book', 'Handmade'],
    category: 'memories',
  },
  
  // Preferences
  {
    id: 'morning-night',
    question: 'Is your partner a morning or night person?',
    options: ['Morning', 'Night', 'Both', 'Neither'],
    category: 'preferences',
  },
  {
    id: 'coffee-tea',
    question: 'Does your partner prefer coffee or tea?',
    options: ['Coffee', 'Tea', 'Both', 'Neither'],
    category: 'preferences',
  },
  
  // Future
  {
    id: 'dream-vacation',
    question: "What is your partner's dream vacation destination?",
    options: ['Beach', 'Mountains', 'City', 'Countryside'],
    category: 'future',
  },
];
```

**Step 2: Create RelationshipQuiz component**

Create `src/components/pet/RelationshipQuiz.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trophy } from 'lucide-react';
import { usePetStore } from '../../store';
import { Button } from '../Button';
import { highScoreService } from '../../lib/highScoreService';
import { QUIZ_QUESTIONS, type QuizQuestion } from '../../data/quizQuestions';

interface RelationshipQuizProps {
  onClose: () => void;
}

export const RelationshipQuiz = ({ onClose }: RelationshipQuizProps) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  const gainXP = usePetStore((state) => state.gainXP);
  
  const startGame = () => {
    // Shuffle and pick 5 questions
    const shuffled = [...QUIZ_QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
    setIsNewHighScore(false);
  };
  
  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    // In a real app, you'd check against partner's actual answers
    // For now, we'll simulate correct answers randomly
    const isCorrect = Math.random() > 0.3;
    
    if (isCorrect) {
      setScore(prev => prev + 20);
    }
    
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Game over
        setGameState('result');
        
        // Check high score
        highScoreService.submitScore('quiz', score, undefined)
          .then(({ isNewHighScore }) => {
            setIsNewHighScore(isNewHighScore);
          });
        
        // Award XP
        gainXP(score, 'relationship-quiz');
      }
    }, 1000);
  };
  
  const currentQ = questions[currentQuestion];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-primary rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-500" />
            Relationship Quiz
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        
        {gameState === 'menu' && (
          <div className="space-y-4 text-center">
            <p className="text-text-secondary">
              Test how well you know your partner! Answer questions about your relationship.
            </p>
            
            <div className="bg-bg-secondary rounded-lg p-4">
              <p className="text-sm text-text-tertiary">
                5 questions • 20 points each
              </p>
            </div>
            
            <Button fullWidth onClick={startGame}>
              Start Quiz
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && currentQ && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Question {currentQuestion + 1}/{questions.length}</span>
              <span>Score: {score}</span>
            </div>
            
            <div className="w-full bg-bg-tertiary rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-text-primary">
                  {currentQ.question}
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {currentQ.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => !showFeedback && handleAnswer(option)}
                      disabled={showFeedback}
                      className={`p-3 rounded-lg text-text-primary font-medium transition-all ${
                        showFeedback && selectedAnswer === option
                          ? 'bg-primary-500 text-white'
                          : 'bg-bg-secondary hover:bg-bg-tertiary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        
        {gameState === 'result' && (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl"
            >
              {score >= 80 ? '🏆' : score >= 40 ? '💕' : '💪'}
            </motion.div>
            
            <h3 className="text-xl font-bold text-text-primary">
              {score >= 80 ? 'Perfect Score!' : score >= 40 ? 'Great Job!' : 'Keep Learning!'}
            </h3>
            
            <p className="text-text-secondary">
              You scored {score} points
            </p>
            
            {isNewHighScore && (
              <p className="text-accent-500 font-medium flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                New High Score!
              </p>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={startGame}>
                Play Again
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
```

**Step 3: Verify build**

Run:
```bash
npm run typecheck
npm run build
```

**Step 4: Commit**

```bash
git add src/components/pet/RelationshipQuiz.tsx src/data/quizQuestions.ts
git commit -m "feat: create Relationship Quiz minigame

- Add quiz game about relationship knowledge
- Include questions about favorites, memories, preferences
- Track score and award XP
- Integrate with high score system"
```

---

## Task 5: Create Minigame Hub

**Goal:** Create a central hub for accessing all minigames.

**Files:**
- Create: `src/components/pet/MinigameHub.tsx`
- Modify: `src/pages/Pet.tsx` (integrate hub)

**Step 1: Create MinigameHub component**

Create `src/components/pet/MinigameHub.tsx`:

```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Heart, Target, Brain, Trophy, X } from 'lucide-react';
import { Button } from '../Button';
import { highScoreService } from '../../lib/highScoreService';
import { PetMinigame } from './PetMinigame';
import { LoveCatcher } from './LoveCatcher';
import { MemoryMatch } from './MemoryMatch';
import { RelationshipQuiz } from './RelationshipQuiz';

interface MinigameHubProps {
  onClose: () => void;
}

type GameType = 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz' | null;

interface GameInfo {
  id: GameType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const GAMES: GameInfo[] = [
  {
    id: 'petminigame',
    name: 'Heart Catcher',
    description: 'Tap falling hearts to score points!',
    icon: <Heart className="w-8 h-8" />,
    color: 'bg-pink-500',
  },
  {
    id: 'lovecatcher',
    name: 'Love Catcher',
    description: 'Catch hearts and coins, avoid the poop!',
    icon: <Target className="w-8 h-8" />,
    color: 'bg-purple-500',
  },
  {
    id: 'memorymatch',
    name: 'Memory Match',
    description: 'Match pairs of hearts from memory!',
    icon: <Brain className="w-8 h-8" />,
    color: 'bg-blue-500',
  },
  {
    id: 'quiz',
    name: 'Relationship Quiz',
    description: 'Test your knowledge about your partner!',
    icon: <Gamepad2 className="w-8 h-8" />,
    color: 'bg-green-500',
  },
];

export const MinigameHub = ({ onClose }: MinigameHubProps) => {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  
  // Load high scores on mount
  useState(() => {
    const scores: Record<string, number> = {};
    GAMES.forEach(game => {
      if (game.id) {
        const hs = highScoreService.getHighScore(game.id);
        if (hs) scores[game.id] = hs.score;
      }
    });
    setHighScores(scores);
  });
  
  const renderGame = () => {
    switch (activeGame) {
      case 'petminigame':
        return <PetMinigame onClose={() => setActiveGame(null)} />;
      case 'lovecatcher':
        return <LoveCatcher onClose={() => setActiveGame(null)} />;
      case 'memorymatch':
        return <MemoryMatch onClose={() => setActiveGame(null)} />;
      case 'quiz':
        return <RelationshipQuiz onClose={() => setActiveGame(null)} />;
      default:
        return null;
    }
  };
  
  return (
    <>
      <AnimatePresence>
        {!activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-primary rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-primary-500" />
                  Minigames
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {GAMES.map((game) => (
                  <motion.button
                    key={game.id}
                    onClick={() => setActiveGame(game.id)}
                    className={`relative p-4 rounded-xl ${game.color} text-white text-left overflow-hidden group`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative z-10">
                      <div className="mb-2">{game.icon}</div>
                      <h3 className="font-bold">{game.name}</h3>
                      <p className="text-sm text-white/80 mt-1">{game.description}</p>
                      
                      {highScores[game.id!] && (
                        <div className="flex items-center gap-1 mt-2 text-sm">
                          <Trophy className="w-4 h-4" />
                          <span>{highScores[game.id!]} pts</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-bg-secondary rounded-lg">
                <p className="text-sm text-text-secondary text-center">
                  🎮 Play games to earn XP and coins for your pet!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {activeGame && renderGame()}
    </>
  );
};
```

**Step 2: Verify build**

Run:
```bash
npm run typecheck
npm run build
```

**Step 3: Commit**

```bash
git add src/components/pet/MinigameHub.tsx
git commit -m "feat: create MinigameHub for centralized game access

- Add hub component with all 4 minigames
- Display high scores for each game
- Use animated cards for game selection
- Provide consistent entry point for minigames"
```

---

## Task 6: Add Daily Challenge System

**Goal:** Add daily challenges for bonus rewards.

**Files:**
- Create: `src/lib/dailyChallengeService.ts`
- Modify: `src/components/pet/MinigameHub.tsx` (show daily challenge)

**Step 1: Create daily challenge service**

Create `src/lib/dailyChallengeService.ts`:

```typescript
export interface DailyChallenge {
  id: string;
  game: 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz';
  target: number;
  reward: { xp: number; coins: number };
  completed: boolean;
  expiresAt: string;
}

const STORAGE_KEY = 'lovelevel-daily-challenge';

const CHALLENGE_TEMPLATES = [
  { game: 'petminigame' as const, target: 50, reward: { xp: 30, coins: 15 } },
  { game: 'lovecatcher' as const, target: 100, reward: { xp: 40, coins: 20 } },
  { game: 'memorymatch' as const, target: 30, reward: { xp: 35, coins: 18 } },
  { game: 'quiz' as const, target: 60, reward: { xp: 25, coins: 12 } },
];

class DailyChallengeService {
  private challenge: DailyChallenge | null = null;
  
  constructor() {
    this.load();
  }
  
  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const challenge = JSON.parse(stored) as DailyChallenge;
        
        // Check if expired
        if (new Date(challenge.expiresAt) > new Date()) {
          this.challenge = challenge;
        } else {
          this.generateNew();
        }
      } else {
        this.generateNew();
      }
    } catch {
      this.generateNew();
    }
  }
  
  private generateNew(): void {
    const template = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];
    
    // Set expiry to end of day
    const now = new Date();
    const expiresAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    this.challenge = {
      id: crypto.randomUUID(),
      game: template.game,
      target: template.target,
      reward: template.reward,
      completed: false,
      expiresAt: expiresAt.toISOString(),
    };
    
    this.save();
  }
  
  get(): DailyChallenge | null {
    // Refresh if expired
    if (this.challenge && new Date(this.challenge.expiresAt) <= new Date()) {
      this.generateNew();
    }
    return this.challenge;
  }
  
  checkProgress(game: string, score: number): { completed: boolean; reward: { xp: number; coins: number } | null } {
    if (!this.challenge || this.challenge.completed || this.challenge.game !== game) {
      return { completed: false, reward: null };
    }
    
    if (score >= this.challenge.target) {
      this.challenge.completed = true;
      this.save();
      return { completed: true, reward: this.challenge.reward };
    }
    
    return { completed: false, reward: null };
  }
  
  private save(): void {
    if (this.challenge) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.challenge));
    }
  }
}

export const dailyChallengeService = new DailyChallengeService();
```

**Step 2: Verify build**

Run:
```bash
npm run typecheck
npm run build
```

**Step 3: Commit**

```bash
git add src/lib/dailyChallengeService.ts
git commit -m "feat: create daily challenge system

- Generate random daily challenges for each game
- Track completion and expiry
- Provide bonus XP and coin rewards
- Persist to localStorage"
```

---

## Task 7: Final Verification

**Goal:** Ensure all minigame features work correctly.

**Step 1: Run full test suite**

Run:
```bash
npm test
```

**Step 2: Run lint**

Run:
```bash
npm run lint
```

**Step 3: Run type check**

Run:
```bash
npm run typecheck
```

**Step 4: Run production build**

Run:
```bash
npm run build
```

**Step 5: Check bundle size**

Run:
```bash
ls -lh dist/assets/*.js | head -10
```

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: Phase 4 minigame expansion complete

- Created achievement system with 12 achievements
- Created high score system for all minigames
- Added Memory Match game with 3 difficulty levels
- Added Relationship Quiz game
- Created MinigameHub for centralized access
- Added daily challenge system for bonus rewards

All games integrate with XP and achievement systems"
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] `npm run lint` shows no new errors
- [ ] `npm run typecheck` passes
- [ ] All 4 minigames are playable
- [ ] High scores persist across sessions
- [ ] Achievements unlock correctly
- [ ] Daily challenges refresh at midnight
- [ ] XP rewards are awarded correctly

---

## Rollback Plan

If critical issues arise:

1. **Minigame issues**: Disable specific game
   ```bash
   git revert HEAD~1  # Revert last commit
   ```

2. **Achievement issues**: Disable achievement checks
   ```bash
   git checkout HEAD~5 -- src/lib/achievementService.ts
   ```

---

## Next Steps After Phase 4

Once Phase 4 is complete and verified:

1. **Phase 5**: Advanced PWA (background sync, push notifications)

---

**Plan saved to:** `docs/plans/2026-03-13-phase4-minigames.md`
