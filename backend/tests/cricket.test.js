import { it, expect } from 'vitest';
import {
  judgeTiming,
  deliveryPosition,
  shotPosition,
  TARGETS,
} from '../../frontend/src/game/cricket/physics.js';
it('rewards a clean timed shot with six', () => expect(judgeTiming(0.92).runs).toBe(6));
it('does not score an early or late swing', () => {
  expect(judgeTiming(0.3).runs).toBe(0);
  expect(judgeTiming(1.25).runs).toBe(0);
});
it('rewards playable edges less than a clean shot', () => {
  expect(judgeTiming(0.79).runs).toBe(4);
  expect(judgeTiming(0.65).runs).toBe(2);
});
it('sends each hit to its explicitly selected target', () => {
  const start = deliveryPosition(0.92);
  for (const target of Object.values(TARGETS)) {
    expect(shotPosition(start, target, 0)).toEqual(start);
    expect(shotPosition(start, target, 1).x).toBe(target.x);
    expect(shotPosition(start, target, 1).y).toBeCloseTo(target.y);
  }
});
