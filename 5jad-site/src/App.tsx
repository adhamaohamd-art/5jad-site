import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  PlayCircle,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth, friendlyAuthError, type UserProfile } from './context/AuthContext';
import {
  useCourses, usePlans, useMyPaymentRequest, usePaymentRequestsAdmin, useNotifications, useAdminStats,
  useSiteSettings, useFeedback, useMaterialsForStudent, useMaterialsAdmin, useExamsForStudent, useExamsAdmin,
  useMyExamResults, useStudentsAdmin, useLessonsForCourse,
  createPaymentRequest, decidePaymentRequest, addCourse, deleteCourse,
  addPlan, deletePlan, updateSiteSettings, addFeedback, deleteFeedback,
  addMaterial, deleteMaterial, addExam, deleteExam, submitExamResult, sendNotification, markNotificationRead,
  addLesson, deleteLesson, updateUserProfile,
  type CourseDoc, type PlanDoc, type PaymentRequest, type ExamDoc, type ExamQuestion, type LessonDoc,
} from './lib/firestoreData';
import { uploadFile } from './lib/cloudinary';
import { toEmbedUrl } from './lib/video';
import { translate, type Lang, type DictKey } from './lib/translations';

type View = 'home' | 'courses' | 'course' | 'auth' | 'dashboard' | 'plans' | 'admin';
type DashboardSection = 'overview' | 'courses' | 'exams' | 'materials' | 'grades' | 'subscription' | 'notifications' | 'profile' | 'plans' | 'content';
type T = (key: DictKey) => string;

const mountainImage = 'https://images.pexels.com/photos/19542085/pexels-photo-19542085.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

// بعض حسابات جوجل بترجع الاسم متكرر (زي "adham adham")، فبنشيل أي كلمة
// متكررة ورا نفسها عشان ما يبانش الاسم مكرر في شريط الداشبورد أو في الـ initials.
function cleanDisplayName(raw: string | undefined, fallback: string): string {
  const source = (raw || fallback).trim();
  const words = source.split(/\s+/);
  const deduped = words.filter((word, i) => i === 0 || word.toLowerCase() !== words[i - 1].toLowerCase());
  return deduped.join(' ') || fallback;
}

function App() {
  const { user, profile, loading, logout, refreshProfile } = useAuth();
  const [view, setView] = useState<View>('home');
  const [activeCourse, setActiveCourse] = useState<CourseDoc | null>(null);
  const [dashboardSection, setDashboardSection] = useState<DashboardSection>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Lang>('EN');
  const [toast, setToast] = useState('');
  // لحد ما نتأكد فايربيز رجّع حالة الدخول (بعد الريفريش)، منسيبش الصفحة العامة
  // تترسم أصلاً؛ عشان كده بيبان "فلاش" لصفحة الهبوط لحظة قبل ما يرجع الداشبورد.
  const [initializing, setInitializing] = useState(true);
  const isDashboard = view === 'dashboard' || view === 'admin';
  const liveCourses = useCourses();
  const livePlans = usePlans();
  const t: T = (key) => translate(language, key);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  // بعد ما تسجيل الدخول يخلص وبروفايل المستخدم يتحمّل، ندخله على لوحته على طول
  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        setView(profile.role === 'admin' ? 'admin' : 'dashboard');
      }
      setInitializing(false);
    }
  }, [loading, user, profile]);

  // الطالب لازم يفضل واقف على صفحة الاشتراكات لحد ما يتفعّل اشتراكه من الأدمن
  useEffect(() => {
    if (!loading && user && profile && profile.role !== 'admin' && profile.subscriptionStatus !== 'approved') {
      setDashboardSection('subscription');
    }
  }, [loading, user, profile]);

  const openCourse = (course: CourseDoc) => {
    setActiveCourse(course);
    setView('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // "About Us" و"Feedback" قسمين موجودين جوه صفحة الـ Home بس. لو المستخدم واقف في
  // صفحة تانية (Courses مثلاً) لازم نرجّعه لـ Home الأول، ونستنى الصفحة تترسم،
  // وبعدين نعمل scroll للقسم. المرة اللي فاتت كان الكود بيدور على العنصر على طول
  // فمكنش بيلاقيه غير وهو واقف في Home أصلاً.
  const goToSection = (id: 'about' | 'feedback') => {
    setView('home');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }));
  };

  const handleExit = async () => {
    await logout();
    setView('home');
  };

  if (initializing) {
    return (
      <main className="app-splash">
        <div className="brand"><span className="brand-five">5</span>JAD</div>
        <span className="app-spinner" />
      </main>
    );
  }

  return (
    <main className={language === 'AR' ? 'rtl' : ''} dir={language === 'AR' ? 'rtl' : 'ltr'} style={{ backgroundImage: `linear-gradient(180deg, rgba(248,246,241,.42), rgba(237,232,225,.7)), url(${mountainImage})` }}>
      <div className="site-wrap">
        {!isDashboard && <PublicHeader view={view} language={language} onLanguage={() => setLanguage(language === 'EN' ? 'AR' : 'EN')} onNavigate={setView} onSection={goToSection} onMenu={() => setMenuOpen(!menuOpen)} t={t} />}
        {isDashboard ? (
          <DashboardShell
            admin={view === 'admin'}
            section={dashboardSection}
            onSection={setDashboardSection}
            onExit={handleExit}
            onToast={showToast}
            profile={profile}
            onProfileSaved={refreshProfile}
            uid={user?.uid}
            plans={livePlans}
            courses={liveCourses}
            t={t}
          />
        ) : (
          <>
            {menuOpen && <MobileMenu onNavigate={setView} onClose={() => setMenuOpen(false)} t={t} />}
            {view === 'home' && <Home onExplore={() => setView('courses')} onCourse={openCourse} onAuth={() => setView('auth')} courses={liveCourses} t={t} />}
            {view === 'courses' && <Courses onCourse={openCourse} onBack={() => setView('home')} courses={liveCourses} t={t} />}
            {view === 'course' && activeCourse && <CourseDetails course={activeCourse} onBack={() => setView('courses')} onEnroll={() => setView(user ? 'dashboard' : 'auth')} t={t} />}
            {view === 'auth' && <Auth onBack={() => setView('home')} onContinue={() => showToast('Welcome to 5JAD.')} t={t} />}
            {view === 'plans' && <Plans onBack={() => setView('home')} onSelect={() => setView(user ? 'dashboard' : 'auth')} plans={livePlans} t={t} />}
            <Footer t={t} />
          </>
        )}
      </div>
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </main>
  );
}

function PublicHeader({ view, language, onLanguage, onNavigate, onSection, onMenu, t }: { view: View; language: Lang; onLanguage: () => void; onNavigate: (view: View) => void; onSection: (id: 'about' | 'feedback') => void; onMenu: () => void; t: T }) {
  return <header className="topbar glass-panel">
    <button className="brand" onClick={() => onNavigate('home')} aria-label="5JAD home"><span className="brand-mark"><GraduationCap size={26} strokeWidth={1.5} /></span><span className="brand-five">5</span><span>JAD</span></button>
    <nav className="desktop-nav"><button className={view === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}>{t('nav.home')}</button><button onClick={() => onSection('about')}>{t('nav.about')}</button><button className={view === 'courses' ? 'active' : ''} onClick={() => onNavigate('courses')}>{t('nav.courses')}</button><button onClick={() => onSection('feedback')}>{t('nav.feedback')}</button></nav>
    <div className="top-actions"><button className="language" onClick={onLanguage}><span className="globe">◎</span>{language} / {language === 'EN' ? 'AR' : 'EN'}</button><button className="icon-btn" aria-label="Sign in" onClick={() => onNavigate('auth')}><UserRound size={18} /></button><button className="menu-btn" onClick={onMenu} aria-label="Open menu"><Menu size={21} /></button></div>
  </header>;
}

