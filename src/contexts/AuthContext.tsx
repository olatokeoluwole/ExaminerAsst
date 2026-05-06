import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface SchoolData {
  id: string; // Document ID
  email: string;
  name: string;
  maxStudents: number;
  registeredStudentsCount: number;
}

interface AuthContextType {
  user: AuthUser | null;
  school: SchoolData | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateSchool: (data: SchoolData) => void;
  refreshSchool: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSchool = async (currentUserEmail?: string | null) => {
    const emailToUse = currentUserEmail || user?.email;
    if (!emailToUse) return;
    try {
      const q = query(collection(db, 'schools'), where('email', '==', emailToUse));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setSchool({ id: docSnap.id, ...docSnap.data() } as SchoolData);
      } else {
        setSchool(null);
      }
    } catch (e) {
      console.error('Error fetching school', e);
      setSchool(null);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
        
        // Check if admin
        if (firebaseUser.email === 'olatokeoluwole@gmail.com' || firebaseUser.email === 'olatoke@gmail.com') {
          setIsAdmin(true);
          setSchool(null);
        } else {
          setIsAdmin(false);
          await refreshSchool(firebaseUser.email);
        }
      } else {
        setUser(null);
        setSchool(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return unsub;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateSchool = (data: SchoolData) => {
    setSchool(data);
  };

  return (
    <AuthContext.Provider value={{ user, school, isAdmin, isLoading, login, logout, updateSchool, refreshSchool }}>
      {children}
    </AuthContext.Provider>
  );
};
