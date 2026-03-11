# Phase 2: Architecture Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor architecture for better separation of concerns, testability, and maintainability.

**Architecture:** Split monolithic store, create service layer, extract sync logic, implement proper dependency injection.

**Tech Stack:** React 19, Vite 7, Zustand 5, TypeScript 5.9

---

## Overview

This phase addresses architectural debt identified in the codebase analysis:
- Monolithic 463-line store mixing concerns
- Tight coupling between state and persistence layers
- Limited service layer (only 1 service exists)
- Sync logic embedded in store actions
- Direct DB access from components

**Estimated Duration:** 7-10 days

**Risk Level:** High (significant refactoring, may break existing functionality)

---

## Task 1: Create Service Layer Foundation

**Goal:** Establish service layer pattern with clear interfaces.

**Files:**
- Create: `src/services/petService.ts`
- Create: `src/services/challengeService.ts`
- Create: `src/services/settingsService.ts`
- Create: `src/services/index.ts`

**Step 1: Create petService.ts**

Create `src/services/petService.ts`:
```typescript
import { db } from '@/lib/db';
import { api } from '@/lib/api';
import type { Pet } from '@/types';

export interface IPetService {
  getPet(): Promise<Pet | null>;
  updatePet(updates: Partial<Pet>): Promise<void>;
  feedPet(): Promise<void>;
  playWithPet(): Promise<void>;
  cleanPet(): Promise<void>;
  equipItem(itemId: string, slot: 'accessory' | 'background' | 'outfit' | 'emote'): Promise<void>;
  unequipItem(slot: 'accessory' | 'background' | 'outfit' | 'emote'): Promise<void>;
}

export class PetService implements IPetService {
  async getPet(): Promise<Pet | null> {
    return db.getPet();
  }

  async updatePet(updates: Partial<Pet>): Promise<void> {
    await db.updatePet(updates);
  }

  async feedPet(): Promise<void> {
    const pet = await this.getPet();
    if (!pet) return;
    
    const newHunger = Math.min(100, pet.hunger + 30);
    await this.updatePet({ hunger: newHunger });
  }

  async playWithPet(): Promise<void> {
    const pet = await this.getPet();
    if (!pet) return;
    
    const newEnergy = Math.max(0, pet.energy - 20);
    const newHappiness = Math.min(100, (pet.happiness || 50) + 15);
    await this.updatePet({ energy: newEnergy, happiness: newHappiness });
  }

  async cleanPet(): Promise<void> {
    const pet = await this.getPet();
    if (!pet) return;
    
    await this.updatePet({ hygiene: 100 });
  }

  async equipItem(itemId: string, slot: 'accessory' | 'background' | 'outfit' | 'emote'): Promise<void> {
    const pet = await this.getPet();
    if (!pet) return;
    
    const updates: Partial<Pet> = {};
    switch (slot) {
      case 'accessory':
        updates.equippedAccessoryId = itemId;
        break;
      case 'background':
        updates.equippedBackgroundId = itemId;
        break;
      case 'outfit':
        updates.equippedOutfitId = itemId;
        break;
      case 'emote':
        updates.equippedEmoteId = itemId;
        break;
    }
    await this.updatePet(updates);
  }

  async unequipItem(slot: 'accessory' | 'background' | 'outfit' | 'emote'): Promise<void> {
    await this.equipItem('', slot);
  }
}

export const petService = new PetService();
```

**Step 2: Create challengeService.ts**

Create `src/services/challengeService.ts`:
```typescript
import { db } from '@/lib/db';
import type { Challenge } from '@/types';

export interface IChallengeService {
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | null>;
  addChallenge(challenge: Omit<Challenge, 'id' | 'createdAt'>): Promise<Challenge>;
  updateChallenge(id: string, updates: Partial<Challenge>): Promise<void>;
  completeChallenge(id: string, notes?: string): Promise<void>;
  deleteChallenge(id: string): Promise<void>;
}

export class ChallengeService implements IChallengeService {
  async getChallenges(): Promise<Challenge[]> {
    return db.getChallenges();
  }

  async getChallenge(id: string): Promise<Challenge | null> {
    const challenges = await this.getChallenges();
    return challenges.find(c => c.id === id) || null;
  }

  async addChallenge(challenge: Omit<Challenge, 'id' | 'createdAt'>): Promise<Challenge> {
    const newChallenge: Challenge = {
      ...challenge,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await db.addChallenge(newChallenge);
    return newChallenge;
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<void> {
    await db.updateChallenge(id, updates);
  }

  async completeChallenge(id: string, notes?: string): Promise<void> {
    await this.updateChallenge(id, {
      completedAt: new Date().toISOString(),
      notes,
    });
  }

  async deleteChallenge(id: string): Promise<void> {
    await db.deleteChallenge(id);
  }
}

export const challengeService = new ChallengeService();
```

