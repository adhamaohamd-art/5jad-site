import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth, friendlyAuthError, type UserProfile } from './context/AuthContext';
import {
  useCourses, usePlans, useMyPaymentRequest, usePaymentRequestsAdmin, useNotifications, useAdminStats,
  createPaymentRequest, decidePaymentRequest, addCourse,
  type CourseDoc, type PlanDoc, type PaymentRequest,
} from './lib/firestoreData';
import { uploadFile } from './lib/cloudinary';

type View = 'home' | 'courses' | 'course' | 'auth' | 'dashboard' | 'plans' | 'admin';
type DashboardSection = 'overview' | 'courses' | 'exams' | 'materials' | 'grades' | 'subscription' | 'notifications' | 'profile';

type Course = {
  id: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  price: string;
  rating: string;
  students: string;
  category: string;
  tone: string;
};

const mountainImage = 'https://images.pexels.com/photos/19542085/pexels-photo-19542085.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const courses: Course[] = [
  { id: 'design', title: 'UI/UX Design Fundamentals', description: 'Build thoughtful interfaces and learn the principles behind products people love to use.', lessons: 24, duration: '12h 30m', price: '$49', rating: '4.9', students: '2.1k', category: 'Design', tone: 'violet' },
  { id: 'python', title: 'Python for Beginners', description: 'A practical, friendly introduction to programming with projects you can share and build on.', lessons: 18, duration: '8h 15m', price: '$29', rating: '4.7', students: '1.8k', category: 'Development', tone: 'mint' },
  { id: 'product', title: 'Product Management 101', description: 'Turn customer insight into focused roadmaps, stronger decisions, and better outcomes.', lessons: 15, duration: '6h 40m', price: '$39', rating: '4.8', students: '1.2k', category: 'Business', tone: 'peach' },
  { id: 'writing', title: 'Writing for the Digital World', description: 'Find a clear voice, create useful content, and make every sentence work harder.', lessons: 12, duration: '4h 50m', price: '$24', rating: '4.8', students: '980', category: 'Creative', tone: 'blue' },
  { id: 'marketing', title: 'Modern Marketing Strategy', description: 'Learn how to connect ideas, audiences, and measurable growth without the noise.', lessons: 20, duration: '9h 05m', price: '$35', rating: '4.9', students: '1.5k', category: 'Marketing', tone: 'sand' },
  { id: 'leadership', title: 'Confident Team Leadership', description: 'Develop the habits that create clarity, trust, and momentum in every team.', lessons: 14, duration: '5h 20m', price: '$32', rating: '4.6', students: '760', category: 'Leadership', tone: 'rose' },
];

const plans: PlanDoc[] = [
  { id: 'essentials', name: 'Essentials', price: '$19', duration: 'per month', description: 'A calm starting point for building a consistent learning habit.', features: ['Access to 3 courses', 'Course materials', 'Monthly progress review'] },
  { id: 'all-access', name: 'All Access', price: '$39', duration: 'per month', description: 'Everything you need to explore, practice, and grow without limits.', features: ['All published courses', 'Exams and certificates', 'Priority support'], featured: true },
  { id: 'focused', name: 'Focused', price: '$89', duration: 'per quarter', description: 'For learners ready to commit to a meaningful professional transition.', features: ['All Access benefits', 'Mentor office hours', 'Career-ready projects'] },
];

