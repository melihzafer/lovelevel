import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeStores, useSettingsStore } from './store';
import { Loader } from './components/Loader';
import { BottomNav } from './components/BottomNav';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './contexts/FirebaseAuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy-loaded pages
const OnboardingPage = lazy(() => import('./pages/Onboarding'));
const HomePage = lazy(() => import('./pages/Home'));
const ChallengesPage = lazy(() => import('./pages/Challenges'));
const PetPage = lazy(() => import('./pages/Pet'));
const HistoryPage = lazy(() => import('./pages/History'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const LoginPage = lazy(() => import('./pages/Login'));
const SignupPage = lazy(() => import('./pages/Signup'));

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
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          {!onboardingCompleted ? (
            <>
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenges"
                element={
                  <ProtectedRoute>
                    <ChallengesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pet"
                element={
                  <ProtectedRoute>
                    <PetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
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
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