**Step 3: Create settingsService.ts**

Create `src/services/settingsService.ts`:
```typescript
import { db } from '@/lib/db';
import type { Settings } from '@/types';

export interface ISettingsService {
  getSettings(): Promise<Settings | null>;
  updateSettings(updates: Partial<Settings>): Promise<void>;
  resetSettings(): Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  partners: [],
  relationshipStartDate: new Date().toISOString().split('T')[0],
  notificationsEnabled: false,
  onboardingCompleted: false,
  language: 'en',
};

export class SettingsService implements ISettingsService {
  async getSettings(): Promise<Settings | null> {
    return db.getSettings();
  }

  async updateSettings(updates: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    const merged = { ...current || DEFAULT_SETTINGS, ...updates };
    await db.updateSettings(merged);
  }

  async resetSettings(): Promise<void> {
    await db.updateSettings(DEFAULT_SETTINGS);
  }
}

export const settingsService = new SettingsService();
```

**Step 4: Create services index**

Create `src/services/index.ts`:
```typescript
export { petService, type IPetService } from './petService';
export { challengeService, type IChallengeService } from './challengeService';
export { settingsService, type ISettingsService } from './settingsService';
```

**Step 5: Verify services compile**

Run:
```bash
npm run typecheck
```

Expected: No type errors

**Step 6: Commit**

```bash
git add src/services/
git commit -m "feat: create service layer foundation

- Add petService for pet operations
- Add challengeService for challenge operations
- Add settingsService for settings operations
- Establish clear service interfaces for testability"
```

---

## Task 2: Extract Sync Logic to SyncService

**Goal:** Move sync logic out of store into dedicated service.

**Files:**
- Create: `src/services/syncService.ts`
- Modify: `src/lib/syncManager.ts` (refactor to use service)

**Step 1: Create syncService.ts**

Create `src/services/syncService.ts`:
```typescript
import { SyncManager } from '@/lib/syncManager';
import type { Pet, Challenge, Settings } from '@/types';

export interface ISyncService {
  initialize(): Promise<void>;
  syncPet(pet: Pet): Promise<void>;
  syncChallenge(challenge: Challenge): Promise<void>;
  syncSettings(settings: Settings): Promise<void>;
  queueSync(type: 'pet' | 'challenge' | 'settings', action: 'create' | 'update' | 'delete', data: unknown): void;
  processQueue(): Promise<void>;
  getSyncStatus(): { isOnline: boolean; isSyncing: boolean; pendingCount: number };
  subscribe(callback: (status: ISyncService['getSyncStatus'] extends () => infer R ? R : never) => void): () => void;
}

export class SyncService implements ISyncService {
  private syncManager: SyncManager | null = null;
  private subscribers: Set<() => void> = new Set();

  async initialize(): Promise<void> {
    this.syncManager = await SyncManager.getInstance();
  }

  async syncPet(pet: Pet): Promise<void> {
    if (!this.syncManager) return;
    await this.syncManager.syncPet(pet);
  }

  async syncChallenge(challenge: Challenge): Promise<void> {
    if (!this.syncManager) return;
    await this.syncManager.syncChallenge(challenge);
  }

  async syncSettings(settings: Settings): Promise<void> {
    if (!this.syncManager) return;
    await this.syncManager.syncSettings(settings);
  }

  queueSync(type: 'pet' | 'challenge' | 'settings', action: 'create' | 'update' | 'delete', data: unknown): void {
    if (!this.syncManager) return;
    this.syncManager.queueSync({ type, action, data: data as Record<string, unknown> });
  }

  async processQueue(): Promise<void> {
    if (!this.syncManager) return;
    await this.syncManager.processQueue();
  }

  getSyncStatus() {
    return {
      isOnline: navigator.onLine,
      isSyncing: this.syncManager?.isSyncing ?? false,
      pendingCount: 0, // Would need to expose from SyncManager
    };
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => cb());
  }
}

export const syncService = new SyncService();
```