function App() {
  const { user, profile, loading, logout } = useAuth();
  const [view, setView] = useState<View>('home');
  const [activeCourse, setActiveCourse] = useState<Course>(courses[0]);
  const [dashboardSection, setDashboardSection] = useState<DashboardSection>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'AR'>('EN');
  const [toast, setToast] = useState('');
  const isDashboard = view === 'dashboard' || view === 'admin';
  const liveCourses = useCourses(courses);
  const livePlans = usePlans(plans);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  // بعد ما تسجيل الدخول يخلص وبروفايل المستخدم يتحمّل، ندخله على لوحته على طول
  useEffect(() => {
    if (!loading && user && profile) {
      setView(profile.role === 'admin' ? 'admin' : 'dashboard');
    }
  }, [loading, user, profile]);

  const openCourse = (course: Course) => {
    setActiveCourse(course);
    setView('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExit = async () => {
    await logout();
    setView('home');
  };

  return (
    <main className={language === 'AR' ? 'rtl' : ''} style={{ backgroundImage: `linear-gradient(180deg, rgba(248,246,241,.42), rgba(237,232,225,.7)), url(${mountainImage})` }}>
      <div className="site-wrap">
        {!isDashboard && <PublicHeader view={view} language={language} onLanguage={() => setLanguage(language === 'EN' ? 'AR' : 'EN')} onNavigate={setView} onMenu={() => setMenuOpen(!menuOpen)} />}
        {isDashboard ? (
          <DashboardShell
            admin={view === 'admin'}
            section={dashboardSection}
            onSection={setDashboardSection}
            onExit={handleExit}
            onToast={showToast}
            profile={profile}
            uid={user?.uid}
            plans={livePlans}
            courses={liveCourses}
          />
        ) : (
          <>
            {menuOpen && <MobileMenu onNavigate={setView} onClose={() => setMenuOpen(false)} />}
            {view === 'home' && <Home onExplore={() => setView('courses')} onCourse={openCourse} onAuth={() => setView('auth')} courses={liveCourses} />}
            {view === 'courses' && <Courses onCourse={openCourse} onBack={() => setView('home')} courses={liveCourses} />}
            {view === 'course' && <CourseDetails course={activeCourse} onBack={() => setView('courses')} onEnroll={() => setView(user ? 'dashboard' : 'auth')} />}
            {view === 'auth' && <Auth onBack={() => setView('home')} onContinue={() => showToast('Welcome to 5JAD.')} />}
            {view === 'plans' && <Plans onBack={() => setView('home')} onSelect={() => setView(user ? 'dashboard' : 'auth')} plans={livePlans} />}
            <Footer />
          </>
        )}
      </div>
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </main>
  );
}

function PublicHeader({ view, language, onLanguage, onNavigate, onMenu }: { view: View; language: 'EN' | 'AR'; onLanguage: () => void; onNavigate: (view: View) => void; onMenu: () => void }) {
  return <header className="topbar glass-panel">
    <button className="brand" onClick={() => onNavigate('home')} aria-label="5JAD home"><span className="brand-mark"><GraduationCap size={26} strokeWidth={1.5} /></span><span className="brand-five">5</span><span>JAD</span></button>
    <nav className="desktop-nav"><button className={view === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}>Home</button><button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About Us</button><button className={view === 'courses' ? 'active' : ''} onClick={() => onNavigate('courses')}>Courses</button><button onClick={() => document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' })}>Feedback</button></nav>
    <div className="top-actions"><button className="language" onClick={onLanguage}><span className="globe">◎</span>{language} / {language === 'EN' ? 'AR' : 'EN'}</button><button className="icon-btn" aria-label="Sign in" onClick={() => onNavigate('auth')}><UserRound size={18} /></button><button className="menu-btn" onClick={onMenu} aria-label="Open menu"><Menu size={21} /></button></div>
  </header>;
}

function MobileMenu({ onNavigate, onClose }: { onNavigate: (view: View) => void; onClose: () => void }) {
  return <div className="mobile-menu glass-panel"><button onClick={onClose} className="close-menu"><X size={18} /></button><button onClick={() => { onNavigate('home'); onClose(); }}>Home</button><button onClick={() => { onNavigate('courses'); onClose(); }}>Courses</button><button onClick={() => { onNavigate('auth'); onClose(); }}>Sign in</button></div>;
}

function Home({ onExplore, onCourse, onAuth, courses }: { onExplore: () => void; onCourse: (course: Course) => void; onAuth: () => void; courses: Course[] }) {
  return <div className="page home-page">
    <section className="hero"><div className="eyebrow"><Sparkles size={15} /> Learn with intention</div><h1>New way of<br /><em>learning.</em></h1><p>Discover thoughtful courses from industry experts. Learn at your own pace, build real skills, and create a future you are proud of.</p><div className="hero-actions"><button className="primary-btn" onClick={onExplore}>Explore courses <ArrowRight size={17} /></button><button className="text-btn" onClick={onAuth}>I am a student <ArrowRight size={16} /></button></div><div className="hero-note"><div className="avatar-stack"><span>H</span><span>M</span><span>S</span><span>+</span></div><span>Join 50k+ curious learners</span></div></section>
    <section className="stats-row"><div><strong>50k+</strong><span>active learners</span></div><div><strong>200+</strong><span>expert instructors</span></div><div><strong>95%</strong><span>completion rate</span></div></section>
    <section className="section" id="courses"><SectionHeading label="Learn something new" title="Popular courses" action="See all courses" onAction={onExplore} /><div className="course-grid featured-grid">{courses.slice(0, 3).map(course => <CourseCard key={course.id} course={course} onOpen={onCourse} />)}</div></section>
    <section className="about-section" id="about"><div className="about-orbit"><div className="orbit-dot" /><GraduationCap size={46} strokeWidth={1.2} /></div><div><div className="eyebrow">A better way forward</div><h2>Learning that fits<br /><em>your life.</em></h2><p>5JAD is a modern learning space for people who want more than another open tab. We pair expert-led lessons with the structure, warmth, and freedom to help you keep going.</p><button className="secondary-btn" onClick={() => onExplore()}>Discover our approach <ArrowRight size={16} /></button></div></section>
    <section className="section" id="feedback"><SectionHeading label="From our community" title="Learners say it best" /><div className="feedback-grid"><FeedbackCard quote="The lessons are short enough to fit into my day, but deep enough to actually change how I work." name="Maya Hassan" role="Product designer" /><FeedbackCard quote="It feels more like having a thoughtful mentor than taking an online course. I finally finished what I started." name="Omar Khalil" role="Frontend developer" /><FeedbackCard quote="The clarity and calm of the platform make learning feel exciting again. Highly recommended." name="Sara Adel" role="Marketing lead" /></div></section>
  </div>;
}

function SectionHeading({ label, title, action, onAction }: { label: string; title: string; action?: string; onAction?: () => void }) { return <div className="section-heading"><div><div className="eyebrow">{label}</div><h2>{title}</h2></div>{action && <button className="link-btn" onClick={onAction}>{action} <ArrowRight size={15} /></button>}</div>; }

function CourseCard({ course, onOpen }: { course: Course; onOpen: (course: Course) => void }) { return <article className="course-card"><button className={`course-art ${course.tone}`} onClick={() => onOpen(course)} aria-label={`Open ${course.title}`}><div className="art-shape shape-one" /><div className="art-shape shape-two" /><span className="category-pill">{course.category}</span><PlayCircle size={25} className="play-icon" /></button><div className="course-info"><div className="course-title-row"><h3>{course.title}</h3><strong>{course.price}</strong></div><p>{course.lessons} lessons <span>•</span> {course.duration}</p><div className="course-meta"><span><Star size={14} fill="currentColor" /> {course.rating} <small>({course.students})</small></span><button onClick={() => onOpen(course)}>View course <ArrowRight size={14} /></button></div></div></article>; }

function Courses({ onCourse, onBack, courses }: { onCourse: (course: Course) => void; onBack: () => void; courses: Course[] }) { const [query, setQuery] = useState(''); const filtered = useMemo(() => courses.filter(course => `${course.title} ${course.category}`.toLowerCase().includes(query.toLowerCase())), [query, courses]); return <div className="page listing-page"><button className="back-btn" onClick={onBack}>← Back home</button><div className="listing-hero"><div><div className="eyebrow">Make space to grow</div><h1>All courses</h1><p>Small steps, useful skills, and a library designed to meet you where you are.</p></div><div className="search-box"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search courses" /></div></div><div className="filter-row"><button className="filter-active">All courses</button><button>Design</button><button>Development</button><button>Business</button><button>Creative</button></div><div className="course-grid">{filtered.map(course => <CourseCard key={course.id} course={course} onOpen={onCourse} />)}</div>{filtered.length === 0 && <EmptyState title="No courses found" text="Try a different search term." />}</div>; }

function CourseDetails({ course, onBack, onEnroll }: { course: Course; onBack: () => void; onEnroll: () => void }) { return <div className="page detail-page"><button className="back-btn" onClick={onBack}>← All courses</button><div className="detail-grid"><div><div className={`course-art detail-art ${course.tone}`}><div className="art-shape shape-one" /><div className="art-shape shape-two" /><span className="category-pill">{course.category}</span><PlayCircle size={34} className="play-icon" /></div><div className="detail-copy"><div className="eyebrow">A guided learning path</div><h1>{course.title}</h1><p>{course.description}</p><div className="detail-stats"><span><BookOpen size={17} /> {course.lessons} lessons</span><span><Clock3 size={17} /> {course.duration}</span><span><Star size={17} fill="currentColor" /> {course.rating} rating</span></div><h3>What you will learn</h3><div className="check-list"><span><Check size={15} /> Build a confident foundation</span><span><Check size={15} /> Practice with real-world exercises</span><span><Check size={15} /> Leave with work you can be proud of</span></div></div></div><aside className="enroll-card glass-card"><div className="eyebrow">Start learning today</div><div className="price-large">{course.price}<span> one-time</span></div><p>Get lifetime access to every lesson, material, and future update.</p><button className="primary-btn full" onClick={onEnroll}>Enroll in this course <ArrowRight size={17} /></button><div className="secure-note"><ShieldCheck size={16} /> Secure enrollment · cancel anytime</div></aside></div></div>; }

function FeedbackCard({ quote, name, role }: { quote: string; name: string; role: string }) { return <article className="feedback-card glass-card"><div className="stars">★★★★★</div><p>“{quote}”</p><div className="person"><span>{name.split(' ').map(part => part[0]).join('')}</span><div><strong>{name}</strong><small>{role}</small></div></div></article>; }

function Auth({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const { login, signup, loginWithGoogle, forgotPassword } = useAuth();
  const [register, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    try {
      if (register) await signup(name, email, password);
      else await login(email, password);
      onContinue();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(''); setInfo(''); setBusy(true);
    try {
      await loginWithGoogle();
      onContinue();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot() {
    setError(''); setInfo('');
    if (!email) return setError('اكتب بريدك الإلكتروني الأول.');
    try {
      await forgotPassword(email);
      setInfo('لو البريد ده مسجّل عندنا، هيوصلك رابط لإعادة تعيين كلمة السر.');
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  }

  return <div className="page auth-page"><button className="back-btn" onClick={onBack}>← Back home</button><div className="auth-layout"><div className="auth-message"><div className="eyebrow"><Sparkles size={15} /> Your learning space</div><h1>Make room for<br /><em>what is next.</em></h1><p>Sign in to continue learning, or create a free account and find a path that feels like yours.</p><div className="auth-quote">“The secret of getting ahead is getting started.”<small>— Mark Twain</small></div></div><form className="glass-card auth-card" onSubmit={handleSubmit}><div className="auth-card-heading"><h2>{register ? 'Create your account' : 'Welcome back'}</h2><p>{register ? 'Start your learning journey with 5JAD.' : 'Continue where you left off.'}</p></div>
    {error && <div className="auth-form-alert error">{error}</div>}
    {info && <div className="auth-form-alert success">{info}</div>}
    {register && <label>Full name<input required placeholder="Your name" value={name} onChange={e => setName(e.target.value)} /></label>}
    <label>Email address<input required type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>Password<input required type="password" minLength={6} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></label>
    {!register && <button type="button" className="forgot" onClick={handleForgot}>Forgot password?</button>}
    <button className="primary-btn full" type="submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></button>
    <div className="auth-divider"><span>or</span></div>
    <button type="button" className="secondary-btn full" onClick={handleGoogle} disabled={busy}>Continue with Google</button>
    <button type="button" className="text-btn full" style={{ justifyContent: 'center', marginTop: 12 }} onClick={() => setRegister(!register)}>{register ? 'I already have an account' : 'Create a free account'}</button>
    <p className="terms">By continuing, you agree to our Terms and Privacy Policy.</p></form></div></div>;
}

function Plans({ onBack, onSelect, plans }: { onBack: () => void; onSelect: () => void; plans: PlanDoc[] }) { return <div className="page plans-page"><button className="back-btn" onClick={onBack}>← Home</button><div className="center-heading"><div className="eyebrow">One step closer</div><h1>Choose your learning plan.</h1><p>Subscribe once your payment is approved, and your full dashboard will open up.</p></div><div className="plan-grid">{plans.map(plan => <article key={plan.id} className={`plan-card glass-card ${plan.featured ? 'featured' : ''}`}>{plan.featured && <span className="recommended">Most popular</span>}<div className="plan-icon"><Target size={19} /></div><h2>{plan.name}</h2><p>{plan.description}</p><div className="plan-price">{plan.price}<small>{plan.duration}</small></div><ul>{plan.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul><button className={plan.featured ? 'primary-btn full' : 'secondary-btn full'} onClick={onSelect}>Choose plan <ArrowRight size={16} /></button></article>)}</div><div className="payment-note glass-card"><ShieldCheck size={22} /><div><strong>Manual payment, personal support.</strong><p>After choosing a plan, you will see Vodafone Cash and InstaPay instructions. Send your receipt for approval and we will unlock your space.</p></div></div></div>; }

function DashboardShell({ admin, section, onSection, onExit, onToast, profile, uid, plans, courses }: {
  admin: boolean; section: DashboardSection; onSection: (section: DashboardSection) => void; onExit: () => void;
  onToast: (message: string) => void; profile: UserProfile | null; uid?: string; plans: PlanDoc[]; courses: Course[];
}) {
  const nav = admin
    ? [{ id: 'overview' as const, label: 'Overview', icon: LayoutDashboard }, { id: 'courses' as const, label: 'Courses', icon: BookOpen }, { id: 'exams' as const, label: 'Exams', icon: Target }, { id: 'subscription' as const, label: 'Payment requests', icon: ShieldCheck }, { id: 'notifications' as const, label: 'Notifications', icon: Bell }]
    : [{ id: 'overview' as const, label: 'Dashboard', icon: LayoutDashboard }, { id: 'courses' as const, label: 'My courses', icon: BookOpen }, { id: 'exams' as const, label: 'Exams', icon: Target }, { id: 'materials' as const, label: 'Materials', icon: Sparkles }, { id: 'grades' as const, label: 'My grades', icon: Trophy }, { id: 'subscription' as const, label: 'Subscription', icon: ShieldCheck }, { id: 'notifications' as const, label: 'Notifications', icon: Bell }];
  const displayName = profile?.name || (admin ? 'Admin' : 'Student');
  const initials = displayName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return <div className="dashboard-layout"><aside className="dash-sidebar glass-panel"><button className="brand" onClick={onExit}><span className="brand-mark"><GraduationCap size={24} strokeWidth={1.5} /></span><span className="brand-five">5</span><span>JAD</span></button><div className="dash-label">{admin ? 'Workspace' : 'Learning space'}</div><nav>{nav.map(item => { const Icon = item.icon; return <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => onSection(item.id)}><Icon size={17} />{item.label}</button>; })}</nav><div className="sidebar-bottom"><button onClick={() => onSection('profile')}><UserRound size={17} /> Profile</button><button onClick={onExit}><ArrowRight size={17} /> Sign out</button></div></aside><section className="dashboard-main"><header className="dash-topbar"><div><span className="dash-kicker">{admin ? 'Admin workspace' : 'Welcome back'}</span><h1>Good morning, {displayName.split(' ')[0]}.</h1></div><div className="dash-actions"><button className="icon-btn"><Search size={18} /></button><button className="icon-btn notification"><Bell size={18} /></button><button className="account-chip"><span>{initials}</span><span className="account-name">{displayName}</span><ChevronDown size={15} /></button></div></header>{admin ? <AdminContent section={section} onToast={onToast} onSection={onSection} courses={courses} /> : <StudentContent section={section} onSection={onSection} onToast={onToast} profile={profile} uid={uid} plans={plans} courses={courses} />}</section></div>;
}

function StudentContent({ section, onSection, onToast, profile, uid, plans, courses }: {
  section: DashboardSection; onSection: (section: DashboardSection) => void; onToast: (message: string) => void;
  profile: UserProfile | null; uid?: string; plans: PlanDoc[]; courses: Course[];
}) {
  if (section === 'subscription') return <SubscriptionView onToast={onToast} profile={profile} uid={uid} plans={plans} />;
  if (section === 'courses') return <CourseProgressView courses={courses} unlocked={profile?.subscriptionStatus === 'approved'} onSection={onSection} />;
  if (section === 'grades') return <GradesView />;
  if (section === 'materials') return <MaterialsView />;
  if (section === 'notifications') return <NotificationsView uid={uid} />;
  if (section === 'exams') return <ExamView onToast={onToast} />;
  return <div className="dash-content"><div className="welcome-banner glass-card"><div><span className="eyebrow">Your learning overview</span><h2>Keep your momentum, {(profile?.name || 'there').split(' ')[0]}.</h2><p>You are making steady progress. A little time today goes a long way.</p><button className="secondary-btn" onClick={() => onSection('courses')}>Continue learning <ArrowRight size={16} /></button></div><div className="banner-orbit"><Trophy size={44} strokeWidth={1.2} /><span>72%</span></div></div><div className="dash-grid"><ProgressCard /><div className="dash-card glass-card"><CardTitle title="Next up" action="View all" /><div className="next-item"><span className="next-number">01</span><div><strong>Design principles</strong><small>UI/UX Design Fundamentals</small></div><button onClick={() => onSection('courses')}><PlayCircle size={22} /></button></div><div className="next-item"><span className="next-number">02</span><div><strong>Typography in practice</strong><small>UI/UX Design Fundamentals</small></div><button onClick={() => onSection('courses')}><PlayCircle size={22} /></button></div></div></div><div className="dash-grid lower"><div className="dash-card glass-card"><CardTitle title="Recent activity" action="See all" /><div className="activity"><Check size={16} /><div><strong>Module completed</strong><small>Wireframing basics · Today</small></div><span>+12%</span></div><div className="activity"><Trophy size={16} /><div><strong>Badge earned</strong><small>Consistent learner · Yesterday</small></div><span>New</span></div></div><div className="dash-card glass-card level-card"><div><span className="eyebrow">Current level</span><h3>Thoughtful builder</h3><p>240 XP to the next level</p></div><div className="level-ring"><span>3</span><small>level</small></div></div></div></div>;
}

function ProgressCard() { return <div className="dash-card glass-card"><CardTitle title="Your progress" action="Details" /><div className="progress-circle"><div><strong>72%</strong><span>overall</span></div></div><div className="progress-list"><span><i className="violet-dot" />Completed <b>18 lessons</b></span><span><i className="blue-dot" />In progress <b>6 lessons</b></span></div></div>; }
function CardTitle({ title, action }: { title: string; action: string }) { return <div className="card-title"><h3>{title}</h3><button>{action} <ArrowRight size={13} /></button></div>; }
function SubscriptionView({ onToast, profile, uid, plans }: { onToast: (message: string) => void; profile: UserProfile | null; uid?: string; plans: PlanDoc[] }) {
  const request = useMyPaymentRequest(uid);
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
        uid, name: profile.name, email: profile.email, plan: selectedPlan.name, amount: selectedPlan.price, receiptUrl,
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
      <div className="plan-grid">{plans.map(plan => <article key={plan.id} className={`plan-card glass-card ${plan.featured ? 'featured' : ''}`}>{plan.featured && <span className="recommended">Most popular</span>}<div className="plan-icon"><Target size={19} /></div><h2>{plan.name}</h2><p>{plan.description}</p><div className="plan-price">{plan.price}<small>{plan.duration}</small></div><ul>{plan.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul><button className={plan.featured ? 'primary-btn full' : 'secondary-btn full'} onClick={() => setSelectedPlan(plan)}>Choose plan <ArrowRight size={16} /></button></article>)}</div>
    ) : (
      <div className="subscription-card glass-card" style={{ maxWidth: 480 }}>
        <div className="sub-icon"><ShieldCheck size={23} /></div>
        <span className="eyebrow">{selectedPlan.name} · {selectedPlan.price}</span>
        <h2>Upload your payment receipt</h2>
        <p>Send {selectedPlan.price} via Vodafone Cash or InstaPay, then upload a screenshot of the receipt below.</p>
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
function CourseProgressView({ courses, unlocked, onSection }: { courses: Course[]; unlocked: boolean; onSection: (section: DashboardSection) => void }) {
  if (!unlocked) {
    return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Keep going</span><h2>My courses</h2><p>Your courses will unlock once your subscription is approved.</p></div></div><div className="unlock-card glass-card"><LockKeyhole size={23} /><h3>No active subscription yet.</h3><p>Choose a plan and send your payment receipt to unlock all courses.</p><button className="secondary-btn full" onClick={() => onSection('subscription')}>Go to subscription <ArrowRight size={16} /></button></div></div>;
  }
  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Keep going</span><h2>My courses</h2><p>Pick up where you left off.</p></div></div><div className="dashboard-course-grid">{courses.map(course => <article className="dash-course glass-card" key={course.id}><div className={`mini-art ${course.tone}`}><span>{course.category}</span><PlayCircle size={20} /></div><h3>{course.title}</h3><p>{course.lessons} lessons · {course.duration}</p><div className="bar"><i style={{ width: '0%' }} /></div><div className="course-bottom"><span>Not started</span><button>Continue <ArrowRight size={14} /></button></div></article>)}</div></div>;
}
function GradesView() { return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Your results</span><h2>My grades</h2><p>A clear view of your progress and achievements.</p></div></div><div className="grade-summary"><div className="glass-card"><span>Average score</span><strong>88%</strong><small>+8% this month</small></div><div className="glass-card"><span>Exams completed</span><strong>04</strong><small>2 remaining</small></div><div className="glass-card"><span>Certificates</span><strong>02</strong><small>Keep going</small></div></div><div className="table-card glass-card"><div className="card-title"><h3>Exam history</h3><button>Download report <ArrowRight size={13} /></button></div><div className="grade-table"><div className="table-row table-head"><span>Exam</span><span>Course</span><span>Date</span><span>Score</span><span>Status</span></div>{[['Design foundations','UI/UX Fundamentals','Jun 18, 2024','92%','Passed'],['Brand thinking','Product Management 101','May 29, 2024','84%','Passed'],['Typography basics','UI/UX Fundamentals','May 12, 2024','88%','Passed']].map(row => <div className="table-row" key={row[0]}>{row.map((cell, index) => <span className={index === 4 ? 'status-text' : ''} key={cell}>{cell}</span>)}</div>)}</div></div></div>; }
function MaterialsView() { return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Your toolkit</span><h2>Materials</h2><p>Resources to make practice feel a little easier.</p></div></div><div className="materials-grid">{['Course workbook.pdf','Design checklist.pdf','Typography reference','Project brief.docx'].map((material, index) => <div className="material-card glass-card" key={material}><div className={`file-icon file-${index}`}><BookOpen size={20} /></div><div><strong>{material}</strong><small>{index === 2 ? 'External link' : 'UI/UX Fundamentals · 2.4 MB'}</small></div><button><ArrowRight size={16} /></button></div>)}</div></div>; }
function NotificationsView({ uid }: { uid?: string }) {
  const items = useNotifications(uid);
  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Stay in the loop</span><h2>Notifications</h2><p>Helpful reminders, new resources, and small wins.</p></div></div>
    {items.length === 0
      ? <EmptyState title="No notifications yet" text="We will let you know here when there is something new." />
      : <div className="notification-list glass-card">{items.map(item => <div className={!item.read ? 'notification-item unread' : 'notification-item'} key={item.id}><span className="notification-dot"><Bell size={16} /></span><div><strong>{item.title}</strong><p>{item.body}</p></div></div>)}</div>}
  </div>;
}
function ExamView({ onToast }: { onToast: (message: string) => void }) { return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Test your understanding</span><h2>Exams</h2><p>Thoughtful practice helps ideas stay with you.</p></div></div><div className="exam-card glass-card"><div className="exam-top"><div className="exam-icon"><Target size={25} /></div><span className="status-pill ready">Ready to start</span></div><h2>Design foundations</h2><p>UI/UX Design Fundamentals · 12 questions · 20 minutes</p><div className="exam-details"><span><Clock3 size={16} />20 min</span><span><Target size={16} />Pass mark 70%</span><span><BookOpen size={16} />1 attempt</span></div><button className="primary-btn" onClick={() => onToast('Exam mode will open after your subscription is approved.')}>Start exam <ArrowRight size={17} /></button></div></div>; }
function AdminContent({ section, onToast, onSection, courses }: {
  section: DashboardSection; onToast: (message: string) => void; onSection: (section: DashboardSection) => void; courses: Course[];
}) {
  if (section === 'courses') return <AdminCoursesView courses={courses} onToast={onToast} />;
  if (section === 'subscription') return <AdminPaymentRequestsView onToast={onToast} />;
  if (section === 'notifications') return <EmptyState title="Notification composer — coming soon" text="Sending announcements to students will be available in a future update." />;
  if (section === 'exams') return <EmptyState title="Exam builder — coming soon" text="Creating and grading exams will be available in a future update." />;
  return <AdminOverview onToast={onToast} onSection={onSection} courses={courses} />;
}

function AdminOverview({ onToast, onSection, courses }: { onToast: (message: string) => void; onSection: (section: DashboardSection) => void; courses: Course[] }) {
  const stats = useAdminStats();
  const requests = usePaymentRequestsAdmin();
  const recent = requests.slice(0, 5);
  return <div className="dash-content"><div className="admin-intro"><div><span className="eyebrow">Platform pulse</span><h2>A gentle overview of 5JAD.</h2><p>Everything your learning community needs, in one clear place.</p></div><button className="primary-btn" onClick={() => onSection('courses')}>Add new course <ArrowRight size={16} /></button></div><div className="admin-stats"><StatCard label="Total students" value={String(stats.totalStudents)} trend="Live" icon={UserRound} /><StatCard label="Active subscriptions" value={String(stats.activeSubscriptions)} trend="Live" icon={ShieldCheck} /><StatCard label="Pending requests" value={String(stats.pendingRequests)} trend="Needs review" icon={Clock3} /><StatCard label="Published courses" value={String(courses.length)} trend="Live" icon={BookOpen} /></div><div className="admin-columns"><div className="table-card glass-card"><div className="card-title"><h3>Recent payment requests</h3><button onClick={() => onSection('subscription')}>View all <ArrowRight size={13} /></button></div>{recent.length === 0 ? <p style={{ padding: '12px 0' }}>No payment requests yet.</p> : <div className="grade-table"><div className="table-row table-head"><span>Student</span><span>Plan</span><span>Amount</span><span>Status</span></div>{recent.map(row => <div className="table-row" key={row.id}><span><b>{row.name}</b><small>{row.email}</small></span><span>{row.plan}</span><span>{row.amount}</span><span className={row.status === 'approved' ? 'status-text' : 'pending-text'}>{row.status}</span></div>)}</div>}</div><div className="dash-card glass-card activity-card"><CardTitle title="Quick actions" action="" /><button onClick={() => onSection('courses')}><BookOpen size={17} />Manage courses <ArrowRight size={15} /></button><button onClick={() => onSection('subscription')}><ShieldCheck size={17} />Review payment requests <ArrowRight size={15} /></button><button onClick={() => onToast('Notification composer is coming soon.')}><Bell size={17} />Send notification <ArrowRight size={15} /></button></div></div></div>;
}

function AdminCoursesView({ courses, onToast }: { courses: Course[]; onToast: (message: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', lessons: '8', duration: '3h', price: '$29', category: 'Development', tone: 'blue' });

  async function submit() {
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      await addCourse({
        title: form.title, description: form.description, lessons: Number(form.lessons) || 0,
        duration: form.duration, price: form.price, rating: '5.0', students: '0', category: form.category, tone: form.tone,
      });
      onToast('Course added.');
      setShowForm(false);
      setForm({ title: '', description: '', lessons: '8', duration: '3h', price: '$29', category: 'Development', tone: 'blue' });
    } finally {
      setBusy(false);
    }
  }

  return <div className="dash-content"><div className="content-heading"><div><span className="eyebrow">Content</span><h2>Courses</h2><p>Manage what students see in the catalog.</p></div><button className="primary-btn" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add new course'} <ArrowRight size={16} /></button></div>
    {showForm && <div className="subscription-card glass-card" style={{ marginBottom: 18 }}>
      <label>Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
      <label>Description<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>Lessons<input value={form.lessons} onChange={e => setForm({ ...form, lessons: e.target.value })} /></label>
        <label style={{ flex: 1 }}>Duration<input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></label>
        <label style={{ flex: 1 }}>Price<input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
      </div>
      <button className="primary-btn full" onClick={submit} disabled={busy || !form.title.trim()}>{busy ? 'Saving…' : 'Save course'}</button>
    </div>}
    <div className="dashboard-course-grid">{courses.map(course => <article className="dash-course glass-card" key={course.id}><div className={`mini-art ${course.tone}`}><span>{course.category}</span><PlayCircle size={20} /></div><h3>{course.title}</h3><p>{course.lessons} lessons · {course.duration}</p></article>)}</div>
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
        <span className={`status-pill ${r.status === 'approved' ? 'ready' : r.status === 'rejected' ? 'pending' : 'pending'}`}>{r.status}</span>
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
function Footer() { return <footer><div className="footer-brand"><span className="brand-five">5</span>JAD</div><span>© 2024 5JAD · Learn with intention.</span><div><button>Privacy</button><button>Terms</button><button>Contact</button></div></footer>; }

export default App;
