import { useEffect, useRef, useState } from 'react';
import './interactive.css';

export default function InteractiveExperience() {
  const cursor = useRef(null),
    spark = useRef(null);
  const [enabled, setEnabled] = useState(() => localStorage.getItem('arcade-motion') !== 'off');
  useEffect(() => {
    localStorage.setItem('arcade-motion', enabled ? 'on' : 'off');
    if (
      !enabled ||
      !matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches
    )
      return;
    const ring = cursor.current,
      burst = spark.current;
    let frame;
    let targetX = -100,
      targetY = -100,
      x = -100,
      y = -100;
    let card = null;
    document.documentElement.classList.add('playful-motion');
    function move(e) {
      targetX = e.clientX;
      targetY = e.clientY;
      ring.dataset.active = !!e.target.closest('button,a,[draggable=true]');
      ring.dataset.label = e.target.closest('[draggable=true]')
        ? 'DRAG'
        : e.target.closest('.milo-character')
          ? 'HEY!'
          : '';
      const next = e.target.closest('.email-card,.how article');
      if (card && card !== next) {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      }
      card = next;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty(
          '--tilt-x',
          `${(-(e.clientY - r.top - r.height / 2) / r.height) * 5}deg`,
        );
        card.style.setProperty(
          '--tilt-y',
          `${((e.clientX - r.left - r.width / 2) / r.width) * 5}deg`,
        );
      }
    }
    function tick() {
      x += (targetX - x) * 0.17;
      y += (targetY - y) * 0.17;
      ring.style.transform = `translate3d(${x}px,${y}px,0)`;
      frame = requestAnimationFrame(tick);
    }
    function click(e) {
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      burst.classList.remove('pop');
      void burst.offsetWidth;
      burst.classList.add('pop');
    }
    function leave() {
      targetX = -100;
      targetY = -100;
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', click);
    document.addEventListener('pointerleave', leave);
    tick();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', click);
      document.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove('playful-motion');
      if (card) {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      }
    };
  }, [enabled]);
  return (
    <>
      <div ref={cursor} className="play-cursor" aria-hidden="true">
        <i />
        <span />
      </div>
      <div ref={spark} className="cursor-spark" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} style={{ '--angle': `${i * 60}deg` }} />
        ))}
      </div>
      <button
        className="motion-setting"
        aria-pressed={enabled}
        onClick={() => setEnabled((v) => !v)}
      >
        {enabled ? '✦ Effects on' : '✧ Effects off'}
      </button>
    </>
  );
}