**Step 2: Verify compilation**

Run:
```bash
npm run typecheck
```

**Step 3: Commit**

```bash
git add src/services/syncService.ts
git commit -m "feat: create syncService to abstract sync logic

- Wrap SyncManager with cleaner interface
- Prepare for store decoupling from sync"
```

---

## Task 3: Split Monolithic Store

**Goal:** Split store/index.ts into separate domain stores.

**Files:**
- Create: `src/store/settingsStore.ts`
- Create: `src/store/petStore.ts`
- Create: `src/store/challengesStore.ts`
- Modify: `src/store/index.ts` (re-export only)

**Step 1: Create settingsStore.ts**

Create `src/store/settingsStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsService } from '@/services';
import type { Settings, Language } from '@/types';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  setLanguage: (lang: Language) => void;
  toggleNotifications: () => void;
  completeOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      loadSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const settings = await settingsService.getSettings();
          set({ settings, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateSettings: async (updates) => {
        const { settings } = get();
        if (!settings) return;
        
        const newSettings = { ...settings, ...updates };
        set({ settings: newSettings });
        
        try {
          await settingsService.updateSettings(updates);
        } catch (error) {
          // Revert on error
          set({ settings, error: (error as Error).message });
        }
      },

      setLanguage: (lang) => {
        get().updateSettings({ language: lang });
      },

      toggleNotifications: () => {
        const { settings } = get();
        if (!settings) return;
        get().updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
      },

      completeOnboarding: () => {
        get().updateSettings({ onboardingCompleted: true });
      },
    }),
    {
      name: 'lovelevel-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
```

**Step 2: Create petStore.ts**

Create `src/store/petStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { petService, syncService } from '@/services';
import { xpSystem } from '@/lib/xpSystem';
import type { Pet, PetMood } from '@/types';

interface PetState {
  pet: Pet | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadPet: () => Promise<void>;
  updatePet: (updates: Partial<Pet>) => Promise<void>;
  feedPet: () => Promise<void>;
  playWithPet: () => Promise<void>;
  cleanPet: () => Promise<void>;
  addXP: (amount: number) => void;
  setMood: (mood: PetMood) => void;
  equipItem: (itemId: string, slot: 'accessory' | 'background' | 'outfit' | 'emote') => Promise<void>;
  unequipItem: (slot: 'accessory' | 'background' | 'outfit' | 'emote') => Promise<void>;
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pet: null,
      isLoading: false,
      error: null,

      loadPet: async () => {
        set({ isLoading: true, error: null });
        try {
          const pet = await petService.getPet();
          set({ pet, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updatePet: async (updates) => {
        const { pet } = get();
        if (!pet) return;
        
        const newPet = { ...pet, ...updates };
        set({ pet: newPet });
        
        try {
          await petService.updatePet(updates);
          await syncService.syncPet(newPet);
        } catch (error) {
          set({ pet, error: (error as Error).message });
        }
      },

      feedPet: async () => {
        const { pet } = get();
        if (!pet || pet.hunger >= 100) return;
        
        const newHunger = Math.min(100, pet.hunger + 30);
        await get().updatePet({ hunger: newHunger });
      },

      playWithPet: async () => {
        const { pet } = get();
        if (!pet || pet.energy < 20) return;
        
        const newEnergy = Math.max(0, pet.energy - 20);
        await get().updatePet({ energy: newEnergy });
      },

      cleanPet: async () => {
        await get().updatePet({ hygiene: 100 });
      },

      addXP: (amount) => {
        const { pet } = get();
        if (!pet) return;
        
        const { newLevel, remainingXP } = xpSystem.addXP(pet.xp, pet.level, amount);
        get().updatePet({ xp: remainingXP, level: newLevel });
      },

      setMood: (mood) => {
        get().updatePet({ mood });
      },

      equipItem: async (itemId, slot) => {
        const { pet } = get();
        if (!pet) return;
        
        const updates: Partial<Pet> = {};
        switch (slot) {
          case 'accessory':
            updates.equippedAccessoryId = itemId;
            break;
          case 'background':
            updates.equippedBackgroundId = itemId;
            break;
          case 'outfit':
            updates.equippedOutfitId = itemId;
            break;
          case 'emote':
            updates.equippedEmoteId = itemId;
            break;
        }
        await get().updatePet(updates);
      },

      unequipItem: async (slot) => {
        await get().equipItem('', slot);
      },
    }),
    {
      name: 'lovelevel-pet',
      partialize: (state) => ({ pet: state.pet }),
    }
  )
);
```

