# 🔄 SYNC IMPLEMENTATION PLAN

## 📊 Current State (✅ COMPLETED)

- ✅ Firebase Auth working (immediate user set on login)
- ✅ Supabase database schema with proper foreign keys
- ✅ Profile creation with retry mechanism
- ✅ Invite code generation & validation
- ✅ Partnership creation when joining with code
- ✅ Basic syncManager skeleton with real-time subscriptions

## 🎯 Implementation Roadmap

### **Phase 1: Core Synchronization (Priority: HIGH)** 🚀

#### Task 2: Complete Challenge Sync Implementation
**Files:** `src/lib/syncManager.ts`, `src/pages/Challenges.tsx`
**Goal:** Bidirectional challenge sync with conflict resolution
**Acceptance Criteria:**
- [ ] When user completes challenge → sync to Supabase `shared_challenges` table
- [ ] When partner completes challenge → update local IndexedDB via real-time subscription
- [ ] Conflict resolution: last-write-wins with timestamp comparison
- [ ] Unit test: Mock two users completing same challenge simultaneously
**Estimated Time:** 2-3 hours

#### Task 3: Complete Pet State Sync Implementation
**Files:** `src/lib/syncManager.ts`, `src/pages/Pet.tsx`, `src/store/index.ts`
**Goal:** Real-time shared pet between partners
**Acceptance Criteria:**
- [ ] Pet XP/level syncs immediately between partners
- [ ] Pet hunger/energy/mood syncs in real-time
- [ ] Equipped items (accessories, backgrounds) sync
- [ ] Pet name changes sync
- [ ] Unit test: Mock pet interaction from both sides
**Estimated Time:** 3-4 hours

#### Task 4: Implement Offline Queue & Retry Logic
**Files:** `src/lib/syncManager.ts`, `src/lib/db.ts`
**Goal:** Graceful offline handling with persistent queue
**Acceptance Criteria:**
- [ ] All sync operations add to queue if offline
- [ ] Queue persisted in IndexedDB (survives page refresh)
- [ ] Exponential backoff retry (500ms, 1s, 2s, 4s, fail)
- [ ] Process queue automatically when online
- [ ] Unit test: Simulate offline→online transition
**Estimated Time:** 2-3 hours

#### Task 5: Add Conflict Resolution Strategy
**Files:** `src/lib/syncManager.ts`, `src/lib/conflictResolver.ts` (new)
**Goal:** Smart merge strategies for concurrent edits
**Acceptance Criteria:**
- [ ] Challenges: Operational Transform (OT) for concurrent completions
- [ ] Pet state: Last-write-wins for hunger/energy, sum for XP
- [ ] Settings: Manual merge UI for conflicts
- [ ] Timestamp-based conflict detection
- [ ] Unit test: All conflict scenarios
**Estimated Time:** 3-4 hours

---

### **Phase 2: User Experience (Priority: MEDIUM)** 🎨

#### Task 6: Implement Real-time Notifications
**Files:** `src/lib/notifications.ts`, `src/contexts/SupabaseSyncContext.tsx`, `src/components/Toast.tsx` (new)
**Goal:** In-app notifications for partner activities
**Acceptance Criteria:**
- [ ] Toast notification when partner completes challenge
- [ ] Toast notification when pet levels up
- [ ] Toast notification on monthiversary
- [ ] Sound + vibration (optional user setting)
- [ ] Unit test: Mock partner events trigger toasts
**Estimated Time:** 2 hours

#### Task 7: Add Sync Status UI Indicators
**Files:** `src/components/SyncIndicator.tsx` (new), `src/pages/Settings.tsx`
**Goal:** Transparent sync status for users
**Acceptance Criteria:**
- [ ] Sync icon in header (green=synced, orange=syncing, red=offline)
- [ ] Last sync timestamp display
- [ ] Queued items count
- [ ] Manual "Sync Now" button
- [ ] Unit test: UI reflects sync state changes
**Estimated Time:** 2 hours

#### Task 8: Implement Shared History Feed
**Files:** `src/pages/History.tsx`, `src/components/HistoryItem.tsx` (new)
**Goal:** Timeline of both partners' activities
**Acceptance Criteria:**
- [ ] Fetch activities from both users
- [ ] Merge and sort by timestamp
- [ ] Show avatars to distinguish who did what
- [ ] Filter by type (challenges, level-ups, unlocks)
- [ ] Infinite scroll / pagination
- [ ] Unit test: Mock dual activities render correctly
**Estimated Time:** 3-4 hours

---

### **Phase 3: Gamification (Priority: MEDIUM)** 🏆

#### Task 9: Implement XP & Leveling System Sync
**Files:** `src/lib/xpSystem.ts`, `src/store/index.ts`, `src/lib/syncManager.ts`
**Goal:** Shared XP pool contributing to pet level
**Acceptance Criteria:**
- [ ] XP gains from both partners add to shared total
- [ ] Level-up triggers for both when threshold reached
- [ ] XP transactions logged in Supabase `xp_history` table (optional)
- [ ] Confetti animation on level-up
- [ ] Unit test: XP from User A + User B = correct level
**Estimated Time:** 2-3 hours

#### Task 11: Implement Unlockable Items Sync
**Files:** `src/data/seedPetItems.ts`, `src/lib/syncManager.ts`, `src/pages/Pet.tsx`
**Goal:** Real-time item unlocks based on milestones
**Acceptance Criteria:**
- [ ] Items unlock at specific levels/monthiversaries
- [ ] Unlock events sync to both partners immediately
- [ ] "New item unlocked!" toast notification
- [ ] Items appear in inventory in real-time
- [ ] Unit test: Mock level-up triggers unlock for both partners
**Estimated Time:** 2 hours

