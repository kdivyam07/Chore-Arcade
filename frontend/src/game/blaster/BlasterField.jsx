import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import EmailBrief from '../shared/EmailBrief';
import ActionTargets from '../shared/ActionTargets';
import useGameLoop from '../shared/useGameLoop';
import { aimHits, asteroidPosition } from '../shared/math';
import '../shared/other-games.css';

export default function BlasterField({ message, remaining, disabled, onDecision, onFeedback }) {
  const [target, setTarget] = useState('archive'),
    [phase, setPhase] = useState('aim'),
    [assisted, setAssisted] = useState(false),
    [outcome, setOutcome] = useState(null);
  const clock = useRef(0),
    rock = useRef(null),
    reticle = useRef(null),
    laser = useRef(null),
    aim = useRef({ x: 450, y: 195 }),
    position = useRef({ x: 450, y: 195 }),
    shot = useRef(null);
  useEffect(() => {
    clock.current = 0;
    setPhase('aim');
    setOutcome(null);
    position.current = asteroidPosition(0);
  }, [message?.id]);
  useGameLoop(!disabled && !!message && (phase === 'aim' || phase === 'flight'), (dt) => {
    clock.current += dt;
    if (phase === 'aim') {
      position.current = asteroidPosition(clock.current);
      rock.current?.setAttribute(
        'transform',
        `translate(${position.current.x} ${position.current.y})`,
      );
    } else {
      const t = Math.min(clock.current / 650, 1),
        destination = shot.current.aim;
      laser.current?.setAttribute(
        'transform',
        `translate(${450 + (destination.x - 450) * t} ${435 + (destination.y - 435) * t})`,
      );
      if (t === 1) {
        if (shot.current.hit) {
          setPhase('done');
          onDecision(shot.current.kind, 100);
          return false;
        }
        setPhase('miss');
        onFeedback('spaceMiss');
        return false;
      }
    }
  });
  function moveAim(point) {
    aim.current = point;
    reticle.current?.setAttribute('transform', `translate(${point.x} ${point.y})`);
  }
  function fire() {
    if (disabled || !message) return;
    if (phase === 'miss') {
      setPhase('aim');
      setOutcome(null);
      return;
    }
    if (phase !== 'aim') return;
    const destination = assisted ? { ...position.current } : { ...aim.current };
    const hit = aimHits(destination, position.current);
    shot.current = { kind: target, aim: destination, hit };
    clock.current = 0;
    setOutcome(hit ? 'hit' : 'miss');
    setPhase('flight');
    onFeedback('spaceLaunch');
  }
  useEffect(() => {
    function key(e) {
      if (e.repeat || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) || disabled)
        return;
      if (['1', '2', '3'].includes(e.key) && phase === 'aim') {
        e.preventDefault();
        setTarget(['archive', 'read', 'keep'][Number(e.key) - 1]);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        fire();
      }
      if (phase === 'aim' && e.key.startsWith('Arrow')) {
        e.preventDefault();
        const { x, y } = aim.current;
        moveAim({
          x: Math.max(
            30,
            Math.min(870, x + (e.key === 'ArrowRight' ? 30 : e.key === 'ArrowLeft' ? -30 : 0)),
          ),
          y: Math.max(
            50,
            Math.min(380, y + (e.key === 'ArrowDown' ? 25 : e.key === 'ArrowUp' ? -25 : 0)),
          ),
        });
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  const locked = disabled || phase !== 'aim';
  return (
    <div className="play-layout" data-game="blaster" data-phase={phase}>
      <EmailBrief message={message} remaining={remaining}>
        <label className="assisted-option">
          <input
            type="checkbox"
            checked={assisted}
            disabled={disabled || phase === 'flight'}
            onChange={(e) => setAssisted(e.target.checked)}
          />
          Relaxed mode · auto aim
        </label>
      </EmailBrief>
      <div className="space-arena">
        <div className="arena-top">
          <span>ORBIT BLASTER / DEEP INBOX</span>
          <b>{remaining} TARGETS LEFT</b>
        </div>
        <ActionTargets selected={target} disabled={locked} onSelect={setTarget} />
        <svg
          viewBox="0 0 900 500"
          className="interactive-arena"
          role="img"
          aria-label="Space arena. Move your aiming reticle over the moving email asteroid and fire."
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            if (phase === 'aim')
              moveAim({
                x: ((e.clientX - r.left) / r.width) * 900,
                y: ((e.clientY - r.top) / r.height) * 500,
              });
          }}
          onPointerDown={fire}
        >
          <defs>
            <radialGradient id="nebula">
              <stop stopColor="#18445c" />
              <stop offset="1" stopColor="#081222" />
            </radialGradient>
          </defs>
          <rect width="900" height="500" fill="url(#nebula)" />
          {Array.from({ length: 65 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 137) % 900}
              cy={(i * 83) % 490}
              r={i % 3 === 0 ? 2 : 1}
              fill="#b3e9ff"
              opacity={0.25 + (i % 4) * 0.15}
            />
          ))}
          <ellipse
            cx="730"
            cy="100"
            rx="86"
            ry="32"
            stroke="#78a8d555"
            strokeWidth="12"
            fill="none"
            transform="rotate(-25 730 100)"
          />
          <circle cx="730" cy="100" r="49" fill="#455684" />
          <g data-testid="email-asteroid" ref={rock} transform="translate(450 195)">
            <path
              d="M-47-15L-23-46 20-42 49-15 42 26 5 48-35 29Z"
              fill="#795a71"
              stroke="#bca0bb"
              strokeWidth="3"
            />
            <circle cx="-23" cy="13" r="12" fill="#493f5b" />
            <rect x="-23" y="-18" width="48" height="32" rx="5" fill="#edf9fc" />
            <path d="M-20-14L1 2 21-14" fill="none" stroke="#2c6571" strokeWidth="4" />
          </g>
          <g
            ref={reticle}
            className="space-reticle"
            transform="translate(450 195)"
            fill="none"
            stroke="#70dcff"
            strokeWidth="3"
          >
            <circle r="31" />
            <path d="M-43 0h22m22 0h22M0-43v22m0 22v22" />
          </g>
          {phase === 'flight' && (
            <g ref={laser} transform="translate(450 435)">
              <ellipse rx="6" ry="19" fill="#c9fa68" />
              <ellipse rx="12" ry="26" fill="#c9fa6822" />
            </g>
          )}
          <g className="space-rocket" transform="translate(450 440)">
            <path d="M0-45L-32 20 0 7 32 20Z" fill="#bfdbe9" stroke="#5a9fb2" strokeWidth="3" />
            <path d="M-9 14L0 44 9 14" fill="#67e5df" />
            <circle cy="-10" r="10" fill="#13384e" />
          </g>
          <text x="450" y="488" fill="#a9d4df" textAnchor="middle" fontSize="13">
            AIM WITH MOUSE / ARROWS · CLICK OR SPACE TO FIRE
          </text>
        </svg>
        <div className="arena-status" role="status" data-outcome={outcome}>
          {phase === 'flight'
            ? outcome === 'hit'
              ? 'TARGET LOCKED! +100 ON IMPACT'
              : 'SHOT AWAY…'
            : phase === 'miss'
              ? 'MISSED! SAME EMAIL. RETRY YOUR SHOT.'
              : 'TRACK THE EMAIL ASTEROID'}
        </div>
        <div className="arena-controls">
          <Button
            disabled={disabled || !message || phase === 'flight' || phase === 'done'}
            onClick={fire}
          >
            {phase === 'miss' ? '↻ RETRY SHOT' : '🚀 FIRE LASER'}
          </Button>
          <p className="arena-hint">
            Selected action: {target.toUpperCase()}. Hit the asteroid to queue it. A miss leaves
            this email unchanged.
          </p>
        </div>
      </div>
    </div>
  );
}