**Step 3: Create challengesStore.ts**

Create `src/store/challengesStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { challengeService, syncService } from '@/services';
import type { Challenge } from '@/types';

interface ChallengesState {
  challenges: Challenge[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadChallenges: () => Promise<void>;
  addChallenge: (challenge: Omit<Challenge, 'id' | 'createdAt'>) => Promise<Challenge>;
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>;
  completeChallenge: (id: string, notes?: string) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set, get) => ({
      challenges: [],
      isLoading: false,
      error: null,

      loadChallenges: async () => {
        set({ isLoading: true, error: null });
        try {
          const challenges = await challengeService.getChallenges();
          set({ challenges, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      addChallenge: async (challengeData) => {
        const challenge = await challengeService.addChallenge(challengeData);
        set((state) => ({ challenges: [...state.challenges, challenge] }));
        await syncService.syncChallenge(challenge);
        return challenge;
      },

      updateChallenge: async (id, updates) => {
        const { challenges } = get();
        const index = challenges.findIndex(c => c.id === id);
        if (index === -1) return;
        
        const oldChallenge = challenges[index];
        const newChallenge = { ...oldChallenge, ...updates };
        
        set((state) => ({
          challenges: state.challenges.map(c => c.id === id ? newChallenge : c),
        }));
        
        try {
          await challengeService.updateChallenge(id, updates);
          await syncService.syncChallenge(newChallenge);
        } catch (error) {
          // Revert on error
          set((state) => ({
            challenges: state.challenges.map(c => c.id === id ? oldChallenge : c),
            error: (error as Error).message,
          }));
        }
      },

      completeChallenge: async (id, notes) => {
        await get().updateChallenge(id, {
          completedAt: new Date().toISOString(),
          notes,
        });
      },

      deleteChallenge: async (id) => {
        const { challenges } = get();
        const filtered = challenges.filter(c => c.id !== id);
        set({ challenges: filtered });
        
        try {
          await challengeService.deleteChallenge(id);
        } catch (error) {
          // Revert on error
          set({ challenges, error: (error as Error).message });
        }
      },
    }),
    {
      name: 'lovelevel-challenges',
      partialize: (state) => ({ challenges: state.challenges }),
    }
  )
);
```

**Step 4: Update store/index.ts**

Replace `src/store/index.ts` with:
```typescript
// Re-export stores
export { useSettingsStore } from './settingsStore';
export { usePetStore } from './petStore';
export { useChallengesStore } from './challengesStore';

// Re-export types
export type { SettingsState } from './settingsStore';
export type { PetState } from './petStore';
export type { ChallengesState } from './challengesStore';

// Initialize all stores (call on app startup)
export async function initializeStores(): Promise<void> {
  const { useSettingsStore, usePetStore, useChallengesStore } = await import('./index');
  
  await Promise.all([
    useSettingsStore.getState().loadSettings(),
    usePetStore.getState().loadPet(),
    useChallengesStore.getState().loadChallenges(),
  ]);
}
```

**Step 5: Verify compilation**

Run:
```bash
npm run typecheck
```

**Step 6: Commit**

```bash
git add src/store/
git commit -m "refactor: split monolithic store into domain stores

- Create settingsStore for UI preferences
- Create petStore for pet state and actions
- Create challengesStore for challenge management
- Each store has clear responsibilities and service dependencies"
```

---

## Task 4: Update Components to Use New Stores

**Goal:** Migrate components from old store imports to new domain stores.

**Files:**
- Modify: All files importing from `@/store`

**Step 1: Find all store imports**

Run:
```bash
grep -r "from '@/store'" src/ --include="*.ts" --include="*.tsx" | head -30
```

**Step 2: Update imports systematically**

For each file:
- Replace `import { useSettingsStore, usePetStore, useChallengesStore } from '@/store'`
- With: `import { useSettingsStore, usePetStore, useChallengesStore } from '@/store'` (same, re-exported)

