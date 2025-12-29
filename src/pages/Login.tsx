import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useSettingsStore } from '../store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTranslation } from '../lib/i18n';
import { AnimatedBackground } from '../components/layout/AnimatedBackground';
import { motion } from 'framer-motion';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loginWithGoogle, error, clearError, user, loading } = useAuth();
  const settings = useSettingsStore((state) => state.settings);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (settings.onboardingCompleted) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, loading, settings.onboardingCompleted, navigate]);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setLocalError(t.auth.emailRequired || 'Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError(t.auth.emailInvalid || 'Invalid email format');
      return false;
    }
    if (!password) {
      setLocalError(t.auth.passwordRequired || 'Password is required');
      return false;
    }
    if (password.length < 6) {
      setLocalError(t.auth.passwordTooShort || 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation handled by useEffect
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setLocalError(null);
    setIsLoading(true);
    try {
      console.log('🔵 Starting Google OAuth login...');
      await loginWithGoogle();
      // Navigation handled by useEffect after redirect
    } catch (err) {
      console.error('❌ Google OAuth login failed:', err);
      // Error already handled and displayed by AuthContext
      if (err instanceof Error) {
        setLocalError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <AnimatedBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 drop-shadow-md tracking-tight">
            LoveLevel
          </h1>
          <p className="text-white/90 font-medium text-lg drop-shadow-sm">
            {t.auth.loginSubtitle || 'Welcome back!'}
          </p>
        </div>

        {/* Login Form */}
        <div className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            {t.auth.login || 'Sign In'}
          </h2>

          {/* Error Message */}
          {displayError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-red-100/80 dark:bg-red-900/40 border border-red-400/50 dark:border-red-700/50 rounded-xl backdrop-blur-sm"
            >
              <p className="text-red-700 dark:text-red-300 text-sm font-medium text-center">{displayError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">
                {t.auth.email || 'Email'}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                autoComplete="email"
                className="w-full bg-white/50 dark:bg-black/20 border-white/40 focus:bg-white/70 dark:focus:bg-black/40 transition-all rounded-xl"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1">
                {t.auth.password || 'Password'}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
                className="w-full bg-white/50 dark:bg-black/20 border-white/40 focus:bg-white/70 dark:focus:bg-black/40 transition-all rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30 border-none rounded-xl py-3 font-bold text-lg"
            >
              {isLoading ? (t.auth.signingIn || 'Signing in...') : (t.auth.signIn || 'Sign In')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50 dark:border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent backdrop-blur-md rounded-full text-gray-500 dark:text-gray-400 font-medium">
                {t.auth.orContinueWith || 'Or continue with'}
              </span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-gray-800 dark:text-white rounded-xl py-3 font-semibold shadow-sm backdrop-blur-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t.auth.continueWithGoogle || 'Continue with Google'}
          </Button>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {t.auth.noAccount || "Don't have an account?"}{' '}
            <Link to="/signup" className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-bold underline transition-colors">
              {t.auth.signUp || 'Sign up'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
