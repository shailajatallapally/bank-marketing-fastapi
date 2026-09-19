import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, updateProfile } from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  onAuthUserChanged,
} from '../lib/firebase';
import {
  syncUserProfile,
  fetchUserProfile,
  formatFriendlyDateTime,
} from '../services/firestoreService';
import { UserProfile, PageId } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  intendedPage: PageId | null;
  setIntendedPage: (page: PageId | null) => void;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserContext: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [intendedPage, setIntendedPage] = useState<PageId | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Check if user was previously signed in with mock session or local storage
      const savedUser = localStorage.getItem('apex_local_auth_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthUserChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const displayName = fbUser.displayName || (fbUser.email ? fbUser.email : 'Account');
        const mappedUser: UserProfile = {
          id: fbUser.uid,
          name: displayName,
          email: fbUser.email || '',
          role: 'Quantitative Analyst',
          organization: 'Bank Marketing Analytics',
          isAuthenticated: true,
          avatarUrl: fbUser.photoURL || undefined,
          createdAt: fbUser.metadata?.creationTime
            ? new Date(fbUser.metadata.creationTime).toLocaleString()
            : undefined,
        };
        setUser(mappedUser);

        // Synchronize and pull user profile from Cloud Firestore users/{uid}
        try {
          await syncUserProfile(fbUser.uid, {
            displayName: fbUser.displayName || '',
            email: fbUser.email || '',
          });

          const fsProfile = await fetchUserProfile(fbUser.uid);
          if (fsProfile) {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    name:
                      fbUser.displayName ||
                      fsProfile.displayName ||
                      (fbUser.email ? fbUser.email : 'Account'),
                    role: fsProfile.role || prev.role,
                    organization: fsProfile.organization || prev.organization,
                    createdAt: fsProfile.createdAt
                      ? formatFriendlyDateTime(fsProfile.createdAt)
                      : prev.createdAt,
                  }
                : null
            );
          }
        } catch (err) {
          console.warn('Firestore profile sync non-blocking error:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (name: string, email: string, pass: string) => {
    if (isFirebaseConfigured) {
      const fbUser = await registerWithEmail(name, email, pass);
      const cleanName = name.trim() || (email ? email : 'Account');
      const mappedUser: UserProfile = {
        id: fbUser.uid,
        name: cleanName,
        email: email.trim(),
        role: 'Quantitative Analyst',
        organization: 'Bank Marketing Analytics',
        isAuthenticated: true,
      };
      setUser(mappedUser);

      // Save user profile in Firestore: users/{uid}
      try {
        await syncUserProfile(fbUser.uid, {
          displayName: cleanName,
          email: email.trim(),
        });
      } catch (err) {
        console.warn('Initial Firestore user profile sync non-blocking error:', err);
      }
    } else {
      // Fallback local session when Firebase env vars are not set
      const localUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: name.trim() || (email ? email : 'Account'),
        email: email.trim(),
        role: 'Quantitative Analyst',
        organization: 'Bank Marketing Analytics',
        isAuthenticated: true,
      };
      setUser(localUser);
      localStorage.setItem('apex_local_auth_user', JSON.stringify(localUser));
    }
  };

  const signIn = async (email: string, pass: string) => {
    if (isFirebaseConfigured) {
      const fbUser = await loginWithEmail(email, pass);
      const mappedUser: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || (fbUser.email ? fbUser.email : 'Account'),
        email: fbUser.email || email.trim(),
        role: 'Quantitative Analyst',
        organization: 'Bank Marketing Analytics',
        isAuthenticated: true,
        avatarUrl: fbUser.photoURL || undefined,
      };
      setUser(mappedUser);

      // Sync Firestore users/{uid}
      try {
        await syncUserProfile(fbUser.uid, {
          displayName: fbUser.displayName || '',
          email: fbUser.email || email.trim(),
        });
      } catch (err) {
        console.warn('Firestore signin sync non-blocking error:', err);
      }
    } else {
      // Fallback local session when Firebase env vars are not set
      const localUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: email ? email : 'Account',
        email: email.trim(),
        role: 'Quantitative Analyst',
        organization: 'Bank Marketing Analytics',
        isAuthenticated: true,
      };
      setUser(localUser);
      localStorage.setItem('apex_local_auth_user', JSON.stringify(localUser));
    }
  };

  const signInGoogle = async () => {
    if (isFirebaseConfigured) {
      const fbUser = await loginWithGoogle();
      const mappedUser: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || (fbUser.email ? fbUser.email : 'Account'),
        email: fbUser.email || '',
        role: 'Quantitative Analyst',
        organization: 'Bank Marketing Analytics',
        isAuthenticated: true,
        avatarUrl: fbUser.photoURL || undefined,
      };
      setUser(mappedUser);

      // Sync Firestore users/{uid}
      try {
        await syncUserProfile(fbUser.uid, {
          displayName: fbUser.displayName || '',
          email: fbUser.email || '',
        });
      } catch (err) {
        console.warn('Firestore Google signin sync non-blocking error:', err);
      }
    } else {
      throw new Error(
        'Google Sign-In requires Firebase configuration. Please specify VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID.'
      );
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await logoutUser();
    } else {
      localStorage.removeItem('apex_local_auth_user');
    }
    setUser(null);
    setFirebaseUser(null);
    setIntendedPage(null);
  };

  const updateUserContext = async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (!isFirebaseConfigured) {
        localStorage.setItem('apex_local_auth_user', JSON.stringify(updated));
      }
      return updated;
    });

    if (firebaseUser) {
      if (updates.name && updates.name !== firebaseUser.displayName) {
        try {
          await updateProfile(firebaseUser, { displayName: updates.name });
        } catch {
          // ignore auth profile update error
        }
      }

      try {
        await syncUserProfile(firebaseUser.uid, {
          displayName: updates.name,
          role: updates.role,
          organization: updates.organization,
          email: firebaseUser.email || '',
        });
      } catch (err) {
        console.warn('Failed to update profile in Firestore:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isFirebaseConfigured,
        intendedPage,
        setIntendedPage,
        signUp,
        signIn,
        signInGoogle,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