function MobileMenu({ onNavigate, onClose, t }: { onNavigate: (view: View) => void; onClose: () => void; t: T }) {
  return <div className="mobile-menu glass-panel"><button onClick={onClose} className="close-menu"><X size={18} /></button><button onClick={() => { onNavigate('home'); onClose(); }}>{t('nav.home')}</button><button onClick={() => { onNavigate('courses'); onClose(); }}>{t('nav.courses')}</button><button onClick={() => { onNavigate('auth'); onClose(); }}>{t('nav.signIn')}</button></div>;
}

function Home({ onExplore, onCourse, onAuth, courses, t }: { onExplore: () => void; onCourse: (course: CourseDoc) => void; onAuth: () => void; courses: CourseDoc[]; t: T }) {
  const settings = useSiteSettings();
  const feedback = useFeedback();
  return <div className="page home-page">
    <section className="hero"><div className="eyebrow"><Sparkles size={15} /> Learn with intention</div><h1>{t('hero.title1')}<br /><em>{t('hero.titleEm')}</em></h1><p>{t('hero.desc')}</p><div className="hero-actions"><button className="primary-btn" onClick={onExplore}>{t('hero.explore')} <ArrowRight size={17} /></button><button className="text-btn" onClick={onAuth}>{t('hero.student')} <ArrowRight size={16} /></button></div><div className="hero-note"><div className="avatar-stack"><span>H</span><span>M</span><span>S</span><span>+</span></div><span>{t('hero.note')}</span></div></section>
    <section className="stats-row"><div><strong>50k+</strong><span>{t('stats.learners')}</span></div><div><strong>200+</strong><span>{t('stats.instructors')}</span></div><div><strong>95%</strong><span>{t('stats.completion')}</span></div></section>
    <section className="section" id="courses"><SectionHeading label={t('popular.label')} title={t('popular.title')} action={t('popular.seeAll')} onAction={onExplore} />
      {courses.length === 0
        ? <EmptyState title={t('courses.empty')} text={t('courses.emptyDesc')} />
        : <div className="course-grid featured-grid">{courses.slice(0, 3).map(course => <CourseCard key={course.id} course={course} onOpen={onCourse} />)}</div>}
    </section>
    <section className="about-section" id="about"><div className="about-orbit"><div className="orbit-dot" /><GraduationCap size={46} strokeWidth={1.2} /></div><div><div className="eyebrow">{t('about.label')}</div><h2>{t('about.title1')}<br /><em>{t('about.titleEm')}</em></h2><p>{settings.aboutText}</p><button className="secondary-btn" onClick={() => onExplore()}>{t('about.discover')} <ArrowRight size={16} /></button></div></section>
    <section className="section" id="feedback"><SectionHeading label={t('feedback.label')} title={settings.feedbackTitle || t('feedback.title')} />
      {feedback.length === 0
        ? <EmptyState title={t('feedback.empty')} text={t('feedback.emptyDesc')} />
        : <div className="feedback-grid">{feedback.map(item => <FeedbackCard key={item.id} quote={item.quote} name={item.name} role={item.role} />)}</div>}
    </section>
  </div>;
}

function SectionHeading({ label, title, action, onAction }: { label: string; title: string; action?: string; onAction?: () => void }) { return <div className="section-heading"><div><div className="eyebrow">{label}</div><h2>{title}</h2></div>{action && <button className="link-btn" onClick={onAction}>{action} <ArrowRight size={15} /></button>}</div>; }

function CourseCard({ course, onOpen }: { course: CourseDoc; onOpen: (course: CourseDoc) => void }) { return <article className="course-card"><button className={`course-art ${course.tone}`} onClick={() => onOpen(course)} aria-label={`Open ${course.title}`}><div className="art-shape shape-one" /><div className="art-shape shape-two" /><span className="category-pill">{course.category}</span><PlayCircle size={25} className="play-icon" /></button><div className="course-info"><div className="course-title-row"><h3>{course.title}</h3><strong>{course.price}</strong></div><p>{course.lessons} lessons <span>•</span> {course.duration}</p><div className="course-meta"><span><Star size={14} fill="currentColor" /> {course.rating} <small>({course.students})</small></span><button onClick={() => onOpen(course)}>View course <ArrowRight size={14} /></button></div></div></article>; }

function Courses({ onCourse, onBack, courses, t }: { onCourse: (course: CourseDoc) => void; onBack: () => void; courses: CourseDoc[]; t: T }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => courses.filter(course => `${course.title} ${course.category}`.toLowerCase().includes(query.toLowerCase())), [query, courses]);
  return <div className="page listing-page"><button className="back-btn" onClick={onBack}>{t('courses.backHome')}</button><div className="listing-hero"><div><div className="eyebrow">{t('courses.label')}</div><h1>{t('courses.title')}</h1><p>{t('courses.desc')}</p></div><div className="search-box"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={t('courses.search')} /></div></div>
    {courses.length === 0
      ? <EmptyState title={t('courses.empty')} text={t('courses.emptyDesc')} />
      : <>
        <div className="course-grid">{filtered.map(course => <CourseCard key={course.id} course={course} onOpen={onCourse} />)}</div>
        {filtered.length === 0 && <EmptyState title={t('courses.notFound')} text={t('courses.tryDifferent')} />}
      </>}
  </div>;
}

function CourseDetails({ course, onBack, onEnroll, t }: { course: CourseDoc; onBack: () => void; onEnroll: () => void; t: T }) { return <div className="page detail-page"><button className="back-btn" onClick={onBack}>{t('detail.back')}</button><div className="detail-grid"><div><div className={`course-art detail-art ${course.tone}`}><div className="art-shape shape-one" /><div className="art-shape shape-two" /><span className="category-pill">{course.category}</span><PlayCircle size={34} className="play-icon" /></div><div className="detail-copy"><div className="eyebrow">{t('detail.guided')}</div><h1>{course.title}</h1><p>{course.description}</p><div className="detail-stats"><span><BookOpen size={17} /> {course.lessons} {t('detail.lessons')}</span><span><Clock3 size={17} /> {course.duration}</span><span><Star size={17} fill="currentColor" /> {course.rating} rating</span></div><h3>{t('detail.learn')}</h3><div className="check-list"><span><Check size={15} /> {t('detail.point1')}</span><span><Check size={15} /> {t('detail.point2')}</span><span><Check size={15} /> {t('detail.point3')}</span></div></div></div><aside className="enroll-card glass-card"><div className="eyebrow">{t('detail.startToday')}</div><div className="price-large">{course.price}<span> {t('detail.oneTime')}</span></div><p>{t('detail.getAccess')}</p><button className="primary-btn full" onClick={onEnroll}>{t('detail.enroll')} <ArrowRight size={17} /></button><div className="secure-note"><ShieldCheck size={16} /> {t('detail.secure')}</div></aside></div></div>; }

function FeedbackCard({ quote, name, role }: { quote: string; name: string; role: string }) { return <article className="feedback-card glass-card"><div className="stars">★★★★★</div><p>“{quote}”</p><div className="person"><span>{name.split(' ').map(part => part[0]).join('')}</span><div><strong>{name}</strong><small>{role}</small></div></div></article>; }

