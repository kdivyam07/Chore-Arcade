export const DELIVERY_MS = 2100;
export const SHOT_MS = 850;
export const TARGETS = {
  archive: { x: 130, y: 115 },
  read: { x: 450, y: 75 },
  keep: { x: 770, y: 115 },
};
export function judgeTiming(progress) {
  if (progress < 0.6 || progress > 1.22)
    return { runs: 0, label: progress < 0.6 ? 'TOO EARLY!' : 'TOO LATE!' };
  const distance = Math.abs(progress - 0.92);
  return distance <= 0.07
    ? { runs: 6, label: 'SIX!' }
    : distance <= 0.17
      ? { runs: 4, label: 'FOUR!' }
      : { runs: 2, label: 'TWO RUNS!' };
}
export function deliveryPosition(progress) {
  return { x: 450 + Math.sin(progress * Math.PI) * 22, y: 145 + progress * 240 };
}
export function shotPosition(start, target, progress) {
  return {
    x: start.x + (target.x - start.x) * progress,
    y: start.y + (target.y - start.y) * progress - Math.sin(progress * Math.PI) * 150,
  };
}
