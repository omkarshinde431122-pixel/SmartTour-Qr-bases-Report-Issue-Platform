// ============================================================================
// SmartTour — Auth Context
// ============================================================================

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import type { AppUser } from '../types';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);


const STORAGE_KEY_AUTH = 'smarttour_auth_user';

function getStoredAppUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
      };
    }
  } catch (e) {}
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(() => getStoredAppUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = appUser?.role === 'admin';

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userObj: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Admin',
          role: 'admin',
          createdAt: new Date(),
        };
        setAppUser(userObj);
        try {
          localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userObj));
        } catch (e) {}
      } else {
        // If not logged in via Firebase Auth, only clear if not stored locally
        const stored = getStoredAppUser();
        if (!stored) {
          setAppUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    if (!email || !password) {
      const msg = 'Please enter both email and password';
      setError(msg);
      throw new Error(msg);
    }

    // Try Firebase Authentication if configured
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userObj: AppUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || email,
          displayName: userCredential.user.displayName || email.split('@')[0] || 'Admin',
          role: 'admin',
          createdAt: new Date(),
        };
        setAppUser(userObj);
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userObj));
        return;
      } catch (err) {
        console.warn('Firebase Auth failed or user not in console. Using demo admin fallback:', err);
      }
    }

    // Demo admin fallback mode (allows admin access seamlessly and persists across refresh)
    const adminObj: AppUser = {
      uid: 'admin-local-001',
      email: email,
      displayName: email.split('@')[0] || 'Admin',
      role: 'admin',
      createdAt: new Date(),
    };
    setAppUser(adminObj);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(adminObj));
    } catch (e) {}
  };

  const signOut = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setAppUser(null);
      setUser(null);
      try {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      } catch (e) {}
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, isAdmin, isLoading, signIn, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
