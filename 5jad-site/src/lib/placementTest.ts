import { BANK, type RawItem } from './placementBank';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type LevelCode = (typeof LEVELS)[number];
export type Item = { key: string; level: number; text: string; options: string[]; correct: string };

export const MAX_Q = 20;
export const MIN_Q = 12;
export const CONFIDENCE = 0.85;
const SEEN_KEY = '5jad_placement_seen';

// Probability of a correct answer for a learner at level `theta` on an item of level `d`.
// 0.25 floor = guessing on 4 options; 0.95 ceiling = careless slips.
const prob = (theta: number, d: number) => 0.25 + 0.7 / (1 + Math.exp(-1.7 * (theta - d)));

export const initialPosterior = () => Array(LEVELS.length).fill(1 / LEVELS.length) as number[];
export const posteriorMean = (p: number[]) => p.reduce((sum, v, i) => sum + v * i, 0);

export function updatePosterior(p: number[], itemLevel: number, correct: boolean) {
  const next = p.map((v, theta) => v * (correct ? prob(theta, itemLevel) : 1 - prob(theta, itemLevel)));
  const total = next.reduce((a, b) => a + b, 0);
  return next.map(v => v / total);
}

export const isDone = (p: number[], answered: number) =>
  answered >= MAX_Q || (answered >= MIN_Q && Math.max(...p) >= CONFIDENCE);

export function summarize(p: number[]) {
  const confidence = Math.max(...p);
  const index = p.indexOf(confidence);
  return { index, code: LEVELS[index], confidence };
}

export function loadSeen(): Record<string, 1> {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch { return {}; }
}
export function markSeen(key: string) {
  try { const s = loadSeen(); s[key] = 1; localStorage.setItem(SEEN_KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}

const shuffle = <T,>(arr: T[]) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Picks the next question near the current ability estimate, preferring ones this device has not seen before.
export function pickItem(p: number[], askedKeys: string[], seen: Record<string, 1>): Item {
  const target = askedKeys.length ? Math.max(0, Math.min(5, Math.round(posteriorMean(p)))) : 2;
  for (let d = 0; d < LEVELS.length; d++) {
    for (const level of d ? [target - d, target + d] : [target]) {
      if (level < 0 || level > 5) continue;
      const code = LEVELS[level];
      const all = BANK[code].map((raw: RawItem, i: number) => ({ raw, key: `${code}:${i}` }));
      let pool = all.filter(x => !askedKeys.includes(x.key));
      const fresh = pool.filter(x => !seen[x.key]);
      if (fresh.length) pool = fresh;
      if (pool.length) {
        const { raw, key } = pool[Math.floor(Math.random() * pool.length)];
        return { key, level, text: raw[0], correct: raw[1], options: shuffle(raw.slice(1)) };
      }
    }
  }
  throw new Error('Placement bank is empty');
}
