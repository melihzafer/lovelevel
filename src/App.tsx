import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeStores, useSettingsStore } from './store';
import { Loader } from './components/Loader';
import { BottomNav } from './components/BottomNav';
import { ThemeProvider } from './components/ThemeProvider';

// Lazy-loaded pages
const OnboardingPage = lazy(() => import('./pages/Onboarding'));
const HomePage = lazy(() => import('./pages/Home'));
const ChallengesPage = lazy(() => import('./pages/Challenges'));
const PetPage = lazy(() => import('./pages/Pet'));
const HistoryPage = lazy(() => import('./pages/History'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  const settings = useSettingsStore((state) => state.settings);
  const onboardingCompleted = settings.onboardingCompleted;

  useEffect(() => {
    initializeStores().then(() => {
      setIsInitialized(true);
    });
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader />
          </div>
        }
      >
        <Routes>
          {/* Onboarding gate */}
          {!onboardingCompleted ? (
            <>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/pet" element={<PetPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/onboarding" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Suspense>

      {onboardingCompleted && <BottomNav />}
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
