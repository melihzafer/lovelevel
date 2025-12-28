import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTranslation } from '../lib/i18n';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, loginWithGoogle, error, clearError, user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

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
    if (password !== confirmPassword) {
      setLocalError(t.auth.passwordMismatch || 'Passwords do not match');
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
      await signup(email, password);
      // Navigation handled by useEffect
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    clearError();
    setLocalError(null);
    setIsLoading(true);
    try {
      console.log('🔵 Starting Google OAuth...');
      await loginWithGoogle();
      // Navigation handled by useEffect
    } catch (err) {
      console.error('❌ Google OAuth failed in Signup component:', err);
      // Error already handled and displayed by AuthContext
      // Additional local handling if needed
      if (err instanceof Error) {
        setLocalError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
            💕 coupLOVE
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t.auth.signupSubtitle || 'Start your love journey together'}
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            {t.auth.createAccount || 'Create Account'}
          </h2>

          {/* Error Message */}
          {displayError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.auth.password || 'Password'}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="new-password"
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t.auth.passwordHint || 'Minimum 6 characters'}
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.auth.confirmPassword || 'Confirm Password'}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="new-password"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700"
            >
              {isLoading ? (t.auth.creatingAccount || 'Creating account...') : (t.auth.signUp || 'Sign Up')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {t.auth.orContinueWith || 'Or continue with'}
              </span>
            </div>
          </div>

          {/* Google Signup */}
          <Button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
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

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t.auth.haveAccount || 'Already have an account?'}{' '}
            <Link to="/login" className="text-pink-600 dark:text-pink-400 hover:underline font-medium">
              {t.auth.signIn || 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
