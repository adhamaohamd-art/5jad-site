import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserProfile = {
  name: string;
  email: string;
  role: 'student' | 'admin';
  subscriptionStatus: 'none' | 'pending' | 'approved';
  plan?: string;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

// المنصة بتستخدم تسجيل الدخول بجوجل بس (Firebase Authentication)، ودور الأدمن
// بيتحدد من حقل role في مستند المستخدم في Firestore، مش من نوع تسجيل الدخول.
const ERRORS: Record<string, string> = {
  'auth/popup-closed-by-user': 'اتقفلت نافذة جوجل قبل ما تكمّل الدخول.',
  'auth/popup-blocked': 'المتصفح منع فتح نافذة جوجل. اسمح بالنوافذ المنبثقة وجرّب تاني.',
  'auth/network-request-failed': 'مشكلة في الاتصال بالإنترنت.',
  'auth/too-many-requests': 'محاولات كتير. استنى شوية وجرّب تاني.',
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

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    // اشتراك بحساب Gmail فقط، زي ما هو متطلَّب
    provider.setCustomParameters({ prompt: 'select_account' });
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

  async function logout() {
    await signOut(auth);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth لازم يتنادى جوه AuthProvider');
  return ctx;
}
