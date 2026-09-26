import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile, GoogleAuthProvider, signInWithPopup, signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserProfile = {
  name: string;
  email: string;
  role: 'student' | 'admin';
  subscriptionStatus: 'none' | 'pending' | 'approved';
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'البريد أو كلمة السر غلط.',
  'auth/user-not-found': 'البريد أو كلمة السر غلط.',
  'auth/wrong-password': 'البريد أو كلمة السر غلط.',
  'auth/email-already-in-use': 'البريد ده متسجّل قبل كده. جرّب تسجيل الدخول.',
  'auth/weak-password': 'كلمة السر ضعيفة. استخدم 6 حروف على الأقل.',
  'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة.',
  'auth/too-many-requests': 'محاولات كتير. استنى شوية وجرّب تاني.',
  'auth/popup-closed-by-user': 'اتقفلت نافذة جوجل قبل ما تكمّل الدخول.',
  'auth/network-request-failed': 'مشكلة في الاتصال بالإنترنت.',
};
export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  return (code && ERRORS[code]) || 'حصل خطأ غير متوقع. حاول تاني.';
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(u: User) {
    const snap = await getDoc(doc(db, 'users', u.uid));
    setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await loadProfile(u);
      else setProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signup(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      name, email, role: 'student', subscriptionStatus: 'none',
      createdAt: serverTimestamp(),
    });
    await loadProfile(cred.user);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const ref = doc(db, 'users', result.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        name: result.user.displayName || result.user.email?.split('@')[0] || 'Student',
        email: result.user.email,
        role: 'student', subscriptionStatus: 'none',
        createdAt: serverTimestamp(),
      });
    }
    await loadProfile(result.user);
  }

  async function forgotPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function logout() {
    await signOut(auth);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, loginWithGoogle, forgotPassword, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth لازم يتنادى جوه AuthProvider');
  return ctx;
}
