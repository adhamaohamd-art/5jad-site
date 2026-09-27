import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, query, orderBy, where, addDoc, doc, updateDoc, deleteDoc,
  getDoc, getDocs, setDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ---------- Types ----------
export type CourseDoc = {
  id: string; title: string; description: string; lessons: number; duration: string;
  price: string; rating: string; students: string; category: string; tone: string;
  videoUrl?: string; planAccess?: string; // 'all' or a plan id
};
export type PlanDoc = {
  id: string; name: string; price: string; duration: string; description: string;
  features: string[]; featured?: boolean;
};
export type PaymentRequest = {
  id: string; uid: string; name: string; email: string; plan: string; planId?: string; amount: string;
  receiptUrl?: string; status: 'pending' | 'approved' | 'rejected'; createdAt?: Timestamp;
};
export type NotificationDoc = {
  id: string; uid: string; title: string; body: string; read: boolean; createdAt?: Timestamp;
};
export type SiteSettings = {
  aboutText: string;
  feedbackTitle: string;
  vodafoneCash: string;
  instapay: string;
};
export type MaterialDoc = {
  id: string; title: string; url: string; type: 'pdf' | 'link'; planAccess: string;
};
export type ExamQuestion = { id: string; text: string; options: string[]; correctIndex: number };
export type ExamDoc = {
  id: string; title: string; courseTitle: string; planAccess: string; passMark: number;
  questions: ExamQuestion[];
};
export type ExamResult = {
  id: string; uid: string; examId: string; examTitle: string; score: number; total: number;
  percent: number; createdAt?: Timestamp;
};
export type FeedbackDoc = { id: string; name: string; role: string; quote: string };
export type StudentRow = { uid: string; name: string; email: string; plan?: string; subscriptionStatus?: string };

const DEFAULT_SETTINGS: SiteSettings = {
  aboutText: '5JAD is a modern learning space for people who want more than another open tab. We pair expert-led lessons with the structure, warmth, and freedom to help you keep going.',
  feedbackTitle: 'Learners say it best',
  vodafoneCash: '',
  instapay: '',
};

// ---------- Courses ----------
export function useCourses() {
  const [courses, setCourses] = useState<CourseDoc[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('title'));
    return onSnapshot(q, (snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CourseDoc, 'id'>) })));
    }, () => setCourses([]));
  }, []);
  return courses;
}

export async function addCourse(course: Omit<CourseDoc, 'id'>) {
  await addDoc(collection(db, 'courses'), { ...course, createdAt: serverTimestamp() });
}
export async function updateCourse(id: string, data: Partial<Omit<CourseDoc, 'id'>>) {
  await updateDoc(doc(db, 'courses', id), data);
}
export async function deleteCourse(id: string) {
  await deleteDoc(doc(db, 'courses', id));
}

// ---------- Lessons (videos جوه كل كورس) ----------
// كل كورس بقى بيحتوي على مجموعة فرعية "lessons" بدل ما يبقى ليه فيديو واحد بس.
// كده الأدمن يقدر ينشئ الكورس فاضي الأول، وبعدين يضيف فيديوهات فيه في أي وقت،
// ويعدّل عليها أو يمسحها من غير ما يمس باقي بيانات الكورس.
export type LessonDoc = {
  id: string; title: string; videoUrl: string; order: number; createdAt?: Timestamp;
};

export function useLessonsForCourse(courseId: string | undefined) {
  const [items, setItems] = useState<LessonDoc[]>([]);
  useEffect(() => {
    if (!courseId) { setItems([]); return; }
    const q = query(collection(db, 'courses', courseId, 'lessons'), orderBy('order'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LessonDoc, 'id'>) })));
    }, () => setItems([]));
  }, [courseId]);
  return items;
}

export async function addLesson(courseId: string, lesson: { title: string; videoUrl: string; order: number }) {
  await addDoc(collection(db, 'courses', courseId, 'lessons'), { ...lesson, createdAt: serverTimestamp() });
}
export async function updateLesson(courseId: string, lessonId: string, data: Partial<Omit<LessonDoc, 'id'>>) {
  await updateDoc(doc(db, 'courses', courseId, 'lessons', lessonId), data);
}
export async function deleteLesson(courseId: string, lessonId: string) {
  await deleteDoc(doc(db, 'courses', courseId, 'lessons', lessonId));
}

