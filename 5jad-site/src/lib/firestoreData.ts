import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, query, orderBy, where, addDoc, doc, updateDoc,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ---------- Types ----------
export type CourseDoc = {
  id: string; title: string; description: string; lessons: number; duration: string;
  price: string; rating: string; students: string; category: string; tone: string;
};
export type PlanDoc = {
  id: string; name: string; price: string; duration: string; description: string;
  features: string[]; featured?: boolean;
};
export type PaymentRequest = {
  id: string; uid: string; name: string; email: string; plan: string; amount: string;
  receiptUrl?: string; status: 'pending' | 'approved' | 'rejected'; createdAt?: Timestamp;
};
export type NotificationDoc = {
  id: string; uid: string; title: string; body: string; read: boolean; createdAt?: Timestamp;
};

// ---------- Courses ----------
export function useCourses(fallback: CourseDoc[]) {
  const [courses, setCourses] = useState<CourseDoc[]>(fallback);
  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('title'));
    return onSnapshot(q, (snap) => {
      if (snap.empty) { setCourses(fallback); return; }
      setCourses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CourseDoc, 'id'>) })));
    }, () => setCourses(fallback));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return courses;
}

export async function addCourse(course: Omit<CourseDoc, 'id'>) {
  await addDoc(collection(db, 'courses'), { ...course, createdAt: serverTimestamp() });
}

// ---------- Plans ----------
export function usePlans(fallback: PlanDoc[]) {
  const [plans, setPlans] = useState<PlanDoc[]>(fallback);
  useEffect(() => {
    const q = query(collection(db, 'plans'));
    return onSnapshot(q, (snap) => {
      if (snap.empty) { setPlans(fallback); return; }
      setPlans(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PlanDoc, 'id'>) })));
    }, () => setPlans(fallback));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return plans;
}

// ---------- Payment requests ----------
export async function createPaymentRequest(data: {
  uid: string; name: string; email: string; plan: string; amount: string; receiptUrl?: string;
}) {
  await addDoc(collection(db, 'paymentRequests'), {
    ...data, status: 'pending', createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', data.uid), { subscriptionStatus: 'pending', plan: data.plan });
}

export function useMyPaymentRequest(uid: string | undefined) {
  const [request, setRequest] = useState<PaymentRequest | null>(null);
  useEffect(() => {
    if (!uid) { setRequest(null); return; }
    const q = query(collection(db, 'paymentRequests'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setRequest(snap.empty ? null : ({ id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<PaymentRequest, 'id'>) }));
    }, () => setRequest(null));
  }, [uid]);
  return request;
}

export function usePaymentRequestsAdmin() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'paymentRequests'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentRequest, 'id'>) })));
    }, () => setRequests([]));
  }, []);
  return requests;
}

export async function decidePaymentRequest(request: PaymentRequest, approve: boolean) {
  await updateDoc(doc(db, 'paymentRequests', request.id), { status: approve ? 'approved' : 'rejected' });
  await updateDoc(doc(db, 'users', request.uid), { subscriptionStatus: approve ? 'approved' : 'none' });
}

// ---------- Admin stats ----------
export function useAdminStats() {
  const [stats, setStats] = useState({ totalStudents: 0, activeSubscriptions: 0, pendingRequests: 0 });
  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), (snap) => {
      const active = snap.docs.filter((d) => d.data().subscriptionStatus === 'approved').length;
      setStats((s) => ({ ...s, totalStudents: snap.size, activeSubscriptions: active }));
    }, () => {});
    const unsubReq = onSnapshot(query(collection(db, 'paymentRequests'), where('status', '==', 'pending')), (snap) => {
      setStats((s) => ({ ...s, pendingRequests: snap.size }));
    }, () => {});
    return () => { unsubUsers(); unsubReq(); };
  }, []);
  return stats;
}

// ---------- Notifications ----------
export function useNotifications(uid: string | undefined) {
  const [items, setItems] = useState<NotificationDoc[]>([]);
  useEffect(() => {
    if (!uid) { setItems([]); return; }
    const q = query(collection(db, 'notifications'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationDoc, 'id'>) })));
    }, () => setItems([]));
  }, [uid]);
  return items;
}
