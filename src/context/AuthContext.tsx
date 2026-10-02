import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserRole } from '../types';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  hospitalId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          let userDocSnap;
          try {
            userDocSnap = await getDoc(userDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          }

          if (userDocSnap && userDocSnap.exists()) {
            setProfile(userDocSnap.data() as UserProfile);
          } else {
            // First-time user profile creation
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || 'operator@bedlink.mesh',
              displayName: currentUser.displayName || 'Emergency Operator',
              photoURL: currentUser.photoURL || undefined,
              role: 'Dispatcher',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            try {
              await setDoc(userDocRef, newProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
            }
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching or creating user profile:', err);
          setError(err instanceof Error ? err.message : 'Failed to load user profile');
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setProfile(userDocSnap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || 'operator@bedlink.mesh',
          displayName: currentUser.displayName || 'Emergency Operator',
          photoURL: currentUser.photoURL || undefined,
          role: 'Dispatcher',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Firebase Auth Sign-In Error:', err);
      // Don't show modal closed error as fatal
      if (err instanceof Error && !err.message.includes('popup-closed-by-user')) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
      setUser(null);
    } catch (err) {
      console.error('Firebase Auth Sign-Out Error:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
    }
  };

  const updateRole = async (newRole: UserRole) => {
    if (!user || !profile) return;
    try {
      const updated = {
        ...profile,
        role: newRole,
        updatedAt: new Date().toISOString(),
      };
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: updated.updatedAt,
      });
      setProfile(updated);
    } catch (err) {
      console.error('Failed to update user role:', err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signInWithGoogle,
        signOut,
        updateRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
