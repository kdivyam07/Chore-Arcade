export const HOOPS = {
  archive: { x: 190, y: 160 },
  read: { x: 450, y: 130 },
  keep: { x: 710, y: 160 },
};
export const BALL_START = { x: 450, y: 420 };
export const GRAVITY = 520;
export function recommendedVelocity(target) {
  const duration = 1.35;
  return {
    x: (target.x - BALL_START.x) / duration,
    y: (target.y - BALL_START.y - 0.5 * GRAVITY * duration ** 2) / duration,
  };
}
export function basketPosition(velocity, time) {
  return {
    x: BALL_START.x + velocity.x * time,
    y: BALL_START.y + velocity.y * time + 0.5 * GRAVITY * time * time,
  };
}
export function crossedHoop(previous, current, target) {
  return previous.y < target.y && current.y >= target.y && Math.abs(current.x - target.x) < 39;
}
export function aimHits(aim, target, radius = 52) {
  return Math.hypot(aim.x - target.x, aim.y - target.y) <= radius;
}
export function asteroidPosition(time) {
  return { x: 450 + Math.sin(time / 820) * 245, y: 195 + Math.sin(time / 570) * 75 };
}
