import { it, expect } from 'vitest';
import {
  HOOPS,
  recommendedVelocity,
  basketPosition,
  crossedHoop,
  aimHits,
  asteroidPosition,
} from '../../frontend/src/game/shared/math.js';
import { GAMES, getGame } from '../../frontend/src/game/catalog.js';
it('each guided shot crosses its selected hoop on descent', () => {
  for (const target of Object.values(HOOPS)) {
    const velocity = recommendedVelocity(target);
    expect(
      crossedHoop(basketPosition(velocity, 1.34), basketPosition(velocity, 1.36), target),
    ).toBe(true);
  }
});
it('a ball outside the chosen rim is not a basket', () =>
  expect(crossedHoop({ x: 500, y: 159 }, { x: 500, y: 161 }, HOOPS.archive)).toBe(false));
it('laser hit detection rejects shots away from the asteroid', () => {
  expect(aimHits({ x: 1, y: 1 }, { x: 10, y: 10 })).toBe(true);
  expect(aimHits({ x: 1, y: 1 }, { x: 300, y: 300 })).toBe(false);
});
it('moving asteroids stay inside the visible arena', () => {
  for (let t = 0; t < 120000; t += 500) {
    const p = asteroidPosition(t);
    expect(p.x).toBeGreaterThan(100);
    expect(p.x).toBeLessThan(800);
    expect(p.y).toBeGreaterThan(50);
    expect(p.y).toBeLessThan(380);
  }
});
it('every game has a unique id and unknown ids fall back safely', () => {
  expect(new Set(GAMES.map((g) => g.id)).size).toBe(3);
  expect(getGame('unknown').id).toBe('cricket');
});
