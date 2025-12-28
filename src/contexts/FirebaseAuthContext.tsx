import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, handleFirebaseError } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { clearAllData } from '../lib/db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set persistence to LOCAL (survives browser restarts)
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error('Failed to set persistence:', err);
    });

    // Handle redirect result from Google OAuth (legacy support or if redirect was used)
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('✅ Google OAuth redirect successful:', result.user.email);
          setUser(result.user);
        }
      })
      .catch((err) => {
        console.error('❌ Google OAuth redirect error:', err);
        const errorMessage = handleFirebaseError(err);
        setError(errorMessage);
      });

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log('✅ Login successful:', userCredential.user.email);
      
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log('✅ Signup successful:', userCredential.user.email);
      
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('🔵 Starting Google OAuth popup...');
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google OAuth popup successful:', result.user.email);
      setUser(result.user);
      
    } catch (err) {
      console.error('❌ Google OAuth error:', err);
      
      if (err && typeof err === 'object') {
        const firebaseErr = err as { code?: string; message?: string; customData?: unknown };
        console.error('Error code:', firebaseErr.code);
        console.error('Error message:', firebaseErr.message);
      }
      
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      
      // Clear local database to prevent data leaking between accounts
      await clearAllData();
      
      // Reload page to reset all memory stores (Zustand, etc)
      window.location.href = '/login';
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!user) throw new Error('No user logged in');

      // 1. Delete Supabase Profile (cascading SHOULD handle other data, but let's be safe)
      // Note: We need to use the authenticated client
      const { error: sbError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.uid);

      if (sbError) {
        console.error('Error deleting supabase profile:', sbError);
        // Continue anyway to delete auth
      }

      // 2. Delete Firebase Auth User
      await user.delete();

      // 3. Clear local data
      await clearAllData();

      // 4. Redirect
      window.location.href = '/login';
    } catch (err) {
      console.error('Error deleting account:', err);
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
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
    login,
    signup,
    loginWithGoogle,
    logout,
    deleteAccount,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