// ---------- Plans ----------
// أي مستند باقة جاي من Firestore من غير حقل features (اتضاف يدوي، أو من نسخة قديمة
// من الأدمن) كان بيوقّع الشاشة كلها بيضا لأن الكود بعدين بيعمل plan.features.map(...)
// على undefined. بنظبّطها هنا مرة واحدة عشان أي مكان تاني في الموقع يستخدم plans
// يكون مطمّن إنها دايمًا array.
function normalizePlan(id: string, data: Omit<PlanDoc, 'id'>): PlanDoc {
  return { id, ...data, features: Array.isArray(data.features) ? data.features : [] };
}

export function usePlans() {
  const [plans, setPlans] = useState<PlanDoc[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'plans'));
    return onSnapshot(q, (snap) => {
      setPlans(snap.docs.map((d) => normalizePlan(d.id, d.data() as Omit<PlanDoc, 'id'>)));
    }, () => setPlans([]));
  }, []);
  return plans;
}

export async function addPlan(plan: Omit<PlanDoc, 'id'>) {
  await addDoc(collection(db, 'plans'), plan);
}
export async function updatePlan(id: string, data: Partial<Omit<PlanDoc, 'id'>>) {
  await updateDoc(doc(db, 'plans', id), data);
}
export async function deletePlan(id: string) {
  await deleteDoc(doc(db, 'plans', id));
}

// ---------- Site settings ----------
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'site'), (snap) => {
      setSettings(snap.exists() ? { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SiteSettings>) } : DEFAULT_SETTINGS);
    }, () => setSettings(DEFAULT_SETTINGS));
  }, []);
  return settings;
}

export async function updateSiteSettings(data: Partial<SiteSettings>) {
  await setDoc(doc(db, 'settings', 'site'), data, { merge: true });
}

// ---------- Feedback ----------
export function useFeedback() {
  const [items, setItems] = useState<FeedbackDoc[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FeedbackDoc, 'id'>) })));
    }, () => setItems([]));
  }, []);
  return items;
}
export async function addFeedback(item: Omit<FeedbackDoc, 'id'>) {
  await addDoc(collection(db, 'feedback'), { ...item, createdAt: serverTimestamp() });
}
export async function deleteFeedback(id: string) {
  await deleteDoc(doc(db, 'feedback', id));
}

// ---------- Materials ----------
function matchesAccess(planAccess: string | undefined, myPlan: string | undefined) {
  if (!planAccess || planAccess === 'all') return true;
  return planAccess === myPlan;
}

export function useMaterialsForStudent(myPlan: string | undefined) {
  const [items, setItems] = useState<MaterialDoc[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'materials'), orderBy('title'));
    return onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MaterialDoc, 'id'>) }));
      setItems(all.filter((m) => matchesAccess(m.planAccess, myPlan)));
    }, () => setItems([]));
  }, [myPlan]);
  return items;
}
export function useMaterialsAdmin() {
  const [items, setItems] = useState<MaterialDoc[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'materials'), orderBy('title'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MaterialDoc, 'id'>) })));
    }, () => setItems([]));
  }, []);
  return items;
}
export async function addMaterial(material: Omit<MaterialDoc, 'id'>) {
  await addDoc(collection(db, 'materials'), material);
}
export async function deleteMaterial(id: string) {
  await deleteDoc(doc(db, 'materials', id));
}

// ---------- Exams ----------
// نفس المبدأ: امتحان من غير questions[]، أو سؤال من غير options[]، كان بيكسّر
// الصفحة كلها. بنتأكد هنا إن كل امتحان راجع من Firestore شكله سليم دايمًا.
function normalizeExam(id: string, data: Omit<ExamDoc, 'id'>): ExamDoc {
  const questions = Array.isArray(data.questions) ? data.questions : [];
  return {
    id,
    ...data,
    questions: questions.map((q, idx) => ({
      id: q?.id ?? String(idx),
      text: q?.text ?? '',
      options: Array.isArray(q?.options) ? q.options : [],
      correctIndex: typeof q?.correctIndex === 'number' ? q.correctIndex : 0,
    })),
  };
}