#### Task 12: Add Anniversary/Monthiversary Tracking
**Files:** `src/lib/dateUtils.ts`, `src/pages/Home.tsx`, `src/lib/notifications.ts`
**Goal:** Celebrate relationship milestones
**Acceptance Criteria:**
- [ ] Calculate days/months together from `anniversary_date`
- [ ] Display countdown to next monthiversary
- [ ] Send notification on special dates (push + in-app)
- [ ] Award bonus XP on monthiversaries
- [ ] Unit test: Date calculations correct
**Estimated Time:** 2-3 hours

---

### **Phase 4: Partnership Features (Priority: LOW)** 🤝

#### Task 10: Add Partnership Management UI
**Files:** `src/pages/Partner.tsx`, `src/components/PartnershipSettings.tsx` (new)
**Goal:** Full partnership lifecycle management
**Acceptance Criteria:**
- [ ] View partner profile (name, email, avatar)
- [ ] See partnership status (active, pending, ended)
- [ ] "Leave Partnership" button (soft delete, status→'ended')
- [ ] Confirmation modal before leaving
- [ ] Handle case where partner leaves (show message)
- [ ] Unit test: Leave partnership updates DB correctly
**Estimated Time:** 2-3 hours

---

### **Phase 5: Testing & Optimization (Priority: LOW)** 🧪

#### Task 13: Write Integration Tests for Sync
**Files:** `src/lib/syncManager.test.ts`, `src/__tests__/integration/sync.test.ts` (new)
**Goal:** Comprehensive E2E sync testing
**Acceptance Criteria:**
- [ ] Test: Two users complete challenges simultaneously
- [ ] Test: Offline mode queues operations
- [ ] Test: Conflict resolution works correctly
- [ ] Test: Partnership creation/deletion
- [ ] Test: Real-time subscriptions fire correctly
- [ ] All tests green ✅
**Estimated Time:** 4-5 hours

#### Task 14: Performance Optimization
**Files:** `src/lib/syncManager.ts`, `src/lib/supabase.ts`
**Goal:** Fast, efficient sync with minimal overhead
**Acceptance Criteria:**
- [ ] Debounce rapid sync events (e.g., typing in notes)
- [ ] Batch multiple changes into single Supabase call
- [ ] Use connection pooling for Supabase client
- [ ] Add indexes to Supabase tables for common queries
- [ ] Lighthouse performance score >90
- [ ] Unit test: Measure sync latency (<500ms)
**Estimated Time:** 3-4 hours

---

### **Phase 6: Documentation (Priority: LOW)** 📚

#### Task 15: Update Documentation
**Files:** `SYNC_ARCHITECTURE.md` (new), `README.md`, `API_REFERENCE.md` (new)
**Goal:** Comprehensive docs for developers & users
**Acceptance Criteria:**
- [ ] SYNC_ARCHITECTURE.md: Explain sync flow diagrams
- [ ] Document conflict resolution strategies
- [ ] Troubleshooting guide for common sync issues
- [ ] README: Add partnership flow instructions
- [ ] API_REFERENCE.md: Document syncManager methods
**Estimated Time:** 2-3 hours

---

## 🔧 Implementation Strategy

### **Per-Task Workflow:**
1. ✅ **Mark todo as in-progress**
2. 🔍 **Research:** Check official docs if using new APIs
3. 📝 **Implement:** Write focused, small diffs
4. 🧪 **Unit Test:** Create `<feature>.test.ts` and verify
5. ✅ **Verify:** Run in dev, check console logs, test manually
6. 📦 **Commit:** `git add . && git commit -m "feat: <description>"`
7. 🗑️ **Cleanup:** Delete unit test file (we'll write E2E tests later)
8. ➡️ **Next:** Mark completed, move to next todo

### **Tech Stack:**
- **Frontend:** React + TypeScript + Vite
- **State:** Zustand (client state) + IndexedDB (offline persistence)
- **Backend:** Firebase Auth + Supabase (PostgreSQL)
- **Sync:** Supabase Real-time (WebSocket subscriptions)
- **Testing:** Vitest + React Testing Library
- **CI/CD:** GitHub Actions (run tests on PR)

### **Key Principles:**
- **Incremental:** One task at a time, commit often
- **Tested:** Every feature gets a unit test before commit
- **Documented:** Add comments for complex sync logic
- **User-centric:** Sync should be invisible (just works™)
- **Resilient:** Handle offline, errors, conflicts gracefully

---

## 📈 Success Metrics

### **Technical:**
- ✅ Sync latency <500ms (partner sees change in <0.5s)
- ✅ Conflict resolution rate >99% (auto-merge, no user intervention)
- ✅ Offline queue success rate >95% (after retry)
- ✅ Test coverage >80%

### **User Experience:**
- ✅ "It just works" - users never think about sync
- ✅ No data loss (even in offline mode)
- ✅ Real-time feel (partner actions appear instantly)
- ✅ Clear status indicators (never confused about sync state)

---

## 🚦 Current Status: TASK 1 COMPLETED ✅

**Next Up:** Task 2 - Complete Challenge Sync Implementation

**Estimated Total Time:** ~40-50 hours
**Sprint Length:** 2-3 weeks (working part-time)

---

## 🎬 Let's Begin! 🚀

Starting with **Task 2: Challenge Sync** - the foundation of all other sync features.
