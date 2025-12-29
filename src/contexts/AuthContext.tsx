import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { auth, handleFirebaseError } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Check for redirect result (Google OAuth)
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('✅ Google OAuth redirect successful:', result.user.email);
        }
      })
      .catch((err: unknown) => {
        console.error('❌ Google OAuth redirect error:', err);
        setError(handleFirebaseError(err));
      });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string): Promise<UserCredential> => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Signup successful:', result.user.email);
      return result;
    } catch (err: unknown) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      console.error('❌ Signup error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful:', result.user.email);
      return result;
    } catch (err: unknown) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      console.error('❌ Login error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<UserCredential> => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      // Use popup for better UX (redirect as fallback)
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('✅ Google login successful:', result.user.email);
        return result;
      } catch (popupError: unknown) {
        // If popup blocked, fallback to redirect
        if (
          typeof popupError === 'object' &&
          popupError !== null &&
          'code' in popupError &&
          popupError.code === 'auth/popup-blocked'
        ) {
          console.log('Popup blocked, using redirect...');
          await signInWithRedirect(auth, provider);
          // Redirect result handled in useEffect
          throw new Error('Redirecting to Google...');
        }
        throw popupError;
      }
    } catch (err: unknown) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      console.error('❌ Google login error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
      console.log('✅ Logout successful');
    } catch (err: any) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      console.error('❌ Logout error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
