/**
 * Challenges Store - Manages relationship challenges
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Challenge } from '../types/database';
import { challengeService, syncService } from '../services';
import * as db from '../lib/db';
import { useSettingsStore } from './settingsStore';
import { usePetStore } from './petStore';

interface ChallengesState {
  challenges: Challenge[];
  isLoading: boolean;
  loadChallenges: () => Promise<void>;
  addChallenge: (challenge: Challenge) => Promise<void>;
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>;
  completeChallenge: (id: string, notes?: string) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  getCompletedChallenges: () => Challenge[];
  getActiveChallenges: () => Challenge[];
}

export const useChallengesStore = create<ChallengesState>()(
  devtools(
    (set, get) => ({
      challenges: [],
      isLoading: true,
      
      loadChallenges: async () => {
        set({ isLoading: true });
        const challenges = await challengeService.getChallenges();
        set({ challenges, isLoading: false });
      },
      
      addChallenge: async (challenge) => {
        await challengeService.addChallenge({
          title: challenge.title,
          description: challenge.description,
          category: challenge.category,
          tags: challenge.tags,
          estimate: challenge.estimate,
        });
        set((state) => ({
          challenges: [...state.challenges, challenge],
        }));
        await syncService.queueChallengeSync(challenge, 'add');
      },
      
      updateChallenge: async (id, updates) => {
        await challengeService.updateChallenge(id, updates);
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
        
        const challenge = get().challenges.find(c => c.id === id);
        if (challenge) {
          await syncService.queueChallengeSync(challenge, 'update');
        }
      },
      
      completeChallenge: async (id, notes) => {
        const completedAt = new Date().toISOString();
        await challengeService.updateChallenge(id, { completedAt, notes });
        
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === id ? { ...c, completedAt, notes } : c
          ),
        }));

        // Award XP to pet
        const settings = useSettingsStore.getState().settings;
        await usePetStore.getState().gainXP(settings.xpPerChallenge, 'challenge-completed');

        // Log to history
        const challenge = get().challenges.find(c => c.id === id);
        await db.addHistoryEntry({
          id: `challenge-${Date.now()}`,
          type: 'challenge-completed',
          timestamp: completedAt,
          data: {
            challengeId: id,
            challengeTitle: challenge?.title,
          },
        });
        
        if (challenge) {
          await syncService.queueChallengeSync({ ...challenge, completedAt, notes }, 'update');
        }
      },
      
      deleteChallenge: async (id) => {
        const challenge = get().challenges.find(c => c.id === id);
        await challengeService.deleteChallenge(id);
        set((state) => ({
          challenges: state.challenges.filter((c) => c.id !== id),
        }));
        
        if (challenge) {
          await syncService.queueChallengeSync(challenge, 'delete');
        }
      },
      
      getCompletedChallenges: () => {
        return get().challenges.filter((c) => c.completedAt);
      },
      
      getActiveChallenges: () => {
        return get().challenges.filter((c) => !c.completedAt);
      },
    }),
    { name: 'challenges-store' }
  )
);
