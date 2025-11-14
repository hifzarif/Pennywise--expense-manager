'use client';

import * as React from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { createUserDocument } from '@/firebase/user-management';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth || !firestore) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // When user signs in, create their document non-blockingly
        createUserDocument(firestore, user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, firestore]);

  const signIn = () => {
    if (auth) {
      // For anonymous sign-in, we just call it.
      // We don't await it because the onAuthStateChanged listener
      // will handle the user state change.
      import('@/firebase/non-blocking-login').then(({ initiateAnonymousSignIn }) => {
        initiateAnonymousSignIn(auth);
      });
    }
  };

  const value = { user, loading, signIn };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