function Auth({ onBack, onContinue, t }: { onBack: () => void; onContinue: () => void; t: T }) {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setError(''); setBusy(true);
    try {
      await loginWithGoogle();
      onContinue();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return <div className="page auth-page"><button className="back-btn" onClick={onBack}>{t('auth.backHome')}</button><div className="auth-layout"><div className="auth-message"><div className="eyebrow"><Sparkles size={15} /> {t('auth.tagline')}</div><h1>{t('auth.title1')}<br /><em>{t('auth.titleEm')}</em></h1><p>{t('auth.desc')}</p><div className="auth-quote">“{t('auth.quote')}”<small>{t('auth.quoteAuthor')}</small></div></div><div className="glass-card auth-card"><div className="auth-card-heading"><h2>{t('auth.welcome')}</h2><p>{t('auth.continueDesc')}</p></div>
    {error && <div className="auth-form-alert error">{error}</div>}
    <button type="button" className="primary-btn full" onClick={handleGoogle} disabled={busy}>{busy ? t('auth.pleaseWait') : t('auth.continueGoogle')} <ArrowRight size={17} /></button>
    <p className="terms">{t('auth.terms')}</p></div></div></div>;
}

function Plans({ onBack, onSelect, plans, t }: { onBack: () => void; onSelect: () => void; plans: PlanDoc[]; t: T }) { return <div className="page plans-page"><button className="back-btn" onClick={onBack}>{t('plans.backHome')}</button><div className="center-heading"><div className="eyebrow">{t('plans.label')}</div><h1>{t('plans.title')}</h1><p>{t('plans.desc')}</p></div>
  {plans.length === 0
    ? <EmptyState title={t('plans.empty')} text={t('plans.emptyDesc')} />
    : <div className="plan-grid">{plans.map(plan => <article key={plan.id} className={`plan-card glass-card ${plan.featured ? 'featured' : ''}`}>{plan.featured && <span className="recommended">{t('plans.mostPopular')}</span>}<div className="plan-icon"><Target size={19} /></div><h2>{plan.name}</h2><p>{plan.description}</p><div className="plan-price">{plan.price}<small>{plan.duration}</small></div><ul>{plan.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul><button className={plan.featured ? 'primary-btn full' : 'secondary-btn full'} onClick={onSelect}>{t('plans.choose')} <ArrowRight size={16} /></button></article>)}</div>}
  <div className="payment-note glass-card"><ShieldCheck size={22} /><div><strong>{t('plans.noteTitle')}</strong><p>{t('plans.noteDesc')}</p></div></div></div>; }

function DashboardShell({ admin, section, onSection, onExit, onToast, profile, uid, plans, courses, t, onProfileSaved }: {
  admin: boolean; section: DashboardSection; onSection: (section: DashboardSection) => void; onExit: () => void;
  onToast: (message: string) => void; profile: UserProfile | null; uid?: string; plans: PlanDoc[]; courses: CourseDoc[]; t: T;
  onProfileSaved: () => Promise<void> | void;
}) {
  const nav = admin
    ? [
      { id: 'overview' as const, label: t('dash.overview'), icon: LayoutDashboard },
      { id: 'courses' as const, label: t('dash.courses'), icon: BookOpen },
      { id: 'materials' as const, label: t('dash.materials'), icon: FileText },
      { id: 'exams' as const, label: t('dash.exams'), icon: Target },
      { id: 'plans' as const, label: t('dash.plans'), icon: Wallet },
      { id: 'subscription' as const, label: t('dash.paymentRequests'), icon: ShieldCheck },
      { id: 'notifications' as const, label: t('dash.notifications'), icon: Bell },
      { id: 'content' as const, label: t('dash.content'), icon: SettingsIcon },
    ]
    : [
      { id: 'overview' as const, label: t('dash.home'), icon: LayoutDashboard },
      { id: 'courses' as const, label: t('dash.myCourses'), icon: BookOpen },
      { id: 'materials' as const, label: t('dash.materials'), icon: FileText },
      { id: 'exams' as const, label: t('dash.exams'), icon: Target },
      { id: 'grades' as const, label: t('dash.progress'), icon: Trophy },
      { id: 'subscription' as const, label: t('dash.settings'), icon: SettingsIcon },
    ];
  const displayName = cleanDisplayName(profile?.name, admin ? 'Admin' : 'Student');
  const initials = displayName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const notifications = useNotifications(uid);
  const unreadCount = notifications.filter(n => !n.read).length;
  // لحد ما الأدمن يفعّل الاشتراك، الأقسام المفتوحة للطالب هي بس "Subscription" و"Profile settings"
  const isLocked = (id: DashboardSection) => !admin && profile?.subscriptionStatus !== 'approved' && id !== 'subscription' && id !== 'profile';
  const goTo = (id: DashboardSection) => {
    if (isLocked(id)) { onToast('القسم ده هيتفتح تلقائيًا بعد ما الأدمن يوافق على اشتراكك.'); return; }
    onSection(id);
  };

  // مينيو الحساب اللي بيفتح تحت السهم جمب الاسم؛ بيتقفل لو دُس بره منه
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!accountMenuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [accountMenuOpen]);

  return <div className="dashboard-layout"><aside className="dash-sidebar glass-panel"><button className="brand" onClick={() => goTo('overview')}><span className="brand-mark"><GraduationCap size={24} strokeWidth={1.5} /></span><span className="brand-five">5</span><span>JAD</span></button><div className="dash-label">{admin ? 'Workspace' : 'Learning space'}</div><nav>{nav.map(item => { const Icon = item.icon; const locked = isLocked(item.id); return <button key={item.id} className={`${section === item.id ? 'active' : ''} ${locked ? 'nav-locked' : ''}`} onClick={() => goTo(item.id)} aria-disabled={locked}><Icon size={17} />{item.label}{locked && <LockKeyhole size={13} className="lock-badge" />}</button>; })}</nav><div className="sidebar-bottom"><button onClick={onExit}><ArrowRight size={17} /> {t('dash.signOut')}</button></div></aside><section className="dashboard-main"><header className="dash-topbar"><div><span className="dash-kicker">{admin ? t('dash.adminWorkspace') : t('dash.welcomeBack')}</span><h1>{t('dash.goodMorning')}, {displayName.split(' ')[0]}.</h1></div><div className="dash-actions"><button className="icon-btn"><Search size={18} /></button><button className="icon-btn notification" onClick={() => !admin && goTo('notifications' as DashboardSection)} style={{ position: 'relative' }}><Bell size={18} />{unreadCount > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#c0596b' }} />}</button><div className="account-menu-wrap" ref={accountMenuRef} style={{ position: 'relative' }}><button className="account-chip" onClick={() => setAccountMenuOpen(open => !open)} aria-expanded={accountMenuOpen} aria-haspopup="true"><span>{initials}</span><span className="account-name">{displayName}</span><ChevronDown size={15} /></button>{accountMenuOpen && <div className="account-dropdown glass-card" style={{ position: 'absolute', top: '110%', right: 0, minWidth: 180, zIndex: 20, padding: 6, display: 'grid', gap: 2 }}><button className="text-btn" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => { setAccountMenuOpen(false); goTo('profile' as DashboardSection); }}><SettingsIcon size={15} /> Profile settings</button><button className="text-btn" style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => { setAccountMenuOpen(false); onExit(); }}><ArrowRight size={15} /> {t('dash.signOut')}</button></div>}</div></div></header>{admin ? <AdminContent section={section} onToast={onToast} onSection={onSection} courses={courses} plans={plans} profile={profile} uid={uid} onProfileSaved={onProfileSaved} /> : <StudentContent section={section} onSection={onSection} onToast={onToast} profile={profile} uid={uid} plans={plans} courses={courses} onProfileSaved={onProfileSaved} />}</section></div>;
}

function ProfileView({ profile, uid, admin, onToast, onProfileSaved }: { profile: UserProfile | null; uid?: string; admin: boolean; onToast: (message: string) => void; onProfileSaved: () => Promise<void> | void }) {
  const [name, setName] = useState(profile?.name || '');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setName(profile?.name || ''); }, [profile?.name]);

  async function save() {
    if (!uid || !name.trim()) return;
    setBusy(true);
    try {
      await updateUserProfile(uid, { name: name.trim() });
      await onProfileSaved();
      onToast('Profile updated.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Account</span><h2>Profile settings</h2><p>Update how your name appears across 5JAD.</p></div></div>
    <div className="subscription-card glass-card" style={{ maxWidth: 480 }}>
      <label>Full name<input value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Email<input value={profile?.email || ''} disabled /></label>
      <label>Role<input value={admin ? 'Admin' : 'Student'} disabled /></label>
      <button className="primary-btn full" onClick={save} disabled={busy || !name.trim()}>{busy ? 'Saving…' : 'Save changes'}</button>
    </div>
  </div>;
}

function StudentContent({ section, onSection, onToast, profile, uid, plans, courses, onProfileSaved }: {
  section: DashboardSection; onSection: (section: DashboardSection) => void; onToast: (message: string) => void;
  profile: UserProfile | null; uid?: string; plans: PlanDoc[]; courses: CourseDoc[]; onProfileSaved: () => Promise<void> | void;
}) {
  if (section === 'profile') return <ProfileView profile={profile} uid={uid} admin={false} onToast={onToast} onProfileSaved={onProfileSaved} />;
  if (section === 'subscription') return <SubscriptionView onToast={onToast} profile={profile} uid={uid} plans={plans} />;
  if (section === 'courses') return <CourseProgressView courses={courses} unlocked={profile?.subscriptionStatus === 'approved'} onSection={onSection} myPlan={profile?.plan} />;
  if (section === 'grades') return <ProgressView uid={uid} />;
  if (section === 'materials') return <MaterialsView myPlan={profile?.plan} />;
  if (section === 'notifications') return <NotificationsView uid={uid} />;
  if (section === 'exams') return <ExamView uid={uid} myPlan={profile?.plan} onToast={onToast} />;
  return <div className="dash-content"><div className="welcome-banner glass-card"><div><span className="eyebrow">Your learning overview</span><h2>Keep your momentum, {(profile?.name || 'there').split(' ')[0]}.</h2><p>You are making steady progress. A little time today goes a long way.</p><button className="secondary-btn" onClick={() => onSection('courses')}>Continue learning <ArrowRight size={16} /></button></div><div className="banner-orbit"><Trophy size={44} strokeWidth={1.2} /><span>{profile?.subscriptionStatus === 'approved' ? 'Active' : '—'}</span></div></div><div className="dash-grid"><div className="dash-card glass-card"><CardTitle title="Next up" action="" /><div className="next-item"><span className="next-number">01</span><div><strong>Go to your courses</strong><small>Pick up your next lesson</small></div><button onClick={() => onSection('courses')}><PlayCircle size={22} /></button></div><div className="next-item"><span className="next-number">02</span><div><strong>Check your materials</strong><small>PDFs and links from your instructor</small></div><button onClick={() => onSection('materials')}><PlayCircle size={22} /></button></div></div></div></div>;
}

function CardTitle({ title, action }: { title: string; action: string }) { return <div className="card-title"><h3>{title}</h3>{action && <button>{action} <ArrowRight size={13} /></button>}</div>; }

function SubscriptionView({ onToast, profile, uid, plans }: { onToast: (message: string) => void; profile: UserProfile | null; uid?: string; plans: PlanDoc[] }) {
  const request = useMyPaymentRequest(uid);
  const settings = useSiteSettings();
  const [selectedPlan, setSelectedPlan] = useState<PlanDoc | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const status = profile?.subscriptionStatus || 'none';

  async function submitReceipt() {
    if (!uid || !profile || !selectedPlan) return;
    setError('');
    setBusy(true);
    try {
      let receiptUrl = '';
      if (receiptFile) {
        const result = await uploadFile(receiptFile, setProgress, 'image');
        receiptUrl = result.url;
      }
      await createPaymentRequest({
        uid, name: profile.name, email: profile.email, planId: selectedPlan.id, plan: selectedPlan.name, amount: selectedPlan.price, receiptUrl,
      });
      onToast('Payment request sent. We will review it shortly.');
      setSelectedPlan(null);
      setReceiptFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حصل خطأ غير متوقع.');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  if (status === 'approved') {
    return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Membership</span><h2>Your subscription</h2><p>You have full access to your learning space.</p></div><span className="status-pill ready">Active</span></div><div className="subscription-card glass-card"><div className="sub-icon"><ShieldCheck size={23} /></div><span className="eyebrow">{request?.plan || 'Plan'}</span><h2>Your subscription is active.</h2><p>Enjoy full access to your courses, exams, and materials.</p></div></div>;
  }

  if (status === 'pending' && request) {
    return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Membership</span><h2>Your subscription</h2><p>Manage your access and keep your learning moving.</p></div><span className="status-pill pending">Payment pending</span></div><div className="subscription-layout"><div className="subscription-card glass-card"><div className="sub-icon"><ShieldCheck size={23} /></div><span className="eyebrow">{request.plan}</span><h2>Your request is under review.</h2><p>We are checking your payment receipt ({request.amount}). Your learning dashboard will unlock as soon as an admin approves it.</p><div className="sub-steps"><span className="done"><Check size={14} />Plan selected</span><span className="current"><Clock3 size={14} />Payment review</span><span><LockKeyhole size={14} />Dashboard unlocked</span></div></div><div className="unlock-card glass-card"><LockKeyhole size={23} /><h3>Your learning space is almost ready.</h3><p>Courses, exams, materials, and your progress will appear here after approval.</p><button className="secondary-btn full" onClick={() => onToast('Your request is already in review.')}>View payment details</button></div></div></div>;
  }

  // status === 'none' (or rejected): let them pick a plan and send a receipt
  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Membership</span><h2>Choose a plan</h2><p>Pick a plan, send your Vodafone Cash / InstaPay receipt, and we will unlock your dashboard.</p></div></div>
    {!selectedPlan ? (
      plans.length === 0
        ? <EmptyState title="No plans yet" text="Please check back soon — the admin hasn't published any plans yet." />
        : <div className="plan-grid">{plans.map(plan => <article key={plan.id} className={`plan-card glass-card ${plan.featured ? 'featured' : ''}`}>{plan.featured && <span className="recommended">Most popular</span>}<div className="plan-icon"><Target size={19} /></div><h2>{plan.name}</h2><p>{plan.description}</p><div className="plan-price">{plan.price}<small>{plan.duration}</small></div><ul>{plan.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul><button className={plan.featured ? 'primary-btn full' : 'secondary-btn full'} onClick={() => setSelectedPlan(plan)}>Choose plan <ArrowRight size={16} /></button></article>)}</div>
    ) : (
      <div className="subscription-card glass-card" style={{ maxWidth: 480 }}>
        <div className="sub-icon"><ShieldCheck size={23} /></div>
        <span className="eyebrow">{selectedPlan.name} · {selectedPlan.price}</span>
        <h2>Send your payment</h2>
        <div style={{ display: 'grid', gap: 10, margin: '14px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span>Vodafone Cash</span><strong>{settings.vodafoneCash || 'Not set by admin yet'}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span>InstaPay</span><strong>{settings.instapay || 'Not set by admin yet'}</strong></div>
        </div>
        <p>Send {selectedPlan.price} via one of the methods above, then upload a screenshot of the receipt below.</p>
        {error && <div className="auth-form-alert error">{error}</div>}
        <label style={{ display: 'block', margin: '16px 0' }}>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setReceiptFile(e.target.files?.[0] || null)} />
        </label>
        {busy && progress > 0 && <div className="sub-progress"><span>Uploading</span><b>{progress}%</b><div><i style={{ width: `${progress}%` }} /></div></div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary-btn" onClick={() => setSelectedPlan(null)} disabled={busy}>Back</button>
          <button className="primary-btn full" onClick={submitReceipt} disabled={busy || !receiptFile}>{busy ? 'Sending…' : 'Send for review'} <ArrowRight size={16} /></button>
        </div>
      </div>
    )}
  </div>;
}

function CourseProgressView({ courses, unlocked, onSection, myPlan }: { courses: CourseDoc[]; unlocked: boolean; onSection: (section: DashboardSection) => void; myPlan?: string }) {
  const [openCourse, setOpenCourse] = useState<CourseDoc | null>(null);
  if (!unlocked) {
    return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Keep going</span><h2>My courses</h2><p>Your courses will unlock once your subscription is approved.</p></div></div><div className="unlock-card glass-card"><LockKeyhole size={23} /><h3>No active subscription yet.</h3><p>Choose a plan and send your payment receipt to unlock all courses.</p><button className="secondary-btn full" onClick={() => onSection('subscription')}>Go to subscription <ArrowRight size={16} /></button></div></div>;
  }
  const accessible = courses.filter(c => !c.planAccess || c.planAccess === 'all' || c.planAccess === myPlan);
  if (openCourse) return <StudentCourseLessons course={openCourse} onBack={() => setOpenCourse(null)} />;
  if (accessible.length === 0) return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Keep going</span><h2>My courses</h2><p>Courses linked to your plan will appear here.</p></div></div><EmptyState title="No courses yet" text="Your instructor hasn't published a course for your plan yet." /></div>;
  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Keep going</span><h2>My courses</h2><p>Pick up where you left off.</p></div></div><div className="dashboard-course-grid">{accessible.map(course => <article className="dash-course glass-card" key={course.id}><div className={`mini-art ${course.tone}`}><span>{course.category}</span><PlayCircle size={20} /></div><h3>{course.title}</h3><p>{course.lessons} lessons · {course.duration}</p><div className="course-bottom"><span>&nbsp;</span><button onClick={() => setOpenCourse(course)}>Watch <ArrowRight size={14} /></button></div></article>)}</div></div>;
}

// بتعرض كل فيديوهات الكورس للطالب، وتسيبه يختار أي واحد يشغّله
function StudentCourseLessons({ course, onBack }: { course: CourseDoc; onBack: () => void }) {
  const lessons = useLessonsForCourse(course.id);
  const [playing, setPlaying] = useState<LessonDoc | null>(null);

  if (playing) {
    return <div className="dash-content"><button className="back-btn" onClick={() => setPlaying(null)}>← Back to {course.title}</button><div className="glass-card" style={{ padding: 18 }}><h2 style={{ marginBottom: 14 }}>{playing.title}</h2>
      <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 14, overflow: 'hidden' }}><iframe title={playing.title} src={toEmbedUrl(playing.videoUrl)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
    </div></div>;
  }
  return <div className="dash-content"><button className="back-btn" onClick={onBack}>← Back to my courses</button><div className="content-heading"><div><span className="eyebrow">{course.category}</span><h2>{course.title}</h2><p>{course.description}</p></div></div>
    {lessons.length === 0
      ? <EmptyState title="No videos yet" text="Your instructor hasn't added any videos for this course yet." />
      : <div style={{ display: 'grid', gap: 10 }}>{lessons.map((lesson, i) => <div key={lesson.id} className="subscription-card glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
        <div><span className="eyebrow">Video {i + 1}</span><h3 style={{ margin: '4px 0' }}>{lesson.title}</h3></div>
        <button className="primary-btn" onClick={() => setPlaying(lesson)}>Watch <PlayCircle size={16} /></button>
      </div>)}</div>}
  </div>;
}

function MaterialsView({ myPlan }: { myPlan?: string }) {
  const materials = useMaterialsForStudent(myPlan);
  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Your toolkit</span><h2>Materials</h2><p>Resources to make practice feel a little easier.</p></div></div>
    {materials.length === 0
      ? <EmptyState title="No materials yet" text="Files and links from your instructor will appear here." />
      : <div className="materials-grid">{materials.map((material, index) => <a className="material-card glass-card" key={material.id} href={material.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}><div className={`file-icon file-${index % 4}`}><BookOpen size={20} /></div><div><strong>{material.title}</strong><small>{material.type === 'pdf' ? 'PDF' : 'External link'}</small></div><button type="button"><ArrowRight size={16} /></button></a>)}</div>}
  </div>;
}

function NotificationsView({ uid }: { uid?: string }) {
  const items = useNotifications(uid);
  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Stay in the loop</span><h2>Notifications</h2><p>Helpful reminders, new resources, and small wins.</p></div></div>
    {items.length === 0
      ? <EmptyState title="No notifications yet" text="We will let you know here when there is something new." />
      : <div className="notification-list glass-card">{items.map(item => <button className={!item.read ? 'notification-item unread' : 'notification-item'} key={item.id} onClick={() => !item.read && markNotificationRead(item.id)} style={{ width: '100%', textAlign: 'left', border: 0, background: 'none' }}><span className="notification-dot"><Bell size={16} /></span><div><strong>{item.title}</strong><p>{item.body}</p></div></button>)}</div>}
  </div>;
}

function ExamRunner({ exam, uid, onCancel, onDone }: { exam: ExamDoc; uid?: string; onCancel: () => void; onDone: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<number[]>(() => exam.questions.map(() => -1));
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!uid) return;
    setBusy(true);
    const score = exam.questions.reduce((sum, q: ExamQuestion, i) => sum + (answers[i] === q.correctIndex ? 1 : 0), 0);
    try {
      await submitExamResult({ uid, examId: exam.id, examTitle: exam.title, score, total: exam.questions.length });
      onDone(score, exam.questions.length);
    } finally {
      setBusy(false);
    }
  }

  const allAnswered = answers.every(a => a !== -1);

  return <div className="dash-content">
    <button className="back-btn" onClick={onCancel}>← Back to exams</button>
    <div className="exam-card glass-card">
      <div className="exam-top"><div className="exam-icon"><Target size={25} /></div><span className="status-pill ready">In progress</span></div>
      <h2>{exam.title}</h2>
      <p>{exam.questions.length} questions · Pass mark {exam.passMark}%</p>
      <div style={{ display: 'grid', gap: 18, margin: '18px 0' }}>
        {exam.questions.map((q, qi) => (
          <div key={q.id} style={{ borderTop: qi > 0 ? '1px solid rgba(120,100,130,.12)' : undefined, paddingTop: qi > 0 ? 16 : 0 }}>
            <strong style={{ display: 'block', marginBottom: 10 }}>{qi + 1}. {q.text}</strong>
            <div style={{ display: 'grid', gap: 8 }}>
              {q.options.map((option, oi) => (
                <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4f4b51' }}>
                  <input type="radio" style={{ width: 'auto' }} name={`q-${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers(a => a.map((v, i) => i === qi ? oi : v))} />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="primary-btn" onClick={submit} disabled={busy || !allAnswered}>{busy ? 'Submitting…' : 'Submit exam'} <ArrowRight size={17} /></button>
    </div>
  </div>;
}

function ExamView({ uid, myPlan, onToast }: { uid?: string; myPlan?: string; onToast: (message: string) => void }) {
  const exams = useExamsForStudent(myPlan);
  const results = useMyExamResults(uid);
  const [active, setActive] = useState<ExamDoc | null>(null);

  if (active) {
    return <ExamRunner exam={active} uid={uid} onCancel={() => setActive(null)} onDone={(score, total) => { setActive(null); onToast(`Exam submitted — ${score}/${total} correct.`); }} />;
  }

  if (exams.length === 0) return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Test your understanding</span><h2>Exams</h2><p>Thoughtful practice helps ideas stay with you.</p></div></div><EmptyState title="No exams yet" text="Exams linked to your plan will appear here." /></div>;

  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Test your understanding</span><h2>Exams</h2><p>Thoughtful practice helps ideas stay with you.</p></div></div>
    <div style={{ display: 'grid', gap: 14 }}>
      {exams.map(exam => {
        const best = results.filter(r => r.examId === exam.id).sort((a, b) => b.percent - a.percent)[0];
        return <div className="exam-card glass-card" key={exam.id}>
          <div className="exam-top"><div className="exam-icon"><Target size={25} /></div><span className={`status-pill ${best ? 'ready' : 'pending'}`}>{best ? `Best score ${best.percent}%` : 'Not attempted'}</span></div>
          <h2>{exam.title}</h2>
          <p>{exam.courseTitle || 'General'} · {exam.questions.length} questions</p>
          <div className="exam-details"><span><Target size={16} />Pass mark {exam.passMark}%</span></div>
          <button className="primary-btn" onClick={() => setActive(exam)}>{best ? 'Retake exam' : 'Start exam'} <ArrowRight size={17} /></button>
        </div>;
      })}
    </div>
  </div>;
}

function ProgressView({ uid }: { uid?: string }) {
  const results = useMyExamResults(uid);
  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length) : 0;
  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Your results</span><h2>Progress</h2><p>A clear view of your progress and achievements.</p></div></div>
    <div className="grade-summary"><div className="glass-card"><span>Average score</span><strong>{results.length ? `${avg}%` : '—'}</strong><small>{results.length} exam(s) taken</small></div><div className="glass-card"><span>Exams completed</span><strong>{String(results.length).padStart(2, '0')}</strong><small>Keep going</small></div></div>
    {results.length === 0
      ? <EmptyState title="No results yet" text="Take an exam to see your progress here." />
      : <div className="table-card glass-card"><div className="card-title"><h3>Exam history</h3></div><div className="grade-table"><div className="table-row table-head"><span>Exam</span><span>Score</span><span>Status</span></div>{results.map(row => <div className="table-row" key={row.id}><span><b>{row.examTitle}</b></span><span>{row.score}/{row.total} ({row.percent}%)</span><span className={row.percent >= 60 ? 'status-text' : 'pending-text'}>{row.percent >= 60 ? 'Passed' : 'Needs review'}</span></div>)}</div></div>}
  </div>;
}

function AdminContent({ section, onToast, onSection, courses, plans, profile, uid, onProfileSaved }: {
  section: DashboardSection; onToast: (message: string) => void; onSection: (section: DashboardSection) => void; courses: CourseDoc[]; plans: PlanDoc[];
  profile: UserProfile | null; uid?: string; onProfileSaved: () => Promise<void> | void;
}) {
  if (section === 'profile') return <ProfileView profile={profile} uid={uid} admin onToast={onToast} onProfileSaved={onProfileSaved} />;
  if (section === 'courses') return <AdminCoursesView courses={courses} plans={plans} onToast={onToast} />;
  if (section === 'materials') return <AdminMaterialsView plans={plans} />;
  if (section === 'exams') return <AdminExamsView plans={plans} />;
  if (section === 'plans') return <AdminPlansView plans={plans} />;
  if (section === 'subscription') return <AdminPaymentRequestsView onToast={onToast} />;
  if (section === 'notifications') return <AdminNotificationsView plans={plans} onToast={onToast} />;
  if (section === 'content') return <AdminSettingsView onToast={onToast} />;
  return <AdminOverview onToast={onToast} onSection={onSection} courses={courses} />;
}

function AdminOverview({ onSection, courses }: { onToast: (message: string) => void; onSection: (section: DashboardSection) => void; courses: CourseDoc[] }) {
  const stats = useAdminStats();
  const requests = usePaymentRequestsAdmin();
  const recent = requests.slice(0, 5);
  return <div className="dash-content"><div className="admin-intro"><div><span className="eyebrow">Platform pulse</span><h2>A gentle overview of 5JAD.</h2><p>Everything your learning community needs, in one clear place.</p></div><button className="primary-btn" onClick={() => onSection('courses')}>Add new course <ArrowRight size={16} /></button></div><div className="admin-stats"><StatCard label="Total students" value={stats.loading ? '—' : String(stats.totalStudents)} trend="Live" icon={UserRound} /><StatCard label="Active subscriptions" value={stats.loading ? '—' : String(stats.activeSubscriptions)} trend="Live" icon={ShieldCheck} /><StatCard label="Pending requests" value={stats.loading ? '—' : String(stats.pendingRequests)} trend="Needs review" icon={Clock3} /><StatCard label="Published courses" value={String(courses.length)} trend="Live" icon={BookOpen} /></div><div className="admin-columns"><div className="table-card glass-card"><div className="card-title"><h3>Recent payment requests</h3><button onClick={() => onSection('subscription')}>View all <ArrowRight size={13} /></button></div>{recent.length === 0 ? <p style={{ padding: '12px 0' }}>No payment requests yet.</p> : <div className="grade-table"><div className="table-row table-head"><span>Student</span><span>Plan</span><span>Amount</span><span>Status</span></div>{recent.map(row => <div className="table-row" key={row.id}><span><b>{row.name}</b><small>{row.email}</small></span><span>{row.plan}</span><span>{row.amount}</span><span className={row.status === 'approved' ? 'status-text' : 'pending-text'}>{row.status}</span></div>)}</div>}</div><div className="dash-card glass-card activity-card"><CardTitle title="Quick actions" action="" /><button onClick={() => onSection('courses')}><BookOpen size={17} />Manage courses <ArrowRight size={15} /></button><button onClick={() => onSection('subscription')}><ShieldCheck size={17} />Review payment requests <ArrowRight size={15} /></button><button onClick={() => onSection('notifications')}><Bell size={17} />Send notification <ArrowRight size={15} /></button></div></div></div>;
}

function AdminCoursesView({ courses, plans, onToast }: { courses: CourseDoc[]; plans: PlanDoc[]; onToast: (message: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  // الكورس بقى بينشئ من غير فيديو خالص - الفيديوهات بتتضاف بعد كده من شاشة "Manage videos"
  const [form, setForm] = useState({ title: '', description: '', lessons: '8', duration: '3h', price: '$29', category: 'Development', tone: 'blue', planAccess: 'all' });
  // الكورس اللي فاتح دلوقتي شاشة إدارة الفيديوهات بتاعته (null يعني إحنا في قايمة الكورسات)
  const [managing, setManaging] = useState<CourseDoc | null>(null);

  async function submit() {
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      await addCourse({
        title: form.title, description: form.description, lessons: Number(form.lessons) || 0,
        duration: form.duration, price: form.price, rating: '5.0', students: '0', category: form.category, tone: form.tone,
        planAccess: form.planAccess,
      });
      onToast('Course added. Now add its videos from "Manage videos".');
      setShowForm(false);
      setForm({ title: '', description: '', lessons: '8', duration: '3h', price: '$29', category: 'Development', tone: 'blue', planAccess: 'all' });
    } finally {
      setBusy(false);
    }
  }

  if (managing) return <CourseLessonsManager course={managing} onBack={() => setManaging(null)} />;

  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Content</span><h2>Courses</h2><p>Manage what students see in the catalog, then add and edit its videos any time.</p></div><button className="primary-btn" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add new course'} <ArrowRight size={16} /></button></div>
    {showForm && <div className="subscription-card glass-card" style={{ marginBottom: 18 }}>
      <label>Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
      <label>Description<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>Lessons<input value={form.lessons} onChange={e => setForm({ ...form, lessons: e.target.value })} /></label>
        <label style={{ flex: 1 }}>Duration<input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></label>
        <label style={{ flex: 1 }}>Price<input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
      </div>
      <label>Available to
        <select value={form.planAccess} onChange={e => setForm({ ...form, planAccess: e.target.value })}>
          <option value="all">All plans</option>
          {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <button className="primary-btn full" onClick={submit} disabled={busy || !form.title.trim()}>{busy ? 'Saving…' : 'Save course'}</button>
    </div>}
    {courses.length === 0
      ? <EmptyState title="No courses yet" text="Add your first course above." />
      : <div className="dashboard-course-grid">{courses.map(course => <article className="dash-course glass-card" key={course.id}><div className={`mini-art ${course.tone}`}><span>{course.category}</span><PlayCircle size={20} /></div><h3>{course.title}</h3><p>{course.lessons} lessons · {course.duration}</p><p style={{ fontSize: 11 }}>{course.planAccess === 'all' || !course.planAccess ? 'All plans' : plans.find(p => p.id === course.planAccess)?.name || 'Plan'}</p><button className="secondary-btn full" onClick={() => setManaging(course)}>Manage videos</button><button className="text-btn" onClick={() => deleteCourse(course.id)}>Delete course</button></article>)}</div>}
  </div>;
}

// شاشة إدارة فيديوهات كورس واحد: تضيف فيديو جديد، تشوف كل الفيديوهات المتاحة،
// وتمسح أي واحد منهم. تقدر ترجعلها في أي وقت تاني وتكمّل تضيف فيديوهات.
function CourseLessonsManager({ course, onBack }: { course: CourseDoc; onBack: () => void }) {
  const lessons = useLessonsForCourse(course.id);
  const [form, setForm] = useState({ title: '', videoUrl: '' });
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!form.title.trim() || !form.videoUrl.trim()) return;
    setBusy(true);
    try {
      await addLesson(course.id, { title: form.title, videoUrl: form.videoUrl, order: lessons.length });
      setForm({ title: '', videoUrl: '' });
    } finally {
      setBusy(false);
    }
  }

  return <div className="dash-content">
    <button className="back-btn" onClick={onBack}>← Back to courses</button>
    <div className="content-heading"><div><span className="eyebrow">{course.title}</span><h2>Videos</h2><p>Add as many videos as you want, and come back any time to add more.</p></div></div>
    <div className="subscription-card glass-card" style={{ marginBottom: 18 }}>
      <label>Video title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Lesson 1: Getting started" /></label>
      <label>Video URL (YouTube / Vimeo / Drive)<input value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></label>
      <button className="primary-btn full" onClick={submit} disabled={busy || !form.title.trim() || !form.videoUrl.trim()}>{busy ? 'Saving…' : 'Add video'}</button>
    </div>
    {lessons.length === 0
      ? <EmptyState title="No videos yet" text="Add the first video for this course above." />
      : <div style={{ display: 'grid', gap: 10 }}>{lessons.map((lesson, i) => <div key={lesson.id} className="subscription-card glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
        <div><span className="eyebrow">Video {i + 1}</span><h3 style={{ margin: '4px 0' }}>{lesson.title}</h3><a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="link-btn">{lesson.videoUrl}</a></div>
        <button className="text-btn" onClick={() => deleteLesson(course.id, lesson.id)}>Remove</button>
      </div>)}</div>}
  </div>;
}

function AdminMaterialsView({ plans }: { plans: PlanDoc[] }) {
  const materials = useMaterialsAdmin();
  const [form, setForm] = useState({ title: '', url: '', type: 'pdf' as 'pdf' | 'link', planAccess: 'all' });
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!form.title.trim() || !form.url.trim()) return;
    setBusy(true);
    try {
      await addMaterial({ ...form });
      setForm({ title: '', url: '', type: 'pdf', planAccess: 'all' });
    } finally {
      setBusy(false);
    }
  }

  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Your toolkit</span><h2>Materials</h2><p>Add PDF or link resources, and link them to a plan.</p></div></div>
    <div className="subscription-card glass-card" style={{ marginBottom: 18 }}>
      <label>Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
      <label>URL<input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></label>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>Type
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'pdf' | 'link' })}><option value="pdf">PDF</option><option value="link">Link</option></select>
        </label>
        <label style={{ flex: 1 }}>Available to
          <select value={form.planAccess} onChange={e => setForm({ ...form, planAccess: e.target.value })}><option value="all">All plans</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        </label>
      </div>
      <button className="primary-btn full" onClick={submit} disabled={busy || !form.title.trim() || !form.url.trim()}>{busy ? 'Saving…' : 'Add material'}</button>
    </div>
    {materials.length === 0
      ? <EmptyState title="No materials yet" text="Add a PDF or link above." />
      : <div className="materials-grid">{materials.map((material, index) => <div className="material-card glass-card" key={material.id}><div className={`file-icon file-${index % 4}`}><BookOpen size={20} /></div><div><strong>{material.title}</strong><small>{material.type === 'pdf' ? 'PDF' : 'Link'} · {material.planAccess === 'all' ? 'All plans' : plans.find(p => p.id === material.planAccess)?.name || 'Plan'}</small></div><button onClick={() => deleteMaterial(material.id)}><X size={16} /></button></div>)}</div>}
  </div>;
}

type QuestionDraft = { text: string; options: string[]; correctIndex: number };

function AdminExamsView({ plans }: { plans: PlanDoc[] }) {
  const exams = useExamsAdmin();
  const [title, setTitle] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [planAccess, setPlanAccess] = useState('all');
  const [passMark, setPassMark] = useState('60');
  const [questions, setQuestions] = useState<QuestionDraft[]>([{ text: '', options: ['', '', '', ''], correctIndex: 0 }]);
  const [busy, setBusy] = useState(false);

  function updateQuestion(i: number, patch: Partial<QuestionDraft>) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  }
  function updateOption(i: number, oi: number, value: string) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? value : o) } : q));
  }
  function addQuestion() { setQuestions(qs => [...qs, { text: '', options: ['', '', '', ''], correctIndex: 0 }]); }
  function removeQuestion(i: number) { setQuestions(qs => qs.filter((_, idx) => idx !== i)); }

  async function submit() {
    if (!title.trim() || questions.some(q => !q.text.trim() || q.options.some(o => !o.trim()))) return;
    setBusy(true);
    try {
      await addExam({
        title, courseTitle, planAccess, passMark: Number(passMark) || 60,
        questions: questions.map((q, idx) => ({ id: String(idx), text: q.text, options: q.options, correctIndex: q.correctIndex })),
      });
      setTitle(''); setCourseTitle(''); setPlanAccess('all'); setPassMark('60');
      setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0 }]);
    } finally {
      setBusy(false);
    }
  }

  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Assessment</span><h2>Exams</h2><p>Build MCQ exams. Correct answers are graded automatically.</p></div></div>
    <div className="subscription-card glass-card" style={{ marginBottom: 18 }}>
      <label>Exam title<input value={title} onChange={e => setTitle(e.target.value)} /></label>
      <label>Related course<input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} /></label>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>Available to
          <select value={planAccess} onChange={e => setPlanAccess(e.target.value)}><option value="all">All plans</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        </label>
        <label style={{ flex: 1 }}>Pass mark %<input value={passMark} onChange={e => setPassMark(e.target.value)} /></label>
      </div>
      {questions.map((q, i) => (
        <div key={i} className="glass-card" style={{ padding: 14, margin: '10px 0', background: 'rgba(255,255,255,.5)' }}>
          <label>Question {i + 1}<input value={q.text} onChange={e => updateQuestion(i, { text: e.target.value })} /></label>
          {q.options.map((option, oi) => (
            <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <input type="radio" name={`correct-${i}`} checked={q.correctIndex === oi} onChange={() => updateQuestion(i, { correctIndex: oi })} style={{ width: 'auto' }} />
              <input value={option} onChange={e => updateOption(i, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
            </div>
          ))}
          {questions.length > 1 && <button type="button" className="text-btn" onClick={() => removeQuestion(i)}>Remove question</button>}
        </div>
      ))}
      <button type="button" className="secondary-btn" onClick={addQuestion}>Add question</button>
      <button className="primary-btn full" style={{ marginTop: 12 }} onClick={submit} disabled={busy || !title.trim()}>{busy ? 'Saving…' : 'Publish exam'}</button>
    </div>
    {exams.length === 0
      ? <EmptyState title="No exams yet" text="Build your first exam above." />
      : exams.map(exam => <div className="subscription-card glass-card" key={exam.id} style={{ marginBottom: 14 }}><span className="eyebrow">{exam.courseTitle || 'General'} · {exam.questions.length} questions</span><h2 style={{ margin: '8px 0' }}>{exam.title}</h2><p>Pass mark {exam.passMark}% · {exam.planAccess === 'all' ? 'All plans' : plans.find(p => p.id === exam.planAccess)?.name || 'Plan'}</p><button className="secondary-btn" onClick={() => deleteExam(exam.id)}>Delete</button></div>)}
  </div>;
}

function AdminPlansView({ plans }: { plans: PlanDoc[] }) {
  const [form, setForm] = useState({ name: '', price: '', duration: 'per month', description: '', features: '', featured: false });
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      await addPlan({
        name: form.name, price: form.price, duration: form.duration, description: form.description,
        features: form.features.split(',').map(f => f.trim()).filter(Boolean), featured: form.featured,
      });
      setForm({ name: '', price: '', duration: 'per month', description: '', features: '', featured: false });
    } finally {
      setBusy(false);
    }
  }

  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Membership</span><h2>Plans</h2><p>Create and manage subscription packages and pricing.</p></div></div>
    <div className="subscription-card glass-card" style={{ marginBottom: 18 }}>
      <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>Price<input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="$19" /></label>
        <label style={{ flex: 1 }}>Duration<input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="per month" /></label>
      </div>
      <label>Description<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <label>Features (comma separated)<input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Access to 3 courses, Monthly review" /></label>
      <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" style={{ width: 'auto' }} checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Mark as most popular</label>
      <button className="primary-btn full" onClick={submit} disabled={busy || !form.name.trim()}>{busy ? 'Saving…' : 'Add plan'}</button>
    </div>
    {plans.length === 0
      ? <EmptyState title="No plans yet" text="Add your first plan above." />
      : <div className="plan-grid">{plans.map(plan => <article key={plan.id} className="plan-card glass-card">{plan.featured && <span className="recommended">Most popular</span>}<h2>{plan.name}</h2><p>{plan.description}</p><div className="plan-price">{plan.price}<small>{plan.duration}</small></div><ul>{plan.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul><button className="secondary-btn full" onClick={() => deletePlan(plan.id)}>Delete</button></article>)}</div>}
  </div>;
}

function AdminNotificationsView({ plans, onToast }: { plans: PlanDoc[]; onToast: (message: string) => void }) {
  const students = useStudentsAdmin();
  const [targetType, setTargetType] = useState<'all' | 'plan' | 'student'>('all');
  const [targetValue, setTargetValue] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    try {
      await sendNotification({ targetType, targetValue: targetType === 'all' ? undefined : targetValue, title, body });
      onToast('Notification sent.');
      setTitle(''); setBody('');
    } finally {
      setBusy(false);
    }
  }

  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Stay in the loop</span><h2>Notifications</h2><p>Send an update to one student, a plan group, or everyone.</p></div></div>
    <div className="subscription-card glass-card" style={{ maxWidth: 520 }}>
      <label>Send to
        <select value={targetType} onChange={e => { setTargetType(e.target.value as 'all' | 'plan' | 'student'); setTargetValue(''); }}>
          <option value="all">All students</option>
          <option value="plan">Students on a specific plan</option>
          <option value="student">One student</option>
        </select>
      </label>
      {targetType === 'plan' && <label>Plan<select value={targetValue} onChange={e => setTargetValue(e.target.value)}><option value="">Select a plan</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
      {targetType === 'student' && <label>Student<select value={targetValue} onChange={e => setTargetValue(e.target.value)}><option value="">Select a student</option>{students.map(s => <option key={s.uid} value={s.uid}>{s.name} ({s.email})</option>)}</select></label>}
      <label>Title<input value={title} onChange={e => setTitle(e.target.value)} /></label>
      <label>Message<input value={body} onChange={e => setBody(e.target.value)} /></label>
      <button className="primary-btn full" onClick={submit} disabled={busy || !title.trim() || !body.trim() || (targetType !== 'all' && !targetValue)}>{busy ? 'Sending…' : 'Send notification'}</button>
    </div>
  </div>;
}

function AdminSettingsView({ onToast }: { onToast: (message: string) => void }) {
  const settings = useSiteSettings();
  const feedback = useFeedback();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [fbForm, setFbForm] = useState({ name: '', role: '', quote: '' });

  useEffect(() => { setForm(settings); }, [settings]);

  async function save() {
    setBusy(true);
    try {
      await updateSiteSettings(form);
      onToast('Settings saved.');
    } finally {
      setBusy(false);
    }
  }
  async function submitFeedback() {
    if (!fbForm.name.trim() || !fbForm.quote.trim()) return;
    await addFeedback(fbForm);
    setFbForm({ name: '', role: '', quote: '' });
  }

  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Landing page</span><h2>Content &amp; payments</h2><p>Control what visitors see and how they pay.</p></div></div>
    <div className="subscription-card glass-card" style={{ marginBottom: 18 }}>
      <h3>About Us</h3>
      <label>About text<input value={form.aboutText} onChange={e => setForm({ ...form, aboutText: e.target.value })} /></label>
      <label>Feedback section title<input value={form.feedbackTitle} onChange={e => setForm({ ...form, feedbackTitle: e.target.value })} /></label>
      <h3 style={{ marginTop: 18 }}>Payment methods</h3>
      <label>Vodafone Cash number<input value={form.vodafoneCash} onChange={e => setForm({ ...form, vodafoneCash: e.target.value })} placeholder="01xxxxxxxxx" /></label>
      <label>InstaPay ID / link<input value={form.instapay} onChange={e => setForm({ ...form, instapay: e.target.value })} placeholder="yourname@instapay" /></label>
      <button className="primary-btn full" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
    </div>
    <div className="subscription-card glass-card">
      <h3>Student feedback</h3>
      <label>Name<input value={fbForm.name} onChange={e => setFbForm({ ...fbForm, name: e.target.value })} /></label>
      <label>Role<input value={fbForm.role} onChange={e => setFbForm({ ...fbForm, role: e.target.value })} /></label>
      <label>Quote<input value={fbForm.quote} onChange={e => setFbForm({ ...fbForm, quote: e.target.value })} /></label>
      <button className="secondary-btn full" onClick={submitFeedback}>Add feedback</button>
      {feedback.length > 0 && <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>{feedback.map(item => <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 12 }}>{item.name} — “{item.quote.slice(0, 40)}{item.quote.length > 40 ? '…' : ''}”</span><button className="text-btn" onClick={() => deleteFeedback(item.id)}>Remove</button></div>)}</div>}
    </div>
  </div>;
}

function AdminPaymentRequestsView({ onToast }: { onToast: (message: string) => void }) {
  const requests = usePaymentRequestsAdmin();
  async function handle(request: PaymentRequest, approve: boolean) {
    await decidePaymentRequest(request, approve);
    onToast(approve ? 'Request approved.' : 'Request rejected.');
  }
  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Membership</span><h2>Payment requests</h2><p>Review receipts and unlock student dashboards.</p></div></div>
    {requests.length === 0 ? <EmptyState title="No payment requests yet" text="New requests from students will show up here." /> : requests.map(r => <div className="subscription-card glass-card" key={r.id} style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div><span className="eyebrow">{r.plan} · {r.amount}</span><h2 style={{ margin: '8px 0' }}>{r.name}</h2><p>{r.email}</p></div>
        <span className={`status-pill ${r.status === 'approved' ? 'ready' : 'pending'}`}>{r.status}</span>
      </div>
      {r.receiptUrl && <a href={r.receiptUrl} target="_blank" rel="noreferrer" className="link-btn">View receipt <ArrowRight size={14} /></a>}
      {r.status === 'pending' && <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="primary-btn" onClick={() => handle(r, true)}>Approve</button>
        <button className="secondary-btn" onClick={() => handle(r, false)}>Reject</button>
      </div>}
    </div>)}
  </div>;
}
function StatCard({ label, value, trend, icon: Icon }: { label: string; value: string; trend: string; icon: typeof UserRound }) { return <div className="stat-card glass-card"><div className="stat-icon"><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small>{trend}</small></div>; }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="empty-state glass-card"><Sparkles size={24} /><h3>{title}</h3><p>{text}</p></div>; }
function Footer({ t }: { t: T }) { return <footer><div className="footer-brand"><span className="brand-five">5</span>JAD</div><span>{t('footer.rights')}</span><div><button>{t('footer.privacy')}</button><button>{t('footer.terms')}</button><button>{t('footer.contact')}</button></div></footer>; }

export default App;
