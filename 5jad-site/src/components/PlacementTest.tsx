import { useState } from 'react';
import { ArrowRight, Check, RotateCcw, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { LEVELS, MAX_Q, initialPosterior, isDone, loadSeen, markSeen, pickItem, summarize, updatePosterior, type Item } from '../lib/placementTest';
import type { DictKey } from '../lib/translations';

type T = (key: DictKey) => string;
type Phase = 'intro' | 'quiz' | 'result';

// Which coursebook track each CEFR level points to. Adjust here if your tracks change.
const trackKey = (index: number): DictKey => (index <= 1 ? 'pt.trackBeginner' : index === 2 ? 'pt.trackInter' : 'pt.trackAdv');

export default function PlacementTest({ onBack, onExplore, onAuth, t }: { onBack: () => void; onExplore: () => void; onAuth: () => void; t: T }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [post, setPost] = useState<number[]>(initialPosterior);
  const [asked, setAsked] = useState<Item[]>([]);
  const [current, setCurrent] = useState<Item | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);

  const start = () => {
    const p = initialPosterior();
    setPost(p); setAsked([]); setChosen(null);
    setCurrent(pickItem(p, [], loadSeen()));
    setPhase('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = () => {
    if (!current || chosen === null) return;
    const p = updatePosterior(post, current.level, chosen === current.correct);
    const list = [...asked, current];
    markSeen(current.key);
    setPost(p); setAsked(list); setChosen(null);
    if (isDone(p, list.length)) { setCurrent(null); setPhase('result'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else setCurrent(pickItem(p, list.map(i => i.key), loadSeen()));
  };

  if (phase === 'intro') {
    return <div className="page pt-page">
      <button className="back-btn" onClick={onBack}>{t('courses.backHome')}</button>
      <div className="pt-intro">
        <div className="eyebrow"><Target size={13} /> {t('pt.label')}</div>
        <h1>{t('pt.title1')} <em>{t('pt.titleEm')}</em></h1>
        <p className="pt-lead">{t('pt.desc')}</p>
        <div className="check-list pt-points"><span><Check size={15} /> {t('pt.point1')}</span><span><Check size={15} /> {t('pt.point2')}</span><span><Check size={15} /> {t('pt.point3')}</span></div>
        <button className="primary-btn" onClick={start}>{t('pt.start')} <ArrowRight size={17} /></button>
      </div>
    </div>;
  }

  if (phase === 'quiz' && current) {
    return <div className="page pt-page">
      <div className="pt-card glass-card">
        <div className="pt-top"><span>{t('pt.question')} {asked.length + 1}</span><span>{t('pt.hint')}</span></div>
        <div className="pt-progress" role="progressbar" aria-valuemin={0} aria-valuemax={MAX_Q} aria-valuenow={asked.length}><i style={{ width: `${(asked.length / MAX_Q) * 100}%` }} /></div>
        <div className="pt-q" key={current.key} dir="ltr">
          <h2>{current.text}</h2>
          {current.options.map(option => <button key={option} className={`pt-option${chosen === option ? ' selected' : ''}`} onClick={() => setChosen(option)}>{option}</button>)}
        </div>
        <button className="primary-btn" disabled={chosen === null} onClick={submit}>{t('pt.next')} <ArrowRight size={17} /></button>
      </div>
    </div>;
  }

  const { index, code, confidence } = summarize(post);
  const percent = Math.round(confidence * 100);
  return <div className="page pt-page">
    <div className="pt-card glass-card pt-result">
      <div className="eyebrow"><Sparkles size={13} /> {t('pt.yourLevel')}</div>
      <div className="pt-level">{code}</div>
      <h3>{t(trackKey(index))}</h3>
      <p>{t(`pt.level.${code}` as DictKey)}</p>
      <div className="pt-meter">{LEVELS.map((l, i) => <div key={l} className={i === index ? 'top' : post[i] > 0.15 ? 'on' : ''}><b />{l}</div>)}</div>
      <p className="pt-note">{t('pt.answered')}: {asked.length} · {t('pt.confidence')}: {percent}%{percent < 70 ? ` — ${t('pt.approx')}` : ''}</p>
      <div className="pt-actions">
        <button className="primary-btn" onClick={onExplore}>{t('pt.explore')} <ArrowRight size={17} /></button>
        <button className="secondary-btn" onClick={onAuth}><ShieldCheck size={16} /> {t('pt.create')}</button>
        <button className="text-btn" onClick={start}><RotateCcw size={14} /> {t('pt.retake')}</button>
      </div>
    </div>
  </div>;
}