export function useExamsForStudent(myPlan: string | undefined) {
  const [items, setItems] = useState<ExamDoc[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'exams'), orderBy('title'));
    return onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => normalizeExam(d.id, d.data() as Omit<ExamDoc, 'id'>));
      setItems(all.filter((e) => matchesAccess(e.planAccess, myPlan)));
    }, () => setItems([]));
  }, [myPlan]);
  return items;
}
export function useExamsAdmin() {
  const [items, setItems] = useState<ExamDoc[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'exams'), orderBy('title'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => normalizeExam(d.id, d.data() as Omit<ExamDoc, 'id'>)));
    }, () => setItems([]));
  }, []);
  return items;
}
export async function addExam(exam: Omit<ExamDoc, 'id'>) {
  await addDoc(collection(db, 'exams'), exam);
}
export async function deleteExam(id: string) {
  await deleteDoc(doc(db, 'exams', id));
}

export function useMyExamResults(uid: string | undefined) {
  const [items, setItems] = useState<ExamResult[]>([]);
  useEffect(() => {
    if (!uid) { setItems([]); return; }
    const q = query(collection(db, 'examResults'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ExamResult, 'id'>) })));
    }, () => setItems([]));
  }, [uid]);
  return items;
}
export async function submitExamResult(data: { uid: string; examId: string; examTitle: string; score: number; total: number }) {
  const percent = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
  await addDoc(collection(db, 'examResults'), { ...data, percent, createdAt: serverTimestamp() });
}

// ---------- Payment requests ----------
export async function createPaymentRequest(data: {
  uid: string; name: string; email: string; planId: string; plan: string; amount: string; receiptUrl?: string;
}) {
  await addDoc(collection(db, 'paymentRequests'), {
    ...data, status: 'pending', createdAt: serverTimestamp(),
  });
  // بنخزّن الـ planId في مستند المستخدم عشان نقدر نربط الفيديوهات/الماتريال/الامتحانات بالباقة
  await updateDoc(doc(db, 'users', data.uid), { subscriptionStatus: 'pending', plan: data.planId });
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

// ---------- Students (admin) ----------
export function useStudentsAdmin() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    return onSnapshot(q, (snap) => {
      setStudents(snap.docs.map((d) => {
        const data = d.data() as { name?: string; email?: string; plan?: string; subscriptionStatus?: string };
        return { uid: d.id, name: data.name || data.email || 'Student', email: data.email || '', plan: data.plan, subscriptionStatus: data.subscriptionStatus };
      }));
    }, () => setStudents([]));
  }, []);
  return students;
}

// ---------- Admin stats ----------
// بعد الريفريش كانت الأرقام بترجع 0 لحظة ما الصفحة بتتحمّل من جديد، لأن أول
// snapshot لسه ما وصلش من فايربيز. بنفرّق دلوقتي بين "لسه بيحمّل" و"فعلاً صفر"
// عشان الشاشة تعرض حالة تحميل بدل ما توهم إن مفيش طلاب خالص.
export function useAdminStats() {
  const [stats, setStats] = useState({ totalStudents: 0, activeSubscriptions: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let usersLoaded = false;
    let reqLoaded = false;
    const checkLoaded = () => { if (usersLoaded && reqLoaded) setLoading(false); };
    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), (snap) => {
      const active = snap.docs.filter((d) => d.data().subscriptionStatus === 'approved').length;
      setStats((s) => ({ ...s, totalStudents: snap.size, activeSubscriptions: active }));
      usersLoaded = true; checkLoaded();
    }, () => { usersLoaded = true; checkLoaded(); });
    const unsubReq = onSnapshot(query(collection(db, 'paymentRequests'), where('status', '==', 'pending')), (snap) => {
      setStats((s) => ({ ...s, pendingRequests: snap.size }));
      reqLoaded = true; checkLoaded();
    }, () => { reqLoaded = true; checkLoaded(); });
    return () => { unsubUsers(); unsubReq(); };
  }, []);
  return { ...stats, loading };
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

export async function sendNotification(opts: {
  targetType: 'all' | 'plan' | 'student';
  targetValue?: string; // plan id/name, or student uid
  title: string;
  body: string;
}) {
  let uids: string[] = [];
  if (opts.targetType === 'student' && opts.targetValue) {
    uids = [opts.targetValue];
  } else {
    const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
    uids = snap.docs
      .filter((d) => opts.targetType === 'all' || d.data().plan === opts.targetValue)
      .map((d) => d.id);
  }
  await Promise.all(uids.map((uid) => addDoc(collection(db, 'notifications'), {
    uid, title: opts.title, body: opts.body, read: false, createdAt: serverTimestamp(),
  })));
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, 'notifications', id), { read: true });
}

// re-export helpers some callers may want
export { getDoc };