Note: Since we re-export from index.ts, most imports should work without changes.

**Step 3: Update any direct store access**

Find patterns like:
```typescript
const settings = useSettingsStore.getState().settings;
```

Replace with proper hook usage in components:
```typescript
const settings = useSettingsStore(state => state.settings);
```

**Step 4: Verify all pages work**

Run:
```bash
npm run dev
```

Test each page:
- Home (uses settings)
- Pet (uses pet store)
- Challenges (uses challenges store)
- Settings (uses settings store)

**Step 5: Run tests**

Run:
```bash
npm test
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: update components to use new domain stores

- Migrate all store imports to new structure
- Use proper selector patterns for performance
- Fix any direct store access patterns"
```

---

## Task 5: Add Error Boundaries

**Goal:** Add error boundaries for better error handling.

**Files:**
- Create: `src/components/ErrorBoundary.tsx`
- Modify: `src/App.tsx`

**Step 1: Create ErrorBoundary component**

Create `src/components/ErrorBoundary.tsx`:
```typescript
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 2: Wrap App with ErrorBoundary**

In `src/App.tsx`, wrap the Router:
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

// In return:
<ErrorBoundary>
  <Router>...</Router>
</ErrorBoundary>
```

**Step 3: Verify compilation**

Run:
```bash
npm run typecheck
```

**Step 4: Commit**

```bash
git add src/components/ErrorBoundary.tsx src/App.tsx
git commit -m "feat: add ErrorBoundary for better error handling

- Create ErrorBoundary component with fallback UI
- Wrap app with error boundary for crash recovery"
```

---

## Task 6: Add Loading States

**Goal:** Standardize loading states across the app.

**Files:**
- Create: `src/components/LoadingState.tsx`
- Modify: Pages that need loading states

**Step 1: Create LoadingState component**

Create `src/components/LoadingState.tsx`:
```typescript
import { Loader } from './Loader';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center">{content}</div>;
  }

  return content;
}
```

**Step 2: Use in pages**

Example in `src/pages/Pet.tsx`:
```typescript
import { LoadingState } from '@/components/LoadingState';

// In component:
const isLoading = usePetStore(state => state.isLoading);

if (isLoading) {
  return <LoadingState message="Loading your pet..." fullScreen />;
}
```

**Step 3: Commit**

```bash
git add src/components/LoadingState.tsx
git commit -m "feat: add LoadingState component for consistent loading UI"
```

---

## Task 7: Final Verification

**Goal:** Ensure all refactoring works correctly.

**Step 1: Run full test suite**

Run:
```bash
npm test
```

Expected: All tests pass (or same as before)

**Step 2: Run lint**

Run:
```bash
npm run lint
```

Expected: No new errors

**Step 3: Run type check**

Run:
```bash
npm run typecheck
```

Expected: No type errors

**Step 4: Run production build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 5: Manual testing**

Start dev server and test:
- Settings load and save
- Pet actions work (feed, play, clean)
- Challenges can be added/completed
- Sync still works (if online)

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: Phase 2 architecture refactor complete

- Created service layer (pet, challenge, settings, sync)
- Split monolithic store into domain stores
- Added error boundaries and loading states
- Improved separation of concerns and testability"
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] `npm run lint` shows no new errors
- [ ] `npm run typecheck` passes
- [ ] Settings page works
- [ ] Pet page works (feed, play, clean)
- [ ] Challenges page works (add, complete, delete)
- [ ] Sync still functions correctly
- [ ] Error boundary catches errors gracefully

---

## Rollback Plan

If critical issues arise:

1. **Service layer issues**: Revert service commits
   ```bash
   git revert HEAD~3  # Revert service layer commits
   ```

2. **Store split issues**: Restore original store
   ```bash
   git checkout HEAD~4 -- src/store/index.ts
   ```

3. **Component issues**: Check import paths
   ```bash
   git diff HEAD~5 -- src/
   ```

---

## Next Steps After Phase 2

Once Phase 2 is complete and verified:

1. **Phase 3**: UI/UX overhaul (component library, standardization)
2. **Phase 4**: Minigame expansion (achievements, new games)
3. **Phase 5**: Advanced PWA (background sync, push notifications)

---

**Plan saved to:** `docs/plans/2026-03-11-phase2-architecture.md`
