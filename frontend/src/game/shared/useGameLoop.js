import { useEffect, useRef } from 'react';
export default function useGameLoop(active, onFrame) {
  const callback = useRef(onFrame);
  callback.current = onFrame;
  useEffect(() => {
    if (!active) return;
    let frame, last;
    function tick(now) {
      const dt = last === undefined ? 0 : Math.min(now - last, 50);
      last = now;
      if (callback.current(dt) === false) return;
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}
