/**
 * SI Exploration: Prints how SI responds to different behavior score patterns.
 *
 * Run:
 *   npm run test -- src/lib/si_exploration.test.ts -t SI-Exploration
 * or just:
 *   npm run test
 */

import { calculateSuperintelligenceIndex } from './calculations';

type Scores = [number, number, number, number, number, number];

function measure(label: string, scores: Scores) {
  const { si, aperture, deviation } = calculateSuperintelligenceIndex(scores);
  return { label, scores, si, aperture, deviation };
}

describe('SI-Exploration', () => {
  test('Common patterns (compact log)', () => {
    const items = [
      measure('Balanced all 8s', [8, 8, 8, 8, 8, 8]),
      measure('Balanced all 9s', [9, 9, 9, 9, 9, 9]),
      measure('Slight variance (8..9)', [9, 8, 9, 8, 9, 8]),
      measure('One lower dim', [9, 9, 9, 9, 9, 6]),
      measure('Two lower dims', [9, 9, 9, 6, 6, 9]),
      measure('Alternating 10/3', [10, 3, 10, 3, 10, 3]),
      measure('Skewed high→low', [10, 9, 8, 7, 6, 5]),
      measure('Flat mid (6s)', [6, 6, 6, 6, 6, 6]),
      measure('Flat low (3s)', [3, 3, 3, 3, 3, 3]),
      measure('User example (9s & one 8)', [9, 9, 9, 9, 8, 9]),
    ];

    // eslint-disable-next-line no-console
    items.forEach(({ label, scores, si, aperture }) => {
      console.log(`${label.padEnd(24)} scores=${scores.join(',')} si=${si.toFixed(2)} aperture=${aperture.toFixed(6)}`);
    });

    expect(items.length).toBeGreaterThan(0);
  });

  test('What raises SI? Targeted sweep around balanced scores', () => {
    // Explore small perturbations around mean m to see patterns that reduce aperture toward A*
    const m: Scores = [8, 8, 8, 8, 8, 8];
    const deltas = [0, 1, 2];
    const candidates: Array<{ label: string; scores: Scores; si: number; aperture: number }> = [];

    const push = (label: string, scores: Scores) => {
      const { si, aperture } = calculateSuperintelligenceIndex(scores);
      candidates.push({ label, scores, si, aperture });
    };

    // Single-dimension adjustments
    for (let i = 0; i < 6; i++) {
      for (const d of deltas) {
        const s1 = [...m] as Scores; s1[i] = Math.min(10, m[i] + d);
        const s2 = [...m] as Scores; s2[i] = Math.max(1, m[i] - d);
        push(`+${d} @${i}`, s1 as Scores);
        push(`-${d} @${i}`, s2 as Scores);
      }
    }

    // Two-dimension opposing adjustments (one up, one down)
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) {
        for (const d of deltas) {
          const s = [...m] as Scores;
          s[i] = Math.min(10, m[i] + d);
          s[j] = Math.max(1, m[j] - d);
          push(`+${d}@${i}/-${d}@${j}`, s as Scores);
        }
      }
    }

    // Sort by highest SI
    candidates.sort((a, b) => b.si - a.si);
    const top = candidates.slice(0, 8);

    // eslint-disable-next-line no-console
    top.forEach(({ label, scores, si, aperture }) => {
      console.log(`↑SI ${label.padEnd(10)} scores=${scores.join(',')} si=${si.toFixed(2)} aperture=${aperture.toFixed(6)}`);
    });

    // Expect at least one perturbation to improve over flat 8s (~12.42)
    expect(top[0].si).toBeGreaterThan(12.42);
  });
});


