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


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        // In production, fetch user role from Firestore
        setAppUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Admin',
          role: 'admin', // In production, fetch from Firestore users collection
          createdAt: new Date(),
        });
      } else {
        setAppUser(null);
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

    // Try Firebase Authentication
    if (isFirebaseConfigured && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return;
      } catch (err) {
        console.warn('Firebase Auth failed or user not created in console. Using demo admin fallback:', err);
      }
    }

    // Demo admin fallback mode (allows admin access even before user is created in Firebase Console)
    setAppUser({
      uid: 'admin-local-001',
      email: email,
      displayName: email.split('@')[0] || 'Admin',
      role: 'admin',
      createdAt: new Date(),
    });
  };

  const signOut = async () => {
    try {
      if (!isFirebaseConfigured || !auth) {
        setAppUser(null);
        return;
      }
      await firebaseSignOut(auth);
      setAppUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
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
